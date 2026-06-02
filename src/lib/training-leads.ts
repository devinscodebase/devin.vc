/*
  Shared training-asset lead submission.

  Used by both /api/training-lead (JSON endpoint) and
  /training/{slug}/form (HTML form POST handler). Centralizes:
    · validation
    · Sanity asset lookup
    · DB insert
    · Resend audience add  (background)
    · Devin notification email  (background)
    · User delivery email      (foreground / awaited)

  Background tasks are passed through `waitUntil` so the Cloudflare
  Worker keeps them alive after the response is returned. Without
  this they get cancelled mid-flight on Pages.
*/
import { getDb } from './db';
import { trainingLeads } from '../db/schema';
import { getResend, SENDER } from './resend';
import { sanityClient } from './sanity';
import { render } from '@react-email/components';
import { RESEND_TRAINING_AUDIENCE_ID } from 'astro:env/server';
import TrainingAssetDelivery from '../emails/training-asset-delivery';

export type LeadInput = {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  assetSlug: string;
  consent: boolean;
};

export type LeadResult =
  | { ok: true;  assetUrl: string; assetTitle: string; assetSlug: string }
  | { ok: false; error: string; status: number };

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const categoryLabels: Record<string, string> = {
  'word-list': 'Word List',
  playbook: 'Playbook',
  checklist: 'Checklist',
  template: 'Template',
  guide: 'Guide',
};

export async function submitTrainingLead(
  raw: Partial<LeadInput>,
  origin: string,
  waitUntil?: (p: Promise<unknown>) => void
): Promise<LeadResult> {
  const name      = String(raw.name      ?? '').trim();
  const email     = String(raw.email     ?? '').trim().toLowerCase();
  const company   = String(raw.company   ?? '').trim();
  const jobTitle  = String(raw.jobTitle  ?? '').trim();
  const assetSlug = String(raw.assetSlug ?? '').trim();
  const consent   = raw.consent === true || (raw.consent as any) === 'on' || raw.consent === 'true';

  if (!name || !email || !company || !jobTitle || !assetSlug) {
    return { ok: false, error: 'All fields are required.', status: 400 };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: 'Please enter a valid email address.', status: 400 };
  }
  if (!consent) {
    return { ok: false, error: 'You must agree to the Privacy Policy and Terms of Use to continue.', status: 400 };
  }
  if (!isTrainingAssetEnabled(assetSlug)) {
    return { ok: false, error: 'Training asset not found.', status: 404 };
  }

  const asset = await sanityClient.fetch(
    `*[_type == "trainingAsset" && slug.current == $slug][0]{
      title, tagline, category, "slug": slug.current,
      "termCount": count(terms),
      "groups": array::unique(terms[].group)
    }`,
    { slug: assetSlug }
  );
  if (!asset) {
    return { ok: false, error: 'Training asset not found.', status: 404 };
  }

  try {
    const db = getDb();
    await db.insert(trainingLeads).values({
      assetSlug: asset.slug,
      assetTitle: asset.title,
      name, email, company, jobTitle,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[training-lead] DB insert failed:', err);
    return { ok: false, error: 'Failed to save your details. Please try again.', status: 500 };
  }

  const firstName = name.split(' ')[0];
  const assetUrl  = `${origin}/training/${asset.slug}/words`;
  const resend    = getResend();

  const emailProps = {
    firstName,
    assetTitle:    asset.title,
    assetTagline:  asset.tagline ?? undefined,
    assetUrl,
    categoryLabel: asset.category ? categoryLabels[asset.category] || asset.category : 'Training',
    termCount:     asset.termCount ?? undefined,
    groups:        Array.isArray(asset.groups) ? asset.groups.filter(Boolean) : [],
  };
  const [emailHtml, emailText] = await Promise.all([
    render(TrainingAssetDelivery(emailProps)),
    render(TrainingAssetDelivery(emailProps), { plainText: true }),
  ]);

  // Background — audience add + notify Devin
  const audienceTask = RESEND_TRAINING_AUDIENCE_ID
    ? resend.contacts
        .create({
          audienceId: RESEND_TRAINING_AUDIENCE_ID,
          email,
          firstName,
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          unsubscribed: false,
        })
        .catch((err) => console.error('[training-lead] audience failed:', err))
    : Promise.resolve();

  const notifyTask = resend.emails
    .send({
      from: SENDER,
      to: 'me@devin.vc',
      subject: `Training lead: ${name} (${company}) - ${asset.title}`,
      text: `New training asset download:

Asset: ${asset.title} (${asset.slug})
Name: ${name}
Email: ${email}
Company: ${company}
Job Title: ${jobTitle}
`,
      headers: { 'X-Entity-Ref-ID': `training-notify-${asset.slug}-${Date.now()}` },
    })
    .catch((err) => console.error('[training-lead] notification failed:', err));

  if (waitUntil) {
    waitUntil(audienceTask);
    waitUntil(notifyTask);
  }

  // Foreground — user-facing delivery
  try {
    const delivery = await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: 'me@devin.vc',
      subject: `${firstName}, your ${asset.title}`,
      html: emailHtml,
      text: emailText,
      headers: { 'X-Entity-Ref-ID': `training-${asset.slug}-${Date.now()}` },
    });
    if ((delivery as any)?.error) {
      console.error('[training-lead] delivery email failed:', (delivery as any).error);
      return { ok: false, error: 'Could not send the email. Please try again or email me@devin.vc directly.', status: 502 };
    }
  } catch (err) {
    console.error('[training-lead] delivery email threw:', err);
    return { ok: false, error: 'Could not send the email. Please try again or email me@devin.vc directly.', status: 502 };
  }

  return { ok: true, assetUrl, assetTitle: asset.title, assetSlug: asset.slug };
}

/* ─── Soft-gate cookie helpers ────────────────────────────────────────
   The training landing page links its CTA to /form. After a successful
   submission the form route sets a per-asset cookie so the user can
   return to /words directly without re-filling. Bypassable by clearing
   cookies — by design (soft gate).
*/
export const TRAINING_GATE_COOKIE_PREFIX = 'training-asset-';
export const TRAINING_GATE_MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days

export const gateCookieName = (slug: string) =>
  `${TRAINING_GATE_COOKIE_PREFIX}${slug}`;

/* ─── Temporary asset allowlist ───────────────────────────────────────
   Only these slugs are live. The web-design and SEO word lists currently
   render the advertising list's copy/visuals, so they're hidden from the
   index and their landing/form/words routes until that's fixed. Add slugs
   back here (or delete this gate) once each asset has its own content. */
export const ENABLED_TRAINING_SLUGS = new Set(['advertising-word-list']);

export const isTrainingAssetEnabled = (slug: string | undefined) =>
  !!slug && ENABLED_TRAINING_SLUGS.has(slug);

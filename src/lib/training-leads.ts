/*
  Shared training-asset lead submission.

  Used by both /api/training-lead (JSON endpoint) and
  /training/{slug}/form (HTML form POST handler). Centralizes:
    · validation + abuse checks (honeypot, Turnstile)
    · Sanity asset lookup
    · DB insert (deduped on asset + email)
    · Resend audience add  (background, only with marketing consent)
    · Devin notification email  (background)
    · User delivery email      (background, best-effort)

  The lead is persisted and the gate unlocked BEFORE the delivery email is
  attempted, so a flaky Resend send never locks out a captured lead. All
  emails/audience work is handed to `waitUntil` so the Cloudflare Worker keeps
  them alive after the response returns; in dev (no waitUntil) they're awaited.
*/
import { eq, and } from 'drizzle-orm';
import { getDb } from './db';
import { trainingLeads } from '../db/schema';
import { getResend, SENDER } from './resend';
import { sanityClient } from './sanity';
import { verifyTurnstile } from './turnstile';
import { render } from '@react-email/components';
import { RESEND_TRAINING_AUDIENCE_ID } from 'astro:env/server';
import TrainingAssetDelivery from '../emails/training-asset-delivery';

export const SITE_URL = 'https://www.devin.vc';

// Cap free-text fields so a hostile client can't push large blobs into the DB
// or the notification email.
const MAX_FIELD_LEN = 200;

export type LeadInput = {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  assetSlug: string;
  consent: boolean;
  marketingConsent: boolean;
  /** Honeypot — must stay empty. Bots fill it; humans never see it. */
  website: string;
  /** Cloudflare Turnstile token from the widget. */
  turnstileToken: string;
};

export type LeadOptions = {
  ip?: string;
  waitUntil?: (p: Promise<unknown>) => void;
};

export type LeadResult =
  | { ok: true; assetUrl: string; assetTitle: string; assetSlug: string }
  | { ok: false; error: string; status: number };

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const clamp = (s: string) => s.slice(0, MAX_FIELD_LEN);

/** Asset category → human label. Shared by the email, words page, and landing. */
export const categoryLabels: Record<string, string> = {
  'word-list': 'Word List',
  playbook: 'Playbook',
  checklist: 'Checklist',
  template: 'Template',
  guide: 'Guide',
};

/** Slugify a group name into a stable anchor id. Single source of truth for
 *  both the landing's category links and the words page's section ids. */
export const groupSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function submitTrainingLead(
  raw: Partial<LeadInput>,
  opts: LeadOptions = {}
): Promise<LeadResult> {
  const { ip, waitUntil } = opts;
  const run = (p: Promise<unknown>) => (waitUntil ? waitUntil(p) : p);

  const name      = clamp(String(raw.name      ?? '').trim());
  const email     = clamp(String(raw.email     ?? '').trim().toLowerCase());
  const company   = clamp(String(raw.company   ?? '').trim());
  const jobTitle  = clamp(String(raw.jobTitle  ?? '').trim());
  const assetSlug = String(raw.assetSlug ?? '').trim();
  const website   = String(raw.website ?? '').trim();
  const consent   = raw.consent === true || (raw.consent as any) === 'on' || raw.consent === 'true';
  const marketingConsent =
    raw.marketingConsent === true || (raw.marketingConsent as any) === 'on' || raw.marketingConsent === 'true';

  // Honeypot: a filled hidden field means a bot. Pretend success (don't train
  // the bot) but skip every side effect.
  if (website) {
    console.warn('[training-lead] honeypot tripped — skipping side effects');
    return {
      ok: true,
      assetUrl: `/training/${assetSlug}/words`,
      assetTitle: '',
      assetSlug,
    };
  }

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

  const human = await verifyTurnstile(raw.turnstileToken, ip);
  if (!human) {
    return { ok: false, error: 'Could not verify you are human. Please try again.', status: 403 };
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

  // Persist the lead, deduped on (assetSlug, email). A resubmit re-delivers the
  // email but does not stack duplicate rows.
  try {
    const db = getDb();
    const existing = await db
      .select({ id: trainingLeads.id })
      .from(trainingLeads)
      .where(and(eq(trainingLeads.assetSlug, asset.slug), eq(trainingLeads.email, email)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(trainingLeads).values({
        assetSlug: asset.slug,
        assetTitle: asset.title,
        name, email, company, jobTitle,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[training-lead] DB insert failed:', err);
    return { ok: false, error: 'Failed to save your details. Please try again.', status: 500 };
  }

  const firstName  = name.split(' ')[0];
  const assetUrl   = `${SITE_URL}/training/${asset.slug}/words`;
  const resend     = getResend();

  // ─── Background: audience add (only with marketing consent) ───
  if (marketingConsent && RESEND_TRAINING_AUDIENCE_ID) {
    run(
      resend.contacts
        .create({
          audienceId: RESEND_TRAINING_AUDIENCE_ID,
          email,
          firstName,
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          unsubscribed: false,
        })
        .then(async (res) => {
          const contactId = (res as any)?.data?.id;
          if (!contactId) return;
          try {
            await getDb()
              .update(trainingLeads)
              .set({ resendContactId: contactId })
              .where(and(eq(trainingLeads.assetSlug, asset.slug), eq(trainingLeads.email, email)));
          } catch (err) {
            console.error('[training-lead] storing contact id failed:', err);
          }
        })
        .catch((err) => console.error('[training-lead] audience failed:', err))
    );
  }

  // ─── Background: notify Devin ───
  run(
    resend.emails
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
Marketing opt-in: ${marketingConsent ? 'yes' : 'no'}
`,
        headers: { 'X-Entity-Ref-ID': `training-notify-${asset.slug}-${Date.now()}` },
      })
      .catch((err) => console.error('[training-lead] notification failed:', err))
  );

  // ─── Background: user delivery email (best-effort — the on-page list is the
  //     primary deliverable, so a failed send never blocks the unlock) ───
  const emailProps = {
    firstName,
    assetTitle:    asset.title,
    assetTagline:  asset.tagline ?? undefined,
    assetUrl,
    categoryLabel: asset.category ? categoryLabels[asset.category] || asset.category : 'Training',
    termCount:     asset.termCount ?? undefined,
    groups:        Array.isArray(asset.groups) ? asset.groups.filter(Boolean) : [],
  };

  run(
    (async () => {
      try {
        const [emailHtml, emailText] = await Promise.all([
          render(TrainingAssetDelivery(emailProps)),
          render(TrainingAssetDelivery(emailProps), { plainText: true }),
        ]);
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
        }
      } catch (err) {
        console.error('[training-lead] delivery email threw:', err);
      }
    })()
  );

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

/** Cookie options shared by every surface that unlocks the gate. Scoped to the
 *  asset so it isn't sent on unrelated requests. */
export const gateCookieOptions = (slug: string) => ({
  path: `/training/${slug}`,
  maxAge: TRAINING_GATE_MAX_AGE_SECONDS,
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: import.meta.env.PROD,
});

/* ─── Temporary asset allowlist ───────────────────────────────────────
   Only these slugs are live. The web-design and SEO word lists currently
   render the advertising list's copy/visuals, so they're hidden from the
   index and their landing/form/words routes until that's fixed. Add slugs
   back here (or delete this gate) once each asset has its own content. */
export const ENABLED_TRAINING_SLUGS = new Set(['advertising-word-list']);

export const isTrainingAssetEnabled = (slug: string | undefined) =>
  !!slug && ENABLED_TRAINING_SLUGS.has(slug);

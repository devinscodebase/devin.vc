import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { trainingLeads } from '../../db/schema';
import { getResend, SENDER } from '../../lib/resend';
import { sanityClient } from '../../lib/sanity';
import { render } from '@react-email/components';
import { RESEND_TRAINING_AUDIENCE_ID } from 'astro:env/server';
import TrainingAssetDelivery from '../../emails/training-asset-delivery';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const company = String(body.company || '').trim();
  const jobTitle = String(body.jobTitle || '').trim();
  const assetSlug = String(body.assetSlug || '').trim();
  const consent = body.consent === true || body.consent === 'on' || body.consent === 'true';

  if (!name || !email || !company || !jobTitle || !assetSlug) {
    return json({ error: 'All fields are required' }, 400);
  }
  if (!isValidEmail(email)) {
    return json({ error: 'Please enter a valid email address' }, 400);
  }
  if (!consent) {
    return json({ error: 'You must agree to the Privacy Policy and Terms of Use to continue.' }, 400);
  }

  // Resolve asset details from Sanity (so we know the title + can build the URL)
  const asset = await sanityClient.fetch(
    `*[_type == "trainingAsset" && slug.current == $slug][0]{
      title, tagline, category, "slug": slug.current,
      "termCount": count(terms),
      "groups": array::unique(terms[].group)
    }`,
    { slug: assetSlug }
  );
  if (!asset) {
    return json({ error: 'Training asset not found' }, 404);
  }

  // Persist the lead
  try {
    const db = getDb();
    await db.insert(trainingLeads).values({
      assetSlug: asset.slug,
      assetTitle: asset.title,
      name,
      email,
      company,
      jobTitle,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[training-lead] DB insert failed:', err);
    return json({ error: 'Failed to save your details. Please try again.' }, 500);
  }

  const firstName = name.split(' ')[0];
  const origin = new URL(request.url).origin;
  const assetUrl = `${origin}/training/${asset.slug}/words`;

  // Render delivery email
  const categoryLabels: Record<string, string> = {
    'word-list': 'Word List',
    playbook: 'Playbook',
    checklist: 'Checklist',
    template: 'Template',
    guide: 'Guide',
  };
  const emailProps = {
    firstName,
    assetTitle: asset.title,
    assetTagline: asset.tagline ?? undefined,
    assetUrl,
    categoryLabel: asset.category ? categoryLabels[asset.category] || asset.category : 'Training',
    termCount: asset.termCount ?? undefined,
    groups: Array.isArray(asset.groups) ? asset.groups.filter(Boolean) : [],
  };
  const [emailHtml, emailText] = await Promise.all([
    render(TrainingAssetDelivery(emailProps)),
    render(TrainingAssetDelivery(emailProps), { plainText: true }),
  ]);

  const resend = getResend();

  // The user-facing email is required for success — await it so we can
  // surface a real error if delivery fails. The audience add and Devin
  // notification are non-blocking; we hand them to ctx.waitUntil() so the
  // Cloudflare Worker keeps them alive after we've returned the response.
  // (Without waitUntil the Worker terminates and these promises get
  // cancelled — which is exactly what was silently dropping emails.)
  const ctx = (locals as any)?.runtime?.ctx as
    | { waitUntil?: (p: Promise<unknown>) => void }
    | undefined;

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

  if (ctx?.waitUntil) {
    ctx.waitUntil(audienceTask);
    ctx.waitUntil(notifyTask);
  }

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
      return json({ error: 'Could not send the email. Please try again or email me@devin.vc directly.' }, 502);
    }
  } catch (err) {
    console.error('[training-lead] delivery email threw:', err);
    return json({ error: 'Could not send the email. Please try again or email me@devin.vc directly.' }, 502);
  }

  return json({ ok: true, assetUrl });
};

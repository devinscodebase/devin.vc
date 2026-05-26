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

export const POST: APIRoute = async ({ request }) => {
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

  if (!name || !email || !company || !jobTitle || !assetSlug) {
    return json({ error: 'All fields are required' }, 400);
  }
  if (!isValidEmail(email)) {
    return json({ error: 'Please enter a valid email address' }, 400);
  }

  // Resolve asset details from Sanity (so we know the title + can build the URL)
  const asset = await sanityClient.fetch(
    `*[_type == "trainingAsset" && slug.current == $slug][0]{
      title, tagline, "slug": slug.current
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
  const [emailHtml, emailText] = await Promise.all([
    render(TrainingAssetDelivery({ firstName, assetTitle: asset.title, assetTagline: asset.tagline ?? undefined, assetUrl })),
    render(TrainingAssetDelivery({ firstName, assetTitle: asset.title, assetTagline: asset.tagline ?? undefined, assetUrl }), { plainText: true }),
  ]);

  const resend = getResend();

  // Fire-and-forget side effects
  Promise.allSettled([
    // Add to optional training audience for nurture sequences
    RESEND_TRAINING_AUDIENCE_ID
      ? resend.contacts.create({
          audienceId: RESEND_TRAINING_AUDIENCE_ID,
          email,
          firstName,
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          unsubscribed: false,
        })
      : Promise.resolve(),
    // Deliver the asset to the requester
    resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: 'me@devin.vc',
      subject: `${firstName}, your ${asset.title}`,
      html: emailHtml,
      text: emailText,
      headers: { 'X-Entity-Ref-ID': `training-${asset.slug}-${Date.now()}` },
    }),
    // Notify Devin
    resend.emails.send({
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
    }),
  ]).then((settled) => {
    settled.forEach((r, i) => {
      if (r.status === 'rejected') {
        const labels = ['audience', 'delivery email', 'notification'];
        console.error(`[training-lead] ${labels[i]} failed:`, r.reason);
      }
    });
  });

  return json({ ok: true, assetUrl });
};

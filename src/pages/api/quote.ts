/*
  /api/quote — persists a /quote submission and sends the two follow-up
  emails. Modeled on gtm-planner.ts's structure (client computes the quote,
  server persists + emails) with training-leads.ts's honeypot + Turnstile
  spam guard layered on top, since /quote is public and will get bot
  traffic that gtm-planner.ts never had to worry about.

  ─── Contract (must match exactly — the /quote page UI is built against this) ───

  POST body (JSON):
    {
      name: string;
      email: string;
      industry: string;
      whatYouSell?: string;
      revenueBand: string;              // a REVENUE_BANDS id from pricing.ts
      selectedServiceIds: string[];     // SERVICES ids from pricing.ts, at least one
      quoteResult: QuoteResult;         // the full object from calculateQuote(), computed client-side
      website: string;                  // honeypot — must stay empty, humans never see this field
      turnstileToken: string;
    }

  Success response: 200 { ok: true }
  Failure response: 4xx/5xx { error: string }
*/
import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { quoteLeads } from '../../db/schema';
import { getResend, QUOTE_SENDER } from '../../lib/resend';
import { verifyTurnstile } from '../../lib/turnstile';
import { calculateQuote, REVENUE_BANDS, SERVICES, type QuoteResult } from '../../lib/pricing';
import { render } from '@react-email/components';
import { RESEND_QUOTE_AUDIENCE_ID } from 'astro:env/server';
import QuoteConfirmationEmail from '../../emails/quote-confirmation';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Cap free-text fields so a hostile client can't push large blobs into the
// DB or the notification email. Matches training-leads.ts's convention.
const MAX_FIELD_LEN = 200;
const clamp = (s: string) => s.slice(0, MAX_FIELD_LEN);

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const name = clamp(String(body.name ?? '').trim());
  const email = clamp(String(body.email ?? '').trim().toLowerCase());
  const industry = clamp(String(body.industry ?? '').trim());
  const whatYouSell = clamp(String(body.whatYouSell ?? '').trim());
  const revenueBandId = String(body.revenueBand ?? '').trim();
  const selectedServiceIds: string[] = Array.isArray(body.selectedServiceIds)
    ? body.selectedServiceIds.filter((id: unknown) => typeof id === 'string')
    : [];
  const clientQuoteResult = body.quoteResult as QuoteResult | undefined;
  const website = String(body.website ?? '').trim();

  // Honeypot: a filled hidden field means a bot. Pretend success (don't train
  // the bot) but skip every side effect.
  if (website) {
    console.warn('[quote] honeypot tripped — skipping side effects');
    return json({ ok: true });
  }

  if (
    !name ||
    !email ||
    !industry ||
    !revenueBandId ||
    selectedServiceIds.length === 0 ||
    !clientQuoteResult
  ) {
    return json({ error: 'All fields are required.' }, 400);
  }
  if (!isValidEmail(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const band = REVENUE_BANDS.find((b) => b.id === revenueBandId);
  if (!band) {
    return json({ error: 'Unrecognized revenue band.' }, 400);
  }
  const knownServiceIds = new Set(SERVICES.map((s) => s.id));
  if (!selectedServiceIds.every((id) => knownServiceIds.has(id))) {
    return json({ error: 'Unrecognized service selection.' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? undefined;
  const human = await verifyTurnstile(body.turnstileToken, ip);
  if (!human) {
    return json({ error: 'Could not verify you are human. Please try again.' }, 403);
  }

  // ─── Server-side sanity re-derivation, not full trust ───
  // gtm-planner.ts fully trusts client-submitted `results` because its inputs
  // are numeric sliders with no meaningful tamper incentive. /quote's inputs
  // are two enum-like ids (revenueBandId, selectedServiceIds) and
  // calculateQuote() is a cheap, pure, deterministic function — recomputing it
  // server-side costs nothing and closes an obvious "edit the POST body to
  // lower the price" vector. We don't hard-reject a mismatch, though: a
  // legitimate client running a slightly stale cached copy of pricing.ts
  // should not get a 400 for it. Instead we log the discrepancy and use the
  // server-recomputed numbers for persistence and email, so the number a lead
  // is quoted always matches this deploy's pricing.ts, never a stale client's.
  const serverQuoteResult = calculateQuote(selectedServiceIds, revenueBandId);
  if (
    serverQuoteResult.projectTotal !== clientQuoteResult.projectTotal ||
    serverQuoteResult.monthlyTotal !== clientQuoteResult.monthlyTotal
  ) {
    console.warn(
      '[quote] client/server quote mismatch — using server-recomputed totals',
      { client: clientQuoteResult, server: serverQuoteResult }
    );
  }
  const quoteResult = serverQuoteResult;

  // Insert into DB first, same order as gtm-planner.ts.
  try {
    const db = getDb();
    await db.insert(quoteLeads).values({
      name,
      email,
      industry,
      whatYouSell: whatYouSell || null,
      revenueBand: revenueBandId,
      selectedServices: JSON.stringify(selectedServiceIds),
      projectTotal: quoteResult.projectTotal,
      monthlyTotal: quoteResult.monthlyTotal,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[quote] DB insert failed:', err);
    return json({ error: 'Failed to save your quote. Please try again.' }, 500);
  }

  const resend = getResend();
  const firstName = name.split(' ')[0];

  const emailProps = {
    name,
    industry,
    revenueBand: band.label,
    services: quoteResult.lineItems.map((item) => ({ label: item.label, adjustedPrice: item.adjustedPrice })),
    projectTotal: quoteResult.projectTotal,
    monthlyTotal: quoteResult.monthlyTotal,
    revenueMultiplier: quoteResult.revenueMultiplier,
    bundleMultiplier: quoteResult.bundleMultiplier,
  };

  const [confirmationHtml, confirmationText] = await Promise.all([
    render(QuoteConfirmationEmail(emailProps)),
    render(QuoteConfirmationEmail(emailProps), { plainText: true }),
  ]);

  // User-facing email is awaited so a Resend failure surfaces as a real error
  // the frontend can show. Audience add + Devin notification ride
  // ctx.waitUntil() so the Worker doesn't terminate them after we respond,
  // matching gtm-planner.ts's exact conditional pattern.
  const ctx = (locals as any)?.runtime?.ctx as
    | { waitUntil?: (p: Promise<unknown>) => void }
    | undefined;

  const audienceTask = RESEND_QUOTE_AUDIENCE_ID
    ? resend.contacts
        .create({
          audienceId: RESEND_QUOTE_AUDIENCE_ID,
          email,
          firstName,
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          unsubscribed: false,
        })
        .catch((err) => console.error('[quote] audience failed:', err))
    : Promise.resolve();

  const serviceLines = quoteResult.lineItems
    .map((item) => `  - ${item.label}: $${item.adjustedPrice.toLocaleString()}`)
    .join('\n');

  const notifyTask = resend.emails
    .send({
      from: QUOTE_SENDER,
      to: 'me@devin.vc',
      subject: `Quote lead: ${name} (${industry})`,
      text: `New /quote submission:

Name: ${name}
Email: ${email}
Industry: ${industry}
What they sell: ${whatYouSell || 'not provided'}
Revenue band: ${band.label}

Services:
${serviceLines}

Project total: $${quoteResult.projectTotal.toLocaleString()}
Monthly total: $${quoteResult.monthlyTotal.toLocaleString()}`,
      headers: { 'X-Entity-Ref-ID': `quote-notify-${Date.now()}` },
    })
    .catch((err) => console.error('[quote] notification failed:', err));

  if (ctx?.waitUntil) {
    ctx.waitUntil(audienceTask);
    ctx.waitUntil(notifyTask);
  } else {
    await Promise.all([audienceTask, notifyTask]);
  }

  try {
    const delivery = await resend.emails.send({
      from: QUOTE_SENDER,
      to: email,
      replyTo: 'me@devin.vc',
      subject: `${firstName}, your price from Devin Alexander`,
      html: confirmationHtml,
      text: confirmationText,
      headers: { 'X-Entity-Ref-ID': `quote-confirmation-${Date.now()}` },
    });
    if ((delivery as any)?.error) {
      console.error('[quote] confirmation email failed:', (delivery as any).error);
      return json({ error: 'Could not send your quote. Please try again or email me@devin.vc directly.' }, 502);
    }
  } catch (err) {
    console.error('[quote] confirmation email threw:', err);
    return json({ error: 'Could not send your quote. Please try again or email me@devin.vc directly.' }, 502);
  }

  return json({ ok: true });
};

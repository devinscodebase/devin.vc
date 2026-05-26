import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { retentionLeads } from '../../db/schema';
import { getResend, SENDER } from '../../lib/resend';
import { render } from '@react-email/components';
import { RESEND_RETENTION_CALC_AUDIENCE_ID } from 'astro:env/server';
import RetentionResultsEmail from '../../emails/retention-results';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const { name, email, company, inputs, results } = await request.json();

  if (!name || !email || !company || !inputs || !results) {
    return json({ error: 'All fields are required' }, 400);
  }

  // Insert into DB first
  try {
    const db = getDb();
    await db.insert(retentionLeads).values({
      name,
      email,
      company,
      arr: inputs.arr,
      customers: inputs.customers,
      monthlyChurnRate: String(inputs.monthlyChurnRate),
      arpc: String(inputs.arpc),
      expansionRate: String(inputs.expansionRate),
      grossMargin: inputs.grossMargin,
      marketingSpend: inputs.marketingSpend ?? null,
      newCustomersMonth: inputs.newCustomersMonth ?? null,
      annualChurnRevenue: String(results.annualChurnRevenue),
      grr: String(results.grr),
      nrr: String(results.nrr),
      revenueGap36: String(results.revenueGap36),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[retention-calculator] DB insert failed:', err);
    return json({ error: 'Failed to save results' }, 500);
  }

  // Render email
  const [resultsHtml, resultsText] = await Promise.all([
    render(RetentionResultsEmail({ name, company, arr: inputs.arr, results })),
    render(RetentionResultsEmail({ name, company, arr: inputs.arr, results }), { plainText: true }),
  ]);

  const resend = getResend();
  const firstName = name.split(' ')[0];

  // User-facing email is awaited so Resend errors surface as a real 502.
  // Audience add + Devin notification ride ctx.waitUntil() so the Worker
  // doesn't terminate them after we respond.
  const ctx = (locals as any)?.runtime?.ctx as
    | { waitUntil?: (p: Promise<unknown>) => void }
    | undefined;

  const audienceTask = RESEND_RETENTION_CALC_AUDIENCE_ID
    ? resend.contacts
        .create({
          audienceId: RESEND_RETENTION_CALC_AUDIENCE_ID,
          email,
          firstName,
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          unsubscribed: false,
        })
        .catch((err) => console.error('[retention-calculator] audience failed:', err))
    : Promise.resolve();

  const notifyTask = resend.emails
    .send({
      from: SENDER,
      to: 'me@devin.vc',
      subject: `Retention Calculator lead: ${name} (${company})`,
      text: `New Retention Calculator submission:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nARR: $${inputs.arr.toLocaleString()}\nMonthly Churn: ${inputs.monthlyChurnRate}%\n\nNRR: ${Number(results.nrr).toFixed(1)}%\nRevenue Gap (36mo): $${Number(results.revenueGap36).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      headers: { 'X-Entity-Ref-ID': `retention-notify-${Date.now()}` },
    })
    .catch((err) => console.error('[retention-calculator] notification failed:', err));

  if (ctx?.waitUntil) {
    ctx.waitUntil(audienceTask);
    ctx.waitUntil(notifyTask);
  }

  try {
    const delivery = await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: 'me@devin.vc',
      subject: `${firstName}, your retention report for ${company}`,
      html: resultsHtml,
      text: resultsText,
      headers: { 'X-Entity-Ref-ID': `retention-results-${Date.now()}` },
    });
    if ((delivery as any)?.error) {
      console.error('[retention-calculator] results email failed:', (delivery as any).error);
      return json({ error: 'Could not send the report. Please try again or email me@devin.vc directly.' }, 502);
    }
  } catch (err) {
    console.error('[retention-calculator] results email threw:', err);
    return json({ error: 'Could not send the report. Please try again or email me@devin.vc directly.' }, 502);
  }

  return json({ ok: true });
};

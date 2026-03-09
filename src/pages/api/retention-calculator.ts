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

export const POST: APIRoute = async ({ request }) => {
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

  // Fire-and-forget: emails + audience
  const resend = getResend();
  const firstName = name.split(' ')[0];

  Promise.allSettled([
    // Add to Retention Calculator audience
    RESEND_RETENTION_CALC_AUDIENCE_ID
      ? resend.contacts.create({
          audienceId: RESEND_RETENTION_CALC_AUDIENCE_ID,
          email,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          unsubscribed: false,
        })
      : Promise.resolve(),
    // Send results email to user
    resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: 'me@devin.vc',
      subject: `${firstName}, your retention report for ${company}`,
      html: resultsHtml,
      text: resultsText,
      headers: { 'X-Entity-Ref-ID': `retention-results-${Date.now()}` },
    }),
    // Notify Devin
    resend.emails.send({
      from: SENDER,
      to: 'me@devin.vc',
      subject: `Retention Calculator lead: ${name} (${company})`,
      text: `New Retention Calculator submission:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nARR: $${inputs.arr.toLocaleString()}\nMonthly Churn: ${inputs.monthlyChurnRate}%\n\nNRR: ${Number(results.nrr).toFixed(1)}%\nRevenue Gap (36mo): $${Number(results.revenueGap36).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      headers: { 'X-Entity-Ref-ID': `retention-notify-${Date.now()}` },
    }),
  ]).then((settled) => {
    settled.forEach((r, i) => {
      if (r.status === 'rejected') {
        const labels = ['audience', 'results email', 'notification'];
        console.error(`[retention-calculator] ${labels[i]} failed:`, r.reason);
      }
    });
  });

  return json({ ok: true });
};

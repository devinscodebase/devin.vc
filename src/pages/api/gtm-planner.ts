import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { gtmLeads } from '../../db/schema';
import { getResend, SENDER } from '../../lib/resend';
import { render } from '@react-email/components';
import { RESEND_GTM_PLANNER_AUDIENCE_ID } from 'astro:env/server';
import GtmResultsEmail from '../../emails/gtm-results';

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
    await db.insert(gtmLeads).values({
      name,
      email,
      company,
      revenueTarget: inputs.revenueTarget,
      dealSize: inputs.dealSize,
      isRecurring: inputs.isRecurring,
      salesCycle: inputs.salesCycle,
      closeRate: inputs.closeRate,
      sqlToOpp: inputs.sqlToOpp,
      leadToSql: inputs.leadToSql,
      costPerLead: inputs.costPerLead,
      grossMargin: inputs.grossMargin,
      customerLifespan: inputs.customerLifespan ?? null,
      dealsPerMonth: String(results.dealsPerMonth),
      leadsPerMonth: String(results.leadsPerMonth),
      monthlyBudget: String(results.monthlyBudget),
      annualBudget: String(results.annualBudget),
      cac: String(results.cac),
      ltv: String(results.ltv),
      ltvCacRatio: String(results.ltvCacRatio),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[gtm-planner] DB insert failed:', err);
    return json({ error: 'Failed to save results' }, 500);
  }

  // Render email
  const [resultsHtml, resultsText] = await Promise.all([
    render(GtmResultsEmail({ name, company, revenueTarget: inputs.revenueTarget, isRecurring: inputs.isRecurring, results })),
    render(GtmResultsEmail({ name, company, revenueTarget: inputs.revenueTarget, isRecurring: inputs.isRecurring, results }), { plainText: true }),
  ]);

  const resend = getResend();
  const firstName = name.split(' ')[0];

  // User-facing email is awaited so Resend errors surface as a real 502.
  // Audience add + Devin notification ride ctx.waitUntil() so the Worker
  // doesn't terminate them after we respond.
  const ctx = (locals as any)?.runtime?.ctx as
    | { waitUntil?: (p: Promise<unknown>) => void }
    | undefined;

  const audienceTask = RESEND_GTM_PLANNER_AUDIENCE_ID
    ? resend.contacts
        .create({
          audienceId: RESEND_GTM_PLANNER_AUDIENCE_ID,
          email,
          firstName,
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          unsubscribed: false,
        })
        .catch((err) => console.error('[gtm-planner] audience failed:', err))
    : Promise.resolve();

  const notifyTask = resend.emails
    .send({
      from: SENDER,
      to: 'me@devin.vc',
      subject: `GTM Planner lead: ${name} (${company})`,
      text: `New GTM Planner submission:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nRevenue Target: $${inputs.revenueTarget.toLocaleString()}\nModel: ${inputs.isRecurring ? 'Recurring' : 'One-time'}\n\nLTV:CAC: ${Number(results.ltvCacRatio).toFixed(1)}:1 (${results.ltvCacHealth})\nMonthly Budget: $${Number(results.monthlyBudget).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      headers: { 'X-Entity-Ref-ID': `gtm-notify-${Date.now()}` },
    })
    .catch((err) => console.error('[gtm-planner] notification failed:', err));

  if (ctx?.waitUntil) {
    ctx.waitUntil(audienceTask);
    ctx.waitUntil(notifyTask);
  }

  try {
    const delivery = await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: 'me@devin.vc',
      subject: `${firstName}, your GTM plan for ${company}`,
      html: resultsHtml,
      text: resultsText,
      headers: { 'X-Entity-Ref-ID': `gtm-results-${Date.now()}` },
    });
    if ((delivery as any)?.error) {
      console.error('[gtm-planner] results email failed:', (delivery as any).error);
      return json({ error: 'Could not send the plan. Please try again or email me@devin.vc directly.' }, 502);
    }
  } catch (err) {
    console.error('[gtm-planner] results email threw:', err);
    return json({ error: 'Could not send the plan. Please try again or email me@devin.vc directly.' }, 502);
  }

  return json({ ok: true });
};

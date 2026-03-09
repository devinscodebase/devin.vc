import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { scorecardLeads } from '../../db/schema';
import { getResend, SENDER } from '../../lib/resend';
import { render } from '@react-email/components';
import { RESEND_SCORECARD_AUDIENCE_ID } from 'astro:env/server';
import ScorecardResultsEmail from '../../emails/scorecard-results';

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
    await db.insert(scorecardLeads).values({
      name,
      email,
      company,
      stage: inputs.stage,
      model: inputs.model,
      arr: inputs.arr,
      marketingSpend: inputs.marketingSpend,
      newCustomersMonth: inputs.newCustomersMonth,
      acv: inputs.acv,
      monthlyChurnRate: String(inputs.monthlyChurnRate),
      expansionRate: String(inputs.expansionRate),
      salesCycleLength: inputs.salesCycleLength ?? null,
      pipelineValue: inputs.pipelineValue ?? null,
      monthlyLeadVolume: inputs.monthlyLeadVolume ?? null,
      leadToCustomerRate: inputs.leadToCustomerRate != null ? String(inputs.leadToCustomerRate) : null,
      constraintId: results.constraint.id,
      constraintSeverity: results.constraint.severity,
      scoredMetricsCount: results.scoredMetricsCount,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[marketing-scorecard] DB insert failed:', err);
    return json({ error: 'Failed to save results' }, 500);
  }

  // Render email
  const [resultsHtml, resultsText] = await Promise.all([
    render(ScorecardResultsEmail({ name, company, arr: inputs.arr, stage: inputs.stage, results })),
    render(ScorecardResultsEmail({ name, company, arr: inputs.arr, stage: inputs.stage, results }), { plainText: true }),
  ]);

  // Fire-and-forget: emails + audience
  const resend = getResend();
  const firstName = name.split(' ')[0];

  Promise.allSettled([
    // Add to Scorecard audience
    RESEND_SCORECARD_AUDIENCE_ID
      ? resend.contacts.create({
          audienceId: RESEND_SCORECARD_AUDIENCE_ID,
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
      subject: `${firstName}, your marketing scorecard for ${company}`,
      html: resultsHtml,
      text: resultsText,
      headers: { 'X-Entity-Ref-ID': `scorecard-results-${Date.now()}` },
    }),
    // Notify Devin
    resend.emails.send({
      from: SENDER,
      to: 'me@devin.vc',
      subject: `Marketing Scorecard lead: ${name} (${company})`,
      text: `New Marketing Scorecard submission:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nARR: $${inputs.arr.toLocaleString()}\nStage: ${inputs.stage}\nModel: ${inputs.model}\n\nPrimary Constraint: ${results.constraint.name} (${results.constraint.severity})\nMetrics Scored: ${results.scoredMetricsCount}`,
      headers: { 'X-Entity-Ref-ID': `scorecard-notify-${Date.now()}` },
    }),
  ]).then((settled) => {
    settled.forEach((r, i) => {
      if (r.status === 'rejected') {
        const labels = ['audience', 'results email', 'notification'];
        console.error(`[marketing-scorecard] ${labels[i]} failed:`, r.reason);
      }
    });
  });

  return json({ ok: true });
};

/**
 * Renders every email template with realistic test data and sends each one
 * to a single review address via Resend.
 *
 * Usage:
 *   bun scripts/send-test-emails.mjs
 *
 * Optional override:
 *   TO=someone@example.com bun scripts/send-test-emails.mjs
 */
import { Resend } from 'resend';
import { render } from '@react-email/components';
import React from 'react';

const projectRoot = '/Users/devinalexander/Programming/devin';

const TO = process.env.TO || 'me@devin.vc';
const FROM = 'Devin Alexander <me@send.devin.vc>';
const SUBJECT_PREFIX = '[TEST]';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY (expected from .env)');
  process.exit(1);
}
const resend = new Resend(RESEND_API_KEY);

// ── Realistic test fixtures ──────────────────────────────────────────────────

const TEST_NAME = 'Devin (test)';
const TEST_EMAIL = 'tester@example.com';
const TEST_COMPANY = 'Test Industries';

const gtmResults = {
  dealsPerMonth: 2,
  dealsPerYear: 24,
  oppsPerMonth: 8,
  sqlsPerMonth: 24,
  leadsPerMonth: 120,
  leadToSqlRate: 20,
  sqlToOppRate: 33,
  closeRateVal: 25,
  monthlyBudget: 12500,
  annualBudget: 150000,
  spendPercent: 12,
  cac: 6250,
  ltv: 45000,
  ltvCacRatio: 7.2,
  ltvCacHealth: 'strong',
  cacDealPercent: 25,
  cacWarning: false,
  pipelineCoverage: 3.5,
  timeToRevenue: 4,
  rampUp: 2,
  effectiveDealValue: 25000,
};

const retentionResults = {
  annualChurnRevenue: 180000,
  replacementPercent: 65,
  netNewRevenueMonth: 12500,
  netNewRevenueHealth: 'growing',
  grr: 82,
  nrr: 108,
  grrHealth: 'healthy',
  nrrHealth: 'strong',
  projectedArr36Current: 1450000,
  projectedArr36Improved: 2180000,
  revenueGap36: 730000,
  effectiveImprovementPoints: 12,
  acquisitionCostToMatch: 95000,
  cac: 4500,
  effectiveCac: 5200,
  netCustomersShrinking: false,
  ltv: 28000,
  improvedLtv: 41000,
  ltvCacRatio: 6.2,
  improvedLtvCacRatio: 9.1,
  ltvCacHealth: 'strong',
};

const scorecardResults = {
  metrics: {
    cac: { value: 4500, score: 78, band: 'good', label: 'CAC' },
    ltv: { value: 28000, score: 82, band: 'good', label: 'LTV' },
    ltvCac: { value: 6.2, score: 88, band: 'strong', label: 'LTV / CAC' },
    grr: { value: 82, score: 65, band: 'fair', label: 'GRR' },
    nrr: { value: 108, score: 72, band: 'good', label: 'NRR' },
    paybackMonths: { value: 14, score: 60, band: 'fair', label: 'Payback' },
  },
  constraint: {
    name: 'Gross Revenue Retention',
    summary: 'GRR at 82% is below the 90% threshold for sustainable growth.',
  },
  watchList: [
    { name: 'Payback period', value: '14 months', risk: 'medium' },
    { name: 'NPS', value: '24', risk: 'low' },
  ],
  recommendations: [
    { title: 'Investigate churn drivers', detail: 'Survey lost accounts within 30 days of cancellation.' },
    { title: 'Lift onboarding rigor', detail: 'Tie first-90-day NPS to a CSM activation playbook.' },
  ],
  scoredMetricsCount: 6,
  preRevenueMode: false,
};

// ── Template registry ────────────────────────────────────────────────────────

const templates = [
  {
    file: 'booking-confirmation.tsx',
    subject: 'Booking confirmation',
    props: {
      name: TEST_NAME,
      slot: 'Wednesday, June 5 at 2:00 PM',
      timezone: 'America/New_York',
      phone: '+1 (555) 010-0042',
    },
  },
  {
    file: 'booking-notification.tsx',
    subject: 'Booking notification (admin)',
    props: {
      name: TEST_NAME,
      email: TEST_EMAIL,
      phone: '+1 (555) 010-0042',
      slot: 'Wednesday, June 5 at 2:00 PM',
      timezone: 'America/New_York',
      notes: 'Looking for help on GTM strategy for a new SaaS launch.',
    },
  },
  {
    file: 'contact-confirmation.tsx',
    subject: 'Contact confirmation',
    props: { name: TEST_NAME },
  },
  {
    file: 'contact-notification.tsx',
    subject: 'Contact notification (admin)',
    props: {
      name: TEST_NAME,
      email: TEST_EMAIL,
      message:
        'Hi Devin — testing the contact form on the new design. Wanted to see how a longer message renders to verify line-height, color contrast, and overall feel of the new email template.',
    },
  },
  {
    file: 'newsletter-welcome.tsx',
    subject: 'Newsletter welcome (double opt-in)',
    props: {
      firstName: 'Devin',
      confirmUrl: 'https://www.devin.vc/confirm?token=test-placeholder',
    },
  },
  {
    file: 'training-asset-delivery.tsx',
    subject: 'Training asset delivery — word list',
    props: {
      firstName: 'Devin',
      assetTitle: 'Advertising Word List',
      assetTagline:
        'Plain-English definitions of the words used in advertising. Covers digital ads, paid media, print, radio, TV, and out-of-home.',
      assetUrl: 'https://www.devin.vc/training/advertising-word-list/words',
      categoryLabel: 'Word List',
      termCount: 73,
      groups: [
        'The Ad Itself',
        'Digital Ad Channels',
        'Print Advertising',
        'Radio & Audio Advertising',
        'TV Advertising',
        'Audience & Targeting',
        'Ad Performance',
        'Tracking & Attribution',
        'Landing & Conversion',
      ],
    },
  },
  {
    file: 'gtm-results.tsx',
    subject: 'GTM planner results',
    props: {
      name: TEST_NAME,
      company: TEST_COMPANY,
      revenueTarget: 600000,
      isRecurring: true,
      results: gtmResults,
    },
  },
  {
    file: 'retention-results.tsx',
    subject: 'Retention calculator results',
    props: {
      name: TEST_NAME,
      company: TEST_COMPANY,
      arr: 1200000,
      results: retentionResults,
    },
  },
  {
    file: 'scorecard-results.tsx',
    subject: 'Marketing scorecard results',
    props: {
      name: TEST_NAME,
      company: TEST_COMPANY,
      arr: 1200000,
      stage: 'Growth',
      results: scorecardResults,
    },
  },
];

// ── Send loop ────────────────────────────────────────────────────────────────

console.log(`Sending ${templates.length} test emails to ${TO}\n`);

const results = [];
for (const tpl of templates) {
  const path = `${projectRoot}/src/emails/${tpl.file}`;
  try {
    const mod = await import(path);
    const Component = mod.default;
    const element = React.createElement(Component, tpl.props);
    const [html, text] = await Promise.all([
      render(element),
      render(element, { plainText: true }),
    ]);
    const res = await resend.emails.send({
      from: FROM,
      to: TO,
      subject: `${SUBJECT_PREFIX} ${tpl.subject}`,
      html,
      text,
    });
    if (res.error) {
      console.log(`✗ ${tpl.file}  →  ${res.error.message || JSON.stringify(res.error)}`);
      results.push({ tpl: tpl.file, ok: false, err: res.error });
    } else {
      console.log(`✓ ${tpl.file}  →  ${res.data?.id || 'sent'}`);
      results.push({ tpl: tpl.file, ok: true, id: res.data?.id });
    }
    // Be gentle with Resend rate limit (~2/sec default)
    await new Promise((r) => setTimeout(r, 600));
  } catch (err) {
    console.log(`✗ ${tpl.file}  →  ${err.message || err}`);
    results.push({ tpl: tpl.file, ok: false, err });
  }
}

const sent = results.filter((r) => r.ok).length;
const failed = results.length - sent;
console.log(`\nDone. ${sent} sent, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);

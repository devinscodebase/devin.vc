import { Text, Section, Hr, Link } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface GtmResults {
  dealsPerMonth: number;
  dealsPerYear: number;
  oppsPerMonth: number;
  sqlsPerMonth: number;
  leadsPerMonth: number;
  leadToSqlRate: number;
  sqlToOppRate: number;
  closeRateVal: number;
  monthlyBudget: number;
  annualBudget: number;
  spendPercent: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  ltvCacHealth: 'warning' | 'healthy' | 'strong';
  cacDealPercent: number;
  cacWarning: boolean;
  pipelineCoverage: number;
  timeToRevenue: number;
  rampUp: number;
  effectiveDealValue: number;
}

interface GtmResultsEmailProps {
  name: string;
  company: string;
  revenueTarget: number;
  isRecurring: boolean;
  results: GtmResults;
}

function fmtCurrency(n: number | null): string {
  if (n == null) return '\u2014';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) {
    const b = n / 1_000_000_000;
    return '$' + (Number.isInteger(b) ? b.toFixed(0) : b.toFixed(1)) + 'B';
  }
  if (abs >= 1_000_000) {
    const m = n / 1_000_000;
    return '$' + (Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)) + 'M';
  }
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtNum(n: number, decimals = 1): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

function fmtPercent(n: number): string {
  return n.toFixed(1) + '%';
}

export default function GtmResultsEmail({
  name,
  company,
  revenueTarget,
  isRecurring,
  results,
}: GtmResultsEmailProps) {
  const firstName = name.split(' ')[0];
  const r = results;

  const healthColor =
    r.ltvCacHealth === 'warning' ? colors.rust :
    r.ltvCacHealth === 'strong' ? colors.teal :
    colors.amber;

  const healthLabel =
    r.ltvCacHealth === 'warning' ? 'Below benchmark' :
    r.ltvCacHealth === 'healthy' ? 'Healthy' :
    'Strong';

  return (
    <Layout preview={`Your GTM plan for ${company}`}>
      <Text style={badge}>GTM PLAN</Text>
      <Text style={heading}>Your numbers, {firstName}.</Text>
      <Text style={context}>
        {company} | {fmtCurrency(revenueTarget)} annual target
        {isRecurring ? ' (recurring)' : ' (one-time)'}
      </Text>

      {/* ── Funnel ── */}
      <Section style={card}>
        <Text style={cardHeading}>FUNNEL</Text>

        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td style={funnelRow}>
              <Text style={funnelValue}>{fmtNum(r.leadsPerMonth, 0)}</Text>
              <Text style={funnelLabel}>Leads / month</Text>
            </td>
          </tr>
          <tr>
            <td style={funnelArrow}>
              <Text style={funnelRate}>{r.leadToSqlRate}% qualify</Text>
            </td>
          </tr>
          <tr>
            <td style={funnelRow}>
              <Text style={funnelValue}>{fmtNum(r.sqlsPerMonth, 0)}</Text>
              <Text style={funnelLabel}>SQLs / month</Text>
            </td>
          </tr>
          <tr>
            <td style={funnelArrow}>
              <Text style={funnelRate}>{r.sqlToOppRate}% convert</Text>
            </td>
          </tr>
          <tr>
            <td style={funnelRow}>
              <Text style={funnelValue}>{fmtNum(r.oppsPerMonth, 0)}</Text>
              <Text style={funnelLabel}>Opportunities / month</Text>
            </td>
          </tr>
          <tr>
            <td style={funnelArrow}>
              <Text style={funnelRate}>{r.closeRateVal}% close</Text>
            </td>
          </tr>
          <tr>
            <td style={funnelRow}>
              <Text style={funnelValue}>{fmtNum(r.dealsPerMonth, 1)}</Text>
              <Text style={funnelLabel}>Closed deals / month</Text>
            </td>
          </tr>
        </table>
      </Section>

      {/* ── Budget ── */}
      <Section style={card}>
        <Text style={cardHeading}>BUDGET</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtCurrency(r.monthlyBudget)}</Text>
              <Text style={metricLabel}>Monthly spend</Text>
            </td>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtCurrency(r.annualBudget)}</Text>
              <Text style={metricLabel}>Annual spend</Text>
            </td>
          </tr>
          <tr>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtPercent(r.spendPercent)}</Text>
              <Text style={metricLabel}>Of revenue target</Text>
            </td>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtCurrency(r.cac)}</Text>
              <Text style={metricLabel}>Cost per customer</Text>
            </td>
          </tr>
        </table>
      </Section>

      {/* ── Unit Economics ── */}
      <Section style={card}>
        <Text style={cardHeading}>UNIT ECONOMICS</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtCurrency(r.cac)}</Text>
              <Text style={metricLabel}>CAC</Text>
            </td>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtCurrency(r.ltv)}</Text>
              <Text style={metricLabel}>LTV</Text>
            </td>
            <td style={metricCell}>
              <Text style={{ ...metricValue, color: healthColor }}>
                {fmtNum(r.ltvCacRatio)}:1
              </Text>
              <Text style={metricLabel}>LTV:CAC -- {healthLabel}</Text>
            </td>
          </tr>
        </table>
        {r.cacWarning && (
          <Text style={warning}>
            CAC is {fmtPercent(r.cacDealPercent)} of deal size -- thin margin for error.
          </Text>
        )}
      </Section>

      {/* ── Pipeline ── */}
      <Section style={card}>
        <Text style={cardHeading}>PIPELINE</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtCurrency(r.pipelineCoverage)}</Text>
              <Text style={metricLabel}>Pipeline coverage (3.5x)</Text>
            </td>
          </tr>
          <tr>
            <td style={metricCell}>
              <Text style={metricValue}>~{fmtNum(r.timeToRevenue, 1)} months</Text>
              <Text style={metricLabel}>Time to first revenue</Text>
            </td>
          </tr>
          <tr>
            <td style={metricCell}>
              <Text style={metricValue}>~{fmtNum(r.rampUp, 1)} months</Text>
              <Text style={metricLabel}>Steady-state ramp-up</Text>
            </td>
          </tr>
        </table>
      </Section>

      <Hr style={divider} />

      {/* ── CTA ── */}
      <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <tr>
          <td align="center" style={{ padding: '12px 0 0' }}>
            <Text style={ctaHeading}>Want to turn these numbers into an actionable plan?</Text>
          </td>
        </tr>
        <tr>
          <td align="center" style={{ padding: '12px 0 0' }}>
            <Link href="https://www.devin.vc/contact" style={ctaButton}>
              Talk to Devin
            </Link>
          </td>
        </tr>
      </table>
    </Layout>
  );
}

// ── Colors ──
const colors = {
  bg: '#0a0a08',
  bgElevated: '#1a1612',
  text: '#ede8df',
  textMuted: '#a09488',
  textDim: '#6d5c48',
  accent: '#c4a47c',
  teal: '#5a8b85',
  rust: '#c87045',
  amber: '#dba85b',
  border: '#1e1a14',
};

const badge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: colors.teal,
  backgroundColor: '#142222',
  padding: '4px 10px',
  borderRadius: '4px',
  margin: '0 0 14px 0',
};

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 400,
  color: colors.text,
  lineHeight: '1.4',
  margin: '0 0 6px 0',
};

const context: React.CSSProperties = {
  fontSize: '13px',
  color: colors.textMuted,
  lineHeight: '1.5',
  margin: '0 0 24px 0',
};

const card: React.CSSProperties = {
  backgroundColor: colors.bgElevated,
  borderRadius: '10px',
  padding: '20px',
  border: `1px solid ${colors.border}`,
  marginBottom: '12px',
};

const cardHeading: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: colors.textDim,
  margin: '0 0 14px 0',
};

const funnelRow: React.CSSProperties = {
  padding: '6px 0',
};

const funnelValue: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 400,
  color: colors.text,
  margin: '0',
  lineHeight: '1.3',
};

const funnelLabel: React.CSSProperties = {
  fontSize: '12px',
  color: colors.textMuted,
  margin: '0',
};

const funnelArrow: React.CSSProperties = {
  padding: '2px 0 2px 4px',
};

const funnelRate: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textDim,
  margin: '0',
};

const metricCell: React.CSSProperties = {
  padding: '8px 12px 8px 0',
  verticalAlign: 'top',
};

const metricValue: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 400,
  color: colors.text,
  margin: '0',
  lineHeight: '1.3',
};

const metricLabel: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textMuted,
  margin: '2px 0 0 0',
};

const warning: React.CSSProperties = {
  fontSize: '12px',
  color: colors.rust,
  margin: '12px 0 0 0',
};

const divider: React.CSSProperties = {
  borderColor: colors.border,
  borderWidth: '1px 0 0 0',
  margin: '12px 0 20px',
};

const ctaHeading: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 400,
  color: colors.text,
  lineHeight: '1.4',
  margin: '0',
};

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: colors.bg,
  backgroundColor: colors.accent,
  padding: '12px 32px',
  borderRadius: '4px',
  textDecoration: 'none',
};

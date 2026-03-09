import { Text, Section, Hr, Link } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface RetentionResults {
  annualChurnRevenue: number;
  replacementPercent: number | null;
  netNewRevenueMonth: number;
  netNewRevenueHealth: 'growing' | 'treading' | 'shrinking';
  grr: number;
  nrr: number;
  grrHealth: string;
  nrrHealth: string;
  projectedArr36Current: number;
  projectedArr36Improved: number;
  revenueGap36: number;
  effectiveImprovementPoints: number;
  acquisitionCostToMatch: number | null;
  cac: number | null;
  effectiveCac: number | null;
  netCustomersShrinking: boolean;
  ltv: number;
  improvedLtv: number;
  ltvCacRatio: number | null;
  improvedLtvCacRatio: number | null;
  ltvCacHealth: string | null;
}

interface RetentionResultsEmailProps {
  name: string;
  company: string;
  arr: number;
  results: RetentionResults;
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

function fmtPercent(n: number | null): string {
  if (n == null) return '\u2014';
  return n.toFixed(1) + '%';
}

function fmtNum(n: number | null, decimals = 1): string {
  if (n == null) return '\u2014';
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

export default function RetentionResultsEmail({
  name,
  company,
  arr,
  results,
}: RetentionResultsEmailProps) {
  const firstName = name.split(' ')[0];
  const r = results;

  const grrColor = r.grrHealth === 'critical' ? colors.rust
    : r.grrHealth === 'needs_work' ? colors.amber : colors.teal;
  const nrrColor = r.nrrHealth === 'contraction' ? colors.rust
    : r.nrrHealth === 'stable' ? colors.amber
    : r.nrrHealth === 'healthy' ? colors.teal : colors.accent;

  const grrLabel = r.grrHealth === 'critical' ? 'Critical'
    : r.grrHealth === 'needs_work' ? 'Needs work' : 'Healthy';
  const nrrLabel = r.nrrHealth === 'contraction' ? 'Contraction'
    : r.nrrHealth === 'stable' ? 'Stable'
    : r.nrrHealth === 'healthy' ? 'Healthy' : 'Elite';

  const ltvHealthColor = r.ltvCacHealth === 'warning' ? colors.rust
    : r.ltvCacHealth === 'healthy' ? colors.teal : colors.accent;

  return (
    <Layout preview={`Your retention report for ${company}`}>
      <Text style={badge}>RETENTION REPORT</Text>
      <Text style={heading}>Your numbers, {firstName}.</Text>
      <Text style={context}>
        {company} | {fmtCurrency(arr)} ARR
      </Text>

      {/* Churn Tax */}
      <Section style={card}>
        <Text style={cardHeading}>CHURN TAX</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td style={metricCell}>
              <Text style={{ ...metricValue, color: colors.rust }}>{fmtCurrency(r.annualChurnRevenue)}</Text>
              <Text style={metricLabel}>Annual revenue lost</Text>
            </td>
            {r.replacementPercent != null && (
              <td style={metricCell}>
                <Text style={{ ...metricValue, color: colors.amber }}>{fmtPercent(r.replacementPercent)}</Text>
                <Text style={metricLabel}>Marketing on replacement</Text>
              </td>
            )}
          </tr>
          <tr>
            <td style={metricCell}>
              <Text style={{ ...metricValue, color: r.netNewRevenueHealth === 'shrinking' ? colors.rust : colors.teal }}>
                {fmtCurrency(r.netNewRevenueMonth)}
              </Text>
              <Text style={metricLabel}>Net new monthly revenue</Text>
            </td>
          </tr>
        </table>
      </Section>

      {/* Retention Scores */}
      <Section style={card}>
        <Text style={cardHeading}>RETENTION SCORES</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td style={metricCell}>
              <Text style={{ ...metricValue, color: grrColor }}>{fmtPercent(r.grr)}</Text>
              <Text style={metricLabel}>GRR: {grrLabel}</Text>
            </td>
            <td style={metricCell}>
              <Text style={{ ...metricValue, color: nrrColor }}>{fmtPercent(r.nrr)}</Text>
              <Text style={metricLabel}>NRR: {nrrLabel}</Text>
            </td>
          </tr>
        </table>
      </Section>

      {/* Improvement Scenario */}
      <Section style={card}>
        <Text style={cardHeading}>IMPROVEMENT SCENARIO ({r.effectiveImprovementPoints}-POINT REDUCTION)</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtCurrency(r.projectedArr36Current)}</Text>
              <Text style={metricLabel}>Current path (36mo)</Text>
            </td>
            <td style={metricCell}>
              <Text style={{ ...metricValue, color: colors.teal }}>{fmtCurrency(r.projectedArr36Improved)}</Text>
              <Text style={metricLabel}>Improved path (36mo)</Text>
            </td>
          </tr>
          <tr>
            <td style={metricCell} colSpan={2}>
              <Text style={{ ...metricValue, color: colors.accent, fontSize: '18px' }}>{fmtCurrency(r.revenueGap36)}</Text>
              <Text style={metricLabel}>Revenue gap over 3 years</Text>
            </td>
          </tr>
          {r.acquisitionCostToMatch != null && (
            <tr>
              <td style={metricCell} colSpan={2}>
                <Text style={{ ...smallNote }}>
                  To match through acquisition alone: {fmtCurrency(r.acquisitionCostToMatch)} in additional spend
                </Text>
              </td>
            </tr>
          )}
        </table>
      </Section>

      {/* Unit Economics */}
      <Section style={card}>
        <Text style={cardHeading}>UNIT ECONOMICS</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          {r.cac != null && !r.netCustomersShrinking && (
            <tr>
              <td style={metricCell}>
                <Text style={metricValue}>{fmtCurrency(r.cac)}</Text>
                <Text style={metricLabel}>Stated CAC</Text>
              </td>
              {r.effectiveCac != null && (
                <td style={metricCell}>
                  <Text style={{ ...metricValue, color: colors.rust }}>{fmtCurrency(r.effectiveCac)}</Text>
                  <Text style={metricLabel}>Effective CAC</Text>
                </td>
              )}
            </tr>
          )}
          <tr>
            <td style={metricCell}>
              <Text style={metricValue}>{fmtCurrency(r.ltv)}</Text>
              <Text style={metricLabel}>Current LTV</Text>
            </td>
            <td style={metricCell}>
              <Text style={{ ...metricValue, color: colors.teal }}>{fmtCurrency(r.improvedLtv)}</Text>
              <Text style={metricLabel}>Improved LTV</Text>
            </td>
          </tr>
          {r.ltvCacRatio != null && (
            <tr>
              <td style={metricCell}>
                <Text style={{ ...metricValue, color: ltvHealthColor }}>{fmtNum(r.ltvCacRatio)}:1</Text>
                <Text style={metricLabel}>Current LTV:CAC</Text>
              </td>
              {r.improvedLtvCacRatio != null && (
                <td style={metricCell}>
                  <Text style={{ ...metricValue, color: colors.teal }}>{fmtNum(r.improvedLtvCacRatio)}:1</Text>
                  <Text style={metricLabel}>Improved LTV:CAC</Text>
                </td>
              )}
            </tr>
          )}
        </table>
      </Section>

      <Hr style={divider} />

      {/* CTA */}
      <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <tr>
          <td align="center" style={{ padding: '12px 0 0' }}>
            <Text style={ctaHeading}>Want to build a retention strategy around these numbers?</Text>
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

// Colors
const colors = {
  bg: '#0a0a08',
  bgElevated: '#141210',
  text: '#ede8df',
  textMuted: '#a09488',
  textDim: '#6d5c48',
  accent: '#c4a47c',
  teal: '#5ba3a3',
  rust: '#b06a52',
  amber: '#c49a3c',
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

const smallNote: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textDim,
  margin: '0',
  fontStyle: 'italic',
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

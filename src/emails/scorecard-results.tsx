import { Text, Section, Hr, Link } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface MetricResult {
  value: number | null;
  health: string;
  benchmark: string;
  interpretation: string;
  scored: boolean;
}

interface Constraint {
  id: string;
  name: string;
  severity: string;
  verdict: string;
  relatedTool?: { name: string; url: string; cta: string };
}

interface WatchItem {
  metricName: string;
  formattedValue: string;
  threshold: string;
  message: string;
}

interface Recommendation {
  text: string;
}

interface ScorecardResults {
  metrics: Record<string, MetricResult>;
  constraint: Constraint;
  watchList: WatchItem[];
  recommendations: Recommendation[];
  scoredMetricsCount: number;
  preRevenueMode: boolean;
}

interface ScorecardResultsEmailProps {
  name: string;
  company: string;
  arr: number;
  stage: string;
  results: ScorecardResults;
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

function fmtRatio(n: number | null): string {
  if (n == null) return '\u2014';
  return n.toFixed(1) + ':1';
}

function fmtMonths(n: number | null): string {
  if (n == null) return '\u2014';
  const rounded = Math.round(n);
  return rounded === 1 ? '1 month' : `${rounded} months`;
}

const stageLabels: Record<string, string> = {
  pre_revenue: 'Pre-revenue',
  early: 'Early ($0\u20131M)',
  growth: 'Growth ($1M\u201310M)',
  scale: 'Scale ($10M+)',
};

const metricLabels: Record<string, string> = {
  cac: 'CAC',
  ltv: 'LTV',
  ltvCac: 'LTV:CAC',
  cacPayback: 'CAC Payback',
  marketingSpendPercent: 'Marketing Spend %',
  monthlyChurn: 'Monthly Churn',
  nrr: 'NRR',
  mer: 'MER',
  pipelineCoverage: 'Pipeline Coverage',
  pipelineVelocity: 'Pipeline Velocity',
  conversionRate: 'Conversion Rate',
};

function formatMetricValue(key: string, m: MetricResult): string {
  if (m.value == null) return '\u2014';
  switch (key) {
    case 'cac': case 'ltv': case 'pipelineVelocity': return fmtCurrency(m.value);
    case 'ltvCac': case 'mer': return fmtRatio(m.value);
    case 'cacPayback': return fmtMonths(m.value);
    case 'pipelineCoverage': return m.value.toFixed(1) + 'x';
    default: return fmtPercent(m.value);
  }
}

function healthLabel(health: string): string {
  switch (health) {
    case 'strong': case 'elite': return 'Strong';
    case 'healthy': return 'Healthy';
    case 'warning': case 'stable': return 'Watch';
    case 'critical': case 'contraction': return 'Needs Work';
    default: return '';
  }
}

export default function ScorecardResultsEmail({
  name,
  company,
  arr,
  stage,
  results,
}: ScorecardResultsEmailProps) {
  const firstName = name.split(' ')[0];
  const r = results;
  const c = r.constraint;

  const severityColor = c.severity === 'critical' ? colors.rust
    : c.severity === 'warning' ? colors.amber
    : c.severity === 'opportunity' ? colors.accent
    : colors.teal;

  return (
    <Layout preview={`Your marketing scorecard for ${company}`}>
      <Text style={badge}>EFFICIENCY SCORECARD</Text>
      <Text style={heading}>Your diagnosis, {firstName}.</Text>
      <Text style={context}>
        {company} | {fmtCurrency(arr)} ARR | {stageLabels[stage] || stage}
      </Text>

      {/* The Verdict */}
      <Section style={{ ...card, borderLeft: `3px solid ${severityColor}` }}>
        <Text style={{ ...cardHeading, color: severityColor }}>{c.name.toUpperCase()}</Text>
        <Text style={{ ...metricValue, fontSize: '13px', lineHeight: '1.6', color: colors.text }}>
          {c.verdict}
        </Text>
        {c.relatedTool && (
          <Text style={{ margin: '10px 0 0 0' }}>
            <Link href={`https://www.devin.vc${c.relatedTool.url}`} style={{ color: colors.accent, fontSize: '12px', textDecoration: 'none' }}>
              {c.relatedTool.cta}
            </Link>
          </Text>
        )}
      </Section>

      {/* Scorecard Summary */}
      <Section style={card}>
        <Text style={cardHeading}>SCORECARD</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          {Object.entries(r.metrics).map(([key, m]) => {
            if (!m.scored) return null;
            const healthColor = (m.health === 'critical' || m.health === 'contraction') ? colors.rust
              : (m.health === 'warning' || m.health === 'stable') ? colors.amber
              : colors.teal;
            return (
              <tr key={key}>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <Text style={{ ...metricLabel, margin: 0 }}>{metricLabels[key] || key}</Text>
                </td>
                <td style={{ padding: '4px 8px', verticalAlign: 'top', textAlign: 'right' as const }}>
                  <Text style={{ ...metricValue, fontSize: '13px', margin: 0 }}>{formatMetricValue(key, m)}</Text>
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top', textAlign: 'right' as const, width: '70px' }}>
                  <Text style={{ fontSize: '10px', margin: 0, color: healthColor, fontWeight: 500 }}>
                    {healthLabel(m.health)}
                  </Text>
                </td>
              </tr>
            );
          })}
        </table>
      </Section>

      {/* Watch List */}
      {r.watchList.length > 0 && (
        <Section style={card}>
          <Text style={cardHeading}>WATCH LIST</Text>
          {r.watchList.map((item, i) => (
            <Text key={i} style={{ ...smallNote, margin: i > 0 ? '6px 0 0 0' : '0' }}>
              {item.message}
            </Text>
          ))}
        </Section>
      )}

      {/* Top Recommendation */}
      {r.recommendations.length > 0 && (
        <Section style={card}>
          <Text style={cardHeading}>TOP RECOMMENDATION</Text>
          <Text style={{ fontSize: '13px', lineHeight: '1.6', color: colors.text, margin: 0 }}>
            {r.recommendations[0].text}
          </Text>
        </Section>
      )}

      <Hr style={divider} />

      {/* CTA */}
      <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <tr>
          <td align="center" style={{ padding: '12px 0 0' }}>
            <Text style={ctaHeading}>Ready to fix this?</Text>
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

import { Text, Section, Hr, Link } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface QuoteConfirmationService {
  label: string;
  adjustedPrice: number;
}

interface QuoteConfirmationEmailProps {
  name: string;
  industry: string;
  /** Human-readable revenue band label, e.g. "$500K to $2M a year" (not the band id). */
  revenueBand: string;
  services: QuoteConfirmationService[];
  projectTotal: number;
  monthlyTotal: number;
  revenueMultiplier: number;
  bundleMultiplier: number;
}

function fmtCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function QuoteConfirmationEmail({
  name,
  industry,
  revenueBand,
  services,
  projectTotal,
  monthlyTotal,
}: QuoteConfirmationEmailProps) {
  const firstName = name.split(' ')[0];
  const hasProject = projectTotal > 0;
  const hasMonthly = monthlyTotal > 0;

  return (
    <Layout preview={`${firstName}, your price from Devin Alexander`}>
      <Text style={badge}>YOUR QUOTE</Text>
      <Text style={heading}>Your price, {firstName}.</Text>
      <Text style={context}>{industry} | {revenueBand}</Text>

      {/* ── The number ── */}
      <Section style={card}>
        <Text style={cardHeading}>THE NUMBER</Text>
        {hasProject && (
          <Text style={numberLine}>
            <span style={numberValue}>{fmtCurrency(projectTotal)}</span> to start.
          </Text>
        )}
        {hasMonthly && (
          <Text style={numberLine}>
            <span style={numberValue}>{fmtCurrency(monthlyTotal)}</span> a month.
          </Text>
        )}
      </Section>

      {/* ── How this was priced ── */}
      <Section style={card}>
        <Text style={cardHeading}>HOW THIS WAS PRICED</Text>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          {services.map((service) => (
            <tr key={service.label}>
              <td style={lineLabelCell}>
                <Text style={lineLabel}>{service.label}</Text>
              </td>
              <td style={linePriceCell} align="right">
                <Text style={linePrice}>{fmtCurrency(service.adjustedPrice)}</Text>
              </td>
            </tr>
          ))}
        </table>
        <Text style={priceNote}>
          Adjusted for your revenue band ({revenueBand}) and the {services.length}{' '}
          {services.length === 1 ? 'service' : 'services'} bundled together above.
        </Text>
      </Section>

      <Text style={plain}>Answered within one business day.</Text>

      <Text style={fineprint}>
        This number is good for 30 days. Project work is half down to start, half at delivery.
        Ongoing work is billed monthly, cancel anytime with 30 days&rsquo; notice.
      </Text>

      <Hr style={divider} />

      {/* ── CTA ── */}
      <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <tr>
          <td align="center" style={{ padding: '12px 0 0' }}>
            <Text style={ctaHeading}>
              Book a call to walk through this, or wait. I will follow up directly within one
              business day either way.
            </Text>
          </td>
        </tr>
        <tr>
          <td align="center" style={{ padding: '12px 0 0' }}>
            <Link href="https://www.devin.vc/book" style={ctaButton}>
              Book a call
            </Link>
          </td>
        </tr>
      </table>

      <Text style={signoff}>Devin Alexander</Text>
    </Layout>
  );
}

// ── Colors — hex equivalents of the live dark-mode CSS tokens ──
const colors = {
  bg: '#131310',
  bgElevated: '#201f18',
  text: '#efece0',
  textMuted: '#a3a08e',
  textDim: '#5d5b4e',
  accent: '#f5e33c',
  teal: '#42c3c9',
  border: '#201f18',
};

const badge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: colors.teal,
  backgroundColor: '#182422',
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

const numberLine: React.CSSProperties = {
  fontSize: '15px',
  color: colors.text,
  margin: '0 0 6px 0',
  lineHeight: '1.4',
};

const numberValue: React.CSSProperties = {
  fontSize: '22px',
  color: colors.text,
};

const lineLabelCell: React.CSSProperties = {
  padding: '6px 0',
};

const lineLabel: React.CSSProperties = {
  fontSize: '13px',
  color: colors.textMuted,
  margin: '0',
};

const linePriceCell: React.CSSProperties = {
  padding: '6px 0',
};

const linePrice: React.CSSProperties = {
  fontSize: '13px',
  color: colors.text,
  margin: '0',
};

const priceNote: React.CSSProperties = {
  fontSize: '12px',
  color: colors.textDim,
  lineHeight: '1.5',
  margin: '10px 0 0 0',
};

const plain: React.CSSProperties = {
  fontSize: '13px',
  color: colors.textMuted,
  lineHeight: '1.5',
  margin: '0 0 12px 0',
};

const fineprint: React.CSSProperties = {
  fontSize: '12px',
  color: colors.textDim,
  lineHeight: '1.6',
  margin: '0 0 4px 0',
};

const divider: React.CSSProperties = {
  borderColor: colors.border,
  borderWidth: '1px 0 0 0',
  margin: '12px 0 20px',
};

const ctaHeading: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 400,
  color: colors.text,
  lineHeight: '1.5',
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

const signoff: React.CSSProperties = {
  fontSize: '13px',
  color: colors.textMuted,
  margin: '20px 0 0 0',
};

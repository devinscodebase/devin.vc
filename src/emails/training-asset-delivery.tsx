import { Text, Button, Section, Link, Hr } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface TrainingAssetDeliveryProps {
  firstName?: string;
  assetTitle: string;
  assetTagline?: string;
  assetUrl: string;
  categoryLabel?: string;
  termCount?: number;
  groups?: string[];
}

export default function TrainingAssetDelivery({
  firstName,
  assetTitle,
  assetTagline,
  assetUrl,
  categoryLabel = 'Training',
  termCount,
  groups,
}: TrainingAssetDeliveryProps) {
  // Compact meta: "73 terms · 9 sections · free PDF"
  const sectionCount = Array.isArray(groups) ? groups.filter(Boolean).length : 0;
  const metaParts: string[] = [];
  if (termCount && termCount > 0) metaParts.push(`${termCount} terms`);
  if (sectionCount > 1) metaParts.push(`${sectionCount} sections`);
  metaParts.push('Free PDF');

  return (
    <Layout preview={`Your ${assetTitle} is ready. Open it any time.`}>
      {/* Eyebrow */}
      <Text style={eyebrow}>{categoryLabel.toUpperCase()}</Text>

      {/* Hero title in serif */}
      <Text style={heroTitle}>{assetTitle}</Text>

      {/* Italic serif tagline */}
      {assetTagline && <Text style={tagline}>{assetTagline}</Text>}

      {/* Gradient accent rule (matches the site) */}
      <div style={accentRule} />

      {/* Meta line: term count + section list */}
      {metaParts.length > 0 && (
        <Text style={meta}>{metaParts.join('   ·   ')}</Text>
      )}

      {/* CTA */}
      <Section style={btnContainer}>
        <Button style={button} href={assetUrl}>
          Open the {categoryLabel.toLowerCase()} &nbsp;→
        </Button>
      </Section>

      <Text style={linkFallback}>
        Or paste this into your browser:{' '}
        <Link href={assetUrl} style={inlineLink}>
          {assetUrl}
        </Link>
      </Text>

      <Hr style={divider} />

      {/* Personal note */}
      <Text style={noteHeading}>
        {firstName ? `${firstName}, ` : ''}a quick note.
      </Text>
      <Text style={noteBody}>
        This is the first in a series of training assets I'm putting together.
        Built from real work, written in plain English, free to share. The page
        stays current, so reference it any time, send it to your team, and grab
        the PDF from the page itself.
      </Text>
      <Text style={noteBody}>
        If something's broken or you have a request for the next one, just reply
        to this email.
      </Text>

      <Text style={signoff}>
        <span style={signoffDash}>—</span>{' '}
        <span style={signoffName}>Devin</span>
      </Text>
    </Layout>
  );
}

// ─── Site palette (matches src/styles/global.css) ───
const COLOR_TEXT = '#ede8df';
const COLOR_MUTED = '#a09488';
const COLOR_DIM = '#6d5c48';
const COLOR_BG_ELEVATED = '#1a1612';
const COLOR_ACCENT = '#c4a47c';
const COLOR_ACCENT_TEAL = '#5a8b85';

const eyebrow: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: COLOR_ACCENT,
  margin: '0 0 18px 0',
  lineHeight: '1',
};

const heroTitle: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: '34px',
  fontWeight: 400,
  letterSpacing: '-0.02em',
  lineHeight: '1.05',
  color: COLOR_TEXT,
  margin: '0 0 14px 0',
};

const tagline: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: '16px',
  lineHeight: '1.4',
  color: COLOR_MUTED,
  margin: '0 0 22px 0',
};

const accentRule: React.CSSProperties = {
  height: '2px',
  width: '56px',
  background: `linear-gradient(90deg, ${COLOR_ACCENT}, ${COLOR_ACCENT_TEAL})`,
  borderRadius: '1px',
  margin: '0 0 18px 0',
  // Email-client fallback: solid color in case gradient is dropped
  backgroundColor: COLOR_ACCENT,
};

const meta: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: COLOR_DIM,
  margin: '0 0 28px 0',
  lineHeight: '1.5',
};

const btnContainer: React.CSSProperties = {
  margin: '0 0 14px 0',
};

const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: COLOR_ACCENT,
  color: '#0a0a08',
  padding: '16px 28px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '0.02em',
  fontFamily: "'DM Sans', sans-serif",
  textDecoration: 'none',
  lineHeight: '1',
};

const linkFallback: React.CSSProperties = {
  fontSize: '11px',
  color: COLOR_DIM,
  margin: '0 0 4px 0',
  lineHeight: '1.5',
  wordBreak: 'break-all' as const,
};

const inlineLink: React.CSSProperties = {
  color: COLOR_ACCENT,
  textDecoration: 'underline',
};

const divider: React.CSSProperties = {
  borderColor: '#1e1a14',
  borderWidth: '1px 0 0 0',
  margin: '28px 0 22px 0',
};

const noteHeading: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: COLOR_TEXT,
  margin: '0 0 10px 0',
  lineHeight: '1.4',
};

const noteBody: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '1.7',
  color: COLOR_MUTED,
  margin: '0 0 12px 0',
};

const signoff: React.CSSProperties = {
  fontSize: '14px',
  margin: '18px 0 0 0',
  lineHeight: '1',
};

const signoffDash: React.CSSProperties = {
  color: COLOR_ACCENT,
};

const signoffName: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: '18px',
  color: COLOR_TEXT,
};

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Hr,
  Text,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
  /** Use a minimal footer for transactional emails (reduces spam score) */
  minimal?: boolean;
}

export function Layout({ preview, children, unsubscribeUrl, minimal }: LayoutProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @media only screen and (max-width: 600px) {
            .email-container { padding: 0 !important; }
            .email-content { padding: 24px 20px 8px !important; }
            .email-header { padding: 28px 20px 18px !important; }
            .email-accent { margin: 0 20px !important; }
            .email-hr { margin: 20px 20px !important; }
            .email-footer { padding: 0 20px 32px !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container} className="email-container">
          {/* Header */}
          <Section style={header} className="email-header">
            <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
              <tr>
                <td>
                  <Text style={logoText}>Devin Alexander</Text>
                </td>
                <td align="right">
                  <Link href="https://www.devin.vc" style={headerLink}>
                    devin.vc
                  </Link>
                </td>
              </tr>
            </table>
          </Section>

          {/* Accent line */}
          <div style={accentLine} className="email-accent" />

          {/* Content */}
          <Section style={content} className="email-content">{children}</Section>

          {/* Divider */}
          <Hr style={hr} className="email-hr" />

          {/* Footer */}
          <Section style={footer} className="email-footer">
            {!minimal && (
              <>
                <Text style={socialRow}>
                  <Link href="https://x.com/devinhelps" style={socialLink}>
                    X / Twitter
                  </Link>
                  <span style={dot}>&nbsp;&middot;&nbsp;</span>
                  <Link href="https://www.linkedin.com/in/devalexander/" style={socialLink}>
                    LinkedIn
                  </Link>
                  <span style={dot}>&nbsp;&middot;&nbsp;</span>
                  <Link href="https://www.devin.vc" style={socialLink}>
                    Website
                  </Link>
                </Text>

                <Text style={navRow}>
                  <Link href="https://www.devin.vc/work" style={navLink}>Work</Link>
                  <span style={dot}>&nbsp;&middot;&nbsp;</span>
                  <Link href="https://www.devin.vc/projects" style={navLink}>Projects</Link>
                  <span style={dot}>&nbsp;&middot;&nbsp;</span>
                  <Link href="https://www.devin.vc/journal" style={navLink}>Journal</Link>
                  <span style={dot}>&nbsp;&middot;&nbsp;</span>
                  <Link href="https://www.devin.vc/contact" style={navLink}>Contact</Link>
                </Text>
              </>
            )}

            <Text style={copyright}>
              &copy; {new Date().getFullYear()} Devin Alexander &middot; All rights reserved
            </Text>

            {unsubscribeUrl && (
              <Text style={unsubText}>
                <Link href={unsubscribeUrl} style={unsubLink}>
                  Unsubscribe from future emails
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Colors — hex equivalents of the live dark-mode CSS tokens ──
const colors = {
  bg: '#0a0a08',           // --color-bg
  surface: '#1a1612',      // --color-surface
  text: '#ede8df',         // --color-text
  textMuted: '#a09488',    // --color-text-muted
  textSubtle: '#8a7d6e',   // --color-text-subtle
  accent: '#c4a47c',       // --color-accent
  accentTeal: '#5a8b85',   // --color-accent-teal (warmer hue, joins warm system)
  border: '#2a2018',
  borderSubtle: '#1e1a14',
};

// Email clients can't reliably load web fonts. System sans stack ensures the
// brand voice (Funnel Display sans) is approximated everywhere — Apple Mail
// gets SF Pro, Outlook gets Segoe UI, Android gets Roboto. The DM Sans body
// stack stays as-is for prose since the variable Funnel Display can't ship.
const SANS_DISPLAY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const SANS_BODY =
  "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const body: React.CSSProperties = {
  backgroundColor: colors.bg,
  fontFamily: SANS_BODY,
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0',
};

const header: React.CSSProperties = {
  padding: '32px 32px 20px',
};

const logoText: React.CSSProperties = {
  fontFamily: SANS_DISPLAY,
  fontSize: '17px',
  fontWeight: 600,
  color: colors.text,
  letterSpacing: '-0.015em',
  margin: '0',
  lineHeight: '1',
};

const headerLink: React.CSSProperties = {
  fontFamily: SANS_BODY,
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: colors.textSubtle,
  textDecoration: 'none',
};

const accentLine: React.CSSProperties = {
  height: '1px',
  background: colors.accent,
  margin: '0 32px',
};

const content: React.CSSProperties = {
  padding: '28px 32px 8px',
};

const hr: React.CSSProperties = {
  borderColor: colors.borderSubtle,
  borderWidth: '1px 0 0 0',
  margin: '20px 32px',
};

const footer: React.CSSProperties = {
  padding: '0 32px 32px',
  textAlign: 'center' as const,
};

const socialRow: React.CSSProperties = {
  margin: '0 0 14px 0',
  fontSize: '12px',
  lineHeight: '1',
};

const socialLink: React.CSSProperties = {
  color: colors.accent,
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: 500,
  fontFamily: SANS_BODY,
};

const dot: React.CSSProperties = {
  color: colors.textSubtle,
  fontSize: '11px',
};

const navRow: React.CSSProperties = {
  margin: '0 0 16px 0',
  fontSize: '11px',
  lineHeight: '1',
};

const navLink: React.CSSProperties = {
  color: colors.textMuted,
  textDecoration: 'none',
  fontSize: '11px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  fontFamily: SANS_BODY,
};

const copyright: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textSubtle,
  margin: '0 0 8px 0',
  letterSpacing: '0.02em',
  fontFamily: SANS_BODY,
};

const unsubText: React.CSSProperties = {
  fontSize: '11px',
  margin: '8px 0 0 0',
};

const unsubLink: React.CSSProperties = {
  color: colors.textSubtle,
  textDecoration: 'underline',
  fontFamily: SANS_BODY,
};

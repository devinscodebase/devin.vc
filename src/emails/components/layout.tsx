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
  Img,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export function Layout({ preview, children, unsubscribeUrl }: LayoutProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Text style={logoText}>Devin Alexander</Text>
              </Column>
              <Column align="right">
                <Link href="https://www.devin.vc" style={headerLink}>
                  devin.vc
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Accent line */}
          <Section style={accentLine} />

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Divider */}
          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            {/* Social links */}
            <Text style={socialRow}>
              <Link href="https://x.com/devinmarkets" style={socialLink}>
                X / Twitter
              </Link>
              <span style={socialDot}>&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
              <Link href="https://www.linkedin.com/in/devalexander/" style={socialLink}>
                LinkedIn
              </Link>
              <span style={socialDot}>&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
              <Link href="https://www.devin.vc" style={socialLink}>
                Website
              </Link>
            </Text>

            {/* Nav links */}
            <Text style={navRow}>
              <Link href="https://www.devin.vc/work" style={navLink}>Work</Link>
              <span style={navDot}>&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
              <Link href="https://www.devin.vc/projects" style={navLink}>Projects</Link>
              <span style={navDot}>&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
              <Link href="https://www.devin.vc/journal" style={navLink}>Journal</Link>
              <span style={navDot}>&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
              <Link href="https://www.devin.vc/contact" style={navLink}>Contact</Link>
            </Text>

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

// ── Colors ──
const colors = {
  bg: '#0a0a08',
  bgElevated: '#141210',
  text: '#ede8df',
  textMuted: '#a09488',
  textDim: '#6d5c48',
  accent: '#c4a47c',
  accentTeal: '#5ba3a3',
  border: '#2a2018',
  borderSubtle: '#1e1a14',
};

// ── Styles ──
const body: React.CSSProperties = {
  backgroundColor: colors.bg,
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0',
};

const header: React.CSSProperties = {
  padding: '40px 32px 24px',
};

const logoText: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: 'italic',
  fontSize: '20px',
  color: colors.text,
  letterSpacing: '-0.02em',
  margin: '0',
};

const headerLink: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: colors.textDim,
  textDecoration: 'none',
};

const accentLine: React.CSSProperties = {
  height: '2px',
  background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentTeal})`,
  margin: '0 32px',
  borderRadius: '1px',
};

const content: React.CSSProperties = {
  padding: '32px 32px 8px',
};

const hr: React.CSSProperties = {
  borderColor: colors.borderSubtle,
  borderWidth: '1px 0 0 0',
  margin: '24px 32px',
};

const footer: React.CSSProperties = {
  padding: '0 32px 40px',
  textAlign: 'center' as const,
};

const socialRow: React.CSSProperties = {
  margin: '0 0 16px 0',
  fontSize: '12px',
};

const socialLink: React.CSSProperties = {
  color: colors.accent,
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: 500,
};

const socialDot: React.CSSProperties = {
  color: colors.textDim,
};

const navRow: React.CSSProperties = {
  margin: '0 0 20px 0',
  fontSize: '11px',
};

const navLink: React.CSSProperties = {
  color: colors.textMuted,
  textDecoration: 'none',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const navDot: React.CSSProperties = {
  color: colors.border,
  fontSize: '11px',
};

const copyright: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textDim,
  margin: '0 0 8px 0',
  letterSpacing: '0.02em',
};

const unsubText: React.CSSProperties = {
  fontSize: '11px',
  margin: '8px 0 0 0',
};

const unsubLink: React.CSSProperties = {
  color: colors.textDim,
  textDecoration: 'underline',
};

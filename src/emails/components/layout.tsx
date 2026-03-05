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
}

export function Layout({ preview, children, unsubscribeUrl }: LayoutProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={logo}>Devin Alexander</Text>
          <Section style={content}>{children}</Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              <Link href="https://devin.vc" style={footerLink}>
                devin.vc
              </Link>
            </Text>
            {unsubscribeUrl && (
              <Text style={footerText}>
                <Link href={unsubscribeUrl} style={footerLink}>
                  Unsubscribe
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: '#0a0a08',
  fontFamily: "'DM Sans', sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '48px 24px',
};

const logo: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: 'italic',
  fontSize: '20px',
  color: '#ede8df',
  letterSpacing: '-0.02em',
  margin: '0 0 32px 0',
};

const content: React.CSSProperties = {
  margin: '0',
};

const hr: React.CSSProperties = {
  borderColor: '#2a2018',
  margin: '32px 0 24px',
};

const footer: React.CSSProperties = {
  textAlign: 'center' as const,
};

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#6d5c48',
  margin: '4px 0',
};

const footerLink: React.CSSProperties = {
  color: '#6d5c48',
  textDecoration: 'underline',
};

import { Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface NewsletterWelcomeProps {
  confirmUrl: string;
  firstName?: string;
}

export default function NewsletterWelcome({
  confirmUrl,
  firstName,
}: NewsletterWelcomeProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';

  return (
    <Layout preview="Confirm your subscription">
      <Text style={heading}>{greeting} — one quick step.</Text>
      <Text style={body}>
        Thanks for signing up. Please confirm your subscription to start
        receiving updates.
      </Text>
      <Section style={btnContainer}>
        <Button style={button} href={confirmUrl}>
          Confirm subscription
        </Button>
      </Section>
      <Text style={muted}>
        If you didn't sign up, you can safely ignore this email.
      </Text>
    </Layout>
  );
}

const heading: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 500,
  color: '#ede8df',
  margin: '0 0 16px 0',
};

const body: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#a09488',
  margin: '0 0 24px 0',
};

const btnContainer: React.CSSProperties = {
  margin: '0 0 24px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#c4a47c',
  color: '#0a0a08',
  padding: '12px 28px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  fontFamily: "'DM Sans', sans-serif",
  textDecoration: 'none',
};

const muted: React.CSSProperties = {
  fontSize: '12px',
  color: '#6d5c48',
  margin: '0',
};

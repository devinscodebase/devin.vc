import { Text, Button, Section, Link, Hr } from '@react-email/components';
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
    <Layout preview="Click to confirm and you'll start receiving updates when there's something worth sharing.">
      <Text style={heading}>{greeting} — one quick step.</Text>
      <Text style={body}>
        Thanks for signing up. I write about marketing, operations, design, and
        the things I'm building — delivered when there's something worth sharing.
      </Text>
      <Text style={body}>
        Confirm your subscription to get started:
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href={confirmUrl}>
          Confirm subscription
        </Button>
      </Section>

      <Hr style={divider} />

      <Text style={whatToExpect}>What to expect</Text>
      <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <tr>
          <td style={bulletCell}>
            <Text style={bulletDot}>&#9679;</Text>
          </td>
          <td>
            <Text style={bulletText}>
              Thoughtful essays on design, leadership, and building things
            </Text>
          </td>
        </tr>
        <tr>
          <td style={bulletCell}>
            <Text style={bulletDot}>&#9679;</Text>
          </td>
          <td>
            <Text style={bulletText}>
              Behind-the-scenes of projects and experiments
            </Text>
          </td>
        </tr>
        <tr>
          <td style={bulletCell}>
            <Text style={bulletDot}>&#9679;</Text>
          </td>
          <td>
            <Text style={bulletText}>
              No spam, no fluff — only when there's something real to share
            </Text>
          </td>
        </tr>
      </table>

      <Text style={muted}>
        If you didn't sign up, you can safely ignore this email.
      </Text>
    </Layout>
  );
}

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 400,
  color: '#ede8df',
  lineHeight: '1.4',
  margin: '0 0 14px 0',
};

const body: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#a09488',
  margin: '0 0 14px 0',
};

const btnContainer: React.CSSProperties = {
  margin: '8px 0 24px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#c4a47c',
  color: '#0a0a08',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  fontFamily: "'DM Sans', sans-serif",
  textDecoration: 'none',
};

const divider: React.CSSProperties = {
  borderColor: '#1e1a14',
  borderWidth: '1px 0 0 0',
  margin: '0 0 20px 0',
};

const whatToExpect: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#6d5c48',
  margin: '0 0 12px 0',
};

const bulletCell: React.CSSProperties = {
  width: '16px',
  verticalAlign: 'top',
  paddingTop: '1px',
};

const bulletDot: React.CSSProperties = {
  fontSize: '6px',
  color: '#c4a47c',
  margin: '0',
  lineHeight: '1.7',
};

const bulletText: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '1.7',
  color: '#a09488',
  margin: '0 0 6px 0',
};

const muted: React.CSSProperties = {
  fontSize: '12px',
  color: '#6d5c48',
  margin: '18px 0 0 0',
  fontStyle: 'italic',
};

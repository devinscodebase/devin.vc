import { Text, Button, Section, Link, Hr } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface TrainingAssetDeliveryProps {
  firstName?: string;
  assetTitle: string;
  assetTagline?: string;
  assetUrl: string;
}

export default function TrainingAssetDelivery({
  firstName,
  assetTitle,
  assetTagline,
  assetUrl,
}: TrainingAssetDeliveryProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';

  return (
    <Layout preview={`Here's your ${assetTitle}. Open it any time.`}>
      <Text style={heading}>{greeting}, here's your download.</Text>
      <Text style={body}>
        Thanks for grabbing the <strong style={strong}>{assetTitle}</strong>.
        {assetTagline ? ` ${assetTagline}` : ''}
      </Text>
      <Text style={body}>
        It's hosted as a live page so it stays up to date. You can also save it
        as a PDF from the page itself.
      </Text>

      <Section style={btnContainer}>
        <Button style={button} href={assetUrl}>
          Open the {assetTitle}
        </Button>
      </Section>

      <Text style={smallLink}>
        Or copy this link: <Link href={assetUrl} style={inlineLink}>{assetUrl}</Link>
      </Text>

      <Hr style={divider} />

      <Text style={whatToExpect}>What you can do with it</Text>
      <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
        <tr>
          <td style={bulletCell}>
            <Text style={bulletDot}>&#9679;</Text>
          </td>
          <td>
            <Text style={bulletText}>
              Reference it any time. The page lives at the link above.
            </Text>
          </td>
        </tr>
        <tr>
          <td style={bulletCell}>
            <Text style={bulletDot}>&#9679;</Text>
          </td>
          <td>
            <Text style={bulletText}>
              Download it as a PDF directly from the page.
            </Text>
          </td>
        </tr>
        <tr>
          <td style={bulletCell}>
            <Text style={bulletDot}>&#9679;</Text>
          </td>
          <td>
            <Text style={bulletText}>
              Share it with your team. No paywall, no login.
            </Text>
          </td>
        </tr>
      </table>

      <Text style={muted}>
        If something's broken or you have a request for the next one, just reply
        to this email.
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

const strong: React.CSSProperties = {
  color: '#ede8df',
  fontWeight: 500,
};

const btnContainer: React.CSSProperties = {
  margin: '8px 0 20px 0',
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

const smallLink: React.CSSProperties = {
  fontSize: '12px',
  color: '#6d5c48',
  margin: '0 0 14px 0',
  wordBreak: 'break-all' as const,
};

const inlineLink: React.CSSProperties = {
  color: '#c4a47c',
  textDecoration: 'underline',
};

const divider: React.CSSProperties = {
  borderColor: '#1e1a14',
  borderWidth: '1px 0 0 0',
  margin: '8px 0 20px 0',
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

import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface ContactNotificationProps {
  name: string;
  email: string;
  message: string;
}

export default function ContactNotification({
  name,
  email,
  message,
}: ContactNotificationProps) {
  return (
    <Layout preview={`New message from ${name}`}>
      <Text style={heading}>New contact form message</Text>
      <Section style={card}>
        <Text style={label}>From</Text>
        <Text style={value}>
          {name} ({email})
        </Text>
        <Text style={label}>Message</Text>
        <Text style={value}>{message}</Text>
      </Section>
    </Layout>
  );
}

const heading: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 500,
  color: '#ede8df',
  margin: '0 0 20px 0',
};

const card: React.CSSProperties = {
  backgroundColor: '#141210',
  borderRadius: '8px',
  padding: '20px',
  borderLeft: '2px solid #c4a47c',
};

const label: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#a09488',
  margin: '0 0 4px 0',
};

const value: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#ede8df',
  margin: '0 0 16px 0',
};

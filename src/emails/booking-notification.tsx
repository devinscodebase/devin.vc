import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface BookingNotificationProps {
  name: string;
  email: string;
  slot: string;
  timezone: string;
  notes?: string;
}

export default function BookingNotification({
  name,
  email,
  slot,
  timezone,
  notes,
}: BookingNotificationProps) {
  return (
    <Layout preview={`New booking from ${name}`}>
      <Text style={heading}>New call booked</Text>
      <Section style={card}>
        <Text style={label}>Who</Text>
        <Text style={value}>
          {name} ({email})
        </Text>
        <Text style={label}>When</Text>
        <Text style={value}>
          {slot} ({timezone})
        </Text>
        {notes && (
          <>
            <Text style={label}>Notes</Text>
            <Text style={value}>{notes}</Text>
          </>
        )}
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

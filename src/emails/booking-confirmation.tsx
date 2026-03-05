import { Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface BookingConfirmationProps {
  name: string;
  slot: string;
  timezone: string;
}

export default function BookingConfirmation({
  name,
  slot,
  timezone,
}: BookingConfirmationProps) {
  return (
    <Layout preview={`You're booked — ${slot}`}>
      <Text style={heading}>You're booked, {name}.</Text>
      <Text style={body}>
        We're set for <strong style={{ color: '#ede8df' }}>{slot}</strong> ({timezone}).
        You'll receive a calendar invite shortly.
      </Text>
      <Text style={body}>
        If you need to reschedule, just reply to this email.
      </Text>
      <Text style={signoff}>— Devin</Text>
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
  margin: '0 0 16px 0',
};

const signoff: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: 'italic',
  fontSize: '14px',
  color: '#c4a47c',
  margin: '8px 0 0 0',
};

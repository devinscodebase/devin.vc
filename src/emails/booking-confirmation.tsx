import { Text, Section, Link } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface BookingConfirmationProps {
  name: string;
  slot: string;
  timezone: string;
  phone?: string;
}

export default function BookingConfirmation({
  name,
  slot,
  timezone,
  phone,
}: BookingConfirmationProps) {
  return (
    <Layout preview={`You're booked — ${slot}`}>
      <Text style={heading}>You're booked, {name}.</Text>
      <Text style={body}>
        Looking forward to our conversation. Here are the details:
      </Text>

      <Section style={card}>
        <Text style={slotText}>{slot}</Text>
        <Text style={tzText}>{timezone}</Text>
        {phone && <Text style={tzText}>Phone: {phone}</Text>}
      </Section>

      <Text style={body}>
        You'll receive a calendar invite shortly with the meeting link.
        If you need to reschedule, just reply to this email.
      </Text>

      <Section style={ctaSection}>
        <Link href="https://www.devin.vc/about" style={ctaButton}>
          Learn more about me &rarr;
        </Link>
      </Section>

      <Text style={signoff}>— Devin</Text>
    </Layout>
  );
}

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 400,
  color: '#ede8df',
  lineHeight: '1.4',
  margin: '0 0 16px 0',
};

const body: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#a09488',
  margin: '0 0 20px 0',
};

const card: React.CSSProperties = {
  backgroundColor: '#141210',
  borderRadius: '10px',
  padding: '20px 24px',
  border: '1px solid #1e1a14',
  margin: '0 0 20px 0',
};

const slotText: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 500,
  color: '#ede8df',
  margin: '0',
  lineHeight: '1.3',
};

const tzText: React.CSSProperties = {
  fontSize: '12px',
  color: '#a09488',
  margin: '2px 0 0 0',
};

const ctaSection: React.CSSProperties = {
  margin: '0 0 28px 0',
};

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '13px',
  fontWeight: 500,
  fontFamily: "'DM Sans', sans-serif",
  color: '#c4a47c',
  textDecoration: 'none',
  border: '1px solid #c4a47c',
  borderRadius: '8px',
  padding: '10px 22px',
};

const signoff: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: 'italic',
  fontSize: '15px',
  color: '#c4a47c',
  margin: '0',
};

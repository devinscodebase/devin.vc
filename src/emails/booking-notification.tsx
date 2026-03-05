import { Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface BookingNotificationProps {
  name: string;
  email: string;
  phone?: string;
  slot: string;
  timezone: string;
  notes?: string;
}

export default function BookingNotification({
  name,
  email,
  phone,
  slot,
  timezone,
  notes,
}: BookingNotificationProps) {
  return (
    <Layout preview={`New booking from ${name}`}>
      <Text style={badge}>NEW BOOKING</Text>
      <Text style={heading}>
        A call has been booked.
      </Text>

      <Section style={card}>
        {/* Detail rows */}
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td>
              <Text style={detailLabel}>Who</Text>
              <Text style={detailValue}>{name} ({email})</Text>
              {phone && <Text style={detailMeta}>{phone}</Text>}
            </td>
          </tr>
        </table>

        <Hr style={rowDivider} />

        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td>
              <Text style={detailLabel}>When</Text>
              <Text style={detailValue}>{slot}</Text>
              <Text style={detailMeta}>{timezone}</Text>
            </td>
          </tr>
        </table>

        {notes && (
          <>
            <Hr style={rowDivider} />
            <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
              <tr>
                <td>
                  <Text style={detailLabel}>Notes</Text>
                  <Text style={detailValue}>{notes}</Text>
                </td>
              </tr>
            </table>
          </>
        )}
      </Section>

      <Text style={hint}>
        A calendar invite has been sent to both parties.
      </Text>
    </Layout>
  );
}

const badge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#c4a47c',
  backgroundColor: 'rgba(196, 164, 124, 0.1)',
  padding: '4px 10px',
  borderRadius: '4px',
  margin: '0 0 16px 0',
};

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 400,
  color: '#ede8df',
  lineHeight: '1.4',
  margin: '0 0 24px 0',
};

const card: React.CSSProperties = {
  backgroundColor: '#141210',
  borderRadius: '10px',
  padding: '24px',
  border: '1px solid #1e1a14',
};

const detailLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#6d5c48',
  margin: '0 0 4px 0',
};

const detailValue: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#ede8df',
  margin: '0',
};

const detailMeta: React.CSSProperties = {
  fontSize: '12px',
  color: '#a09488',
  margin: '2px 0 0 0',
};

const rowDivider: React.CSSProperties = {
  borderColor: '#1e1a14',
  borderWidth: '1px 0 0 0',
  margin: '14px 0',
};

const hint: React.CSSProperties = {
  fontSize: '12px',
  color: '#6d5c48',
  fontStyle: 'italic',
  margin: '20px 0 0 0',
};

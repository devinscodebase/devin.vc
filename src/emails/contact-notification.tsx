import { Text, Section, Hr } from '@react-email/components';
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
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Layout preview={`${name}: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`}>
      <Text style={badge}>NEW MESSAGE</Text>
      <Text style={heading}>
        New inquiry from {name}.
      </Text>

      <Section style={card}>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
          <tr>
            <td style={avatarCell}>
              <div style={avatar}>{initials}</div>
            </td>
            <td style={senderInfo}>
              <Text style={senderName}>{name}</Text>
              <Text style={senderEmail}>{email}</Text>
            </td>
          </tr>
        </table>

        <Hr style={cardDivider} />

        <Text style={messageLabel}>Message</Text>
        <Text style={messageBody}>{message}</Text>
      </Section>

      <Text style={hint}>
        Hit reply to respond to {name.split(' ')[0]}.
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
  color: '#5a8b85',
  backgroundColor: '#142222',
  padding: '4px 10px',
  borderRadius: '4px',
  margin: '0 0 14px 0',
};

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 400,
  color: '#ede8df',
  lineHeight: '1.4',
  margin: '0 0 20px 0',
};

const card: React.CSSProperties = {
  backgroundColor: '#1a1612',
  borderRadius: '10px',
  padding: '20px',
  border: '1px solid #1e1a14',
};

const avatarCell: React.CSSProperties = {
  width: '40px',
  verticalAlign: 'top',
  paddingRight: '12px',
};

const avatar: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '20px',
  backgroundColor: '#c4a47c',
  color: '#0a0a08',
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '40px',
  textAlign: 'center' as const,
};

const senderInfo: React.CSSProperties = {
  verticalAlign: 'middle',
};

const senderName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#ede8df',
  margin: '0',
  lineHeight: '1.3',
};

const senderEmail: React.CSSProperties = {
  fontSize: '12px',
  color: '#a09488',
  margin: '2px 0 0 0',
};

const cardDivider: React.CSSProperties = {
  borderColor: '#1e1a14',
  borderWidth: '1px 0 0 0',
  margin: '16px 0',
};

const messageLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#6d5c48',
  margin: '0 0 6px 0',
};

const messageBody: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#ede8df',
  margin: '0',
};

const hint: React.CSSProperties = {
  fontSize: '12px',
  color: '#6d5c48',
  margin: '18px 0 0 0',
};

import { Text, Section, Link } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface ContactConfirmationProps {
  name: string;
}

export default function ContactConfirmation({
  name,
}: ContactConfirmationProps) {
  return (
    <Layout preview={`I've received your message and will get back to you within a day or two.`}>
      <Text style={heading}>
        Thanks for reaching out, {name}.
      </Text>
      <Text style={body}>
        I've received your message and will get back to you as soon as I can —
        usually within a day or two.
      </Text>
      <Text style={body}>
        In the meantime, feel free to explore some of my recent work or read
        through the journal:
      </Text>

      <table cellPadding="0" cellSpacing="0" style={{ width: '100%', marginBottom: '24px' }}>
        <tr>
          <td style={linkCard}>
            <Link href="https://www.devin.vc/work" style={linkTitle}>
              Work &rarr;
            </Link>
            <Text style={linkDesc}>Case studies & leadership</Text>
          </td>
          <td style={{ width: '10px' }} />
          <td style={linkCard}>
            <Link href="https://www.devin.vc/journal" style={linkTitle}>
              Journal &rarr;
            </Link>
            <Text style={linkDesc}>Writing & reflections</Text>
          </td>
        </tr>
      </table>

      <Text style={signoff}>— Devin</Text>
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

const linkCard: React.CSSProperties = {
  backgroundColor: '#141210',
  border: '1px solid #1e1a14',
  borderRadius: '8px',
  padding: '14px 16px',
  verticalAlign: 'top',
  width: '50%',
};

const linkTitle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#c4a47c',
  textDecoration: 'none',
};

const linkDesc: React.CSSProperties = {
  fontSize: '11px',
  color: '#6d5c48',
  margin: '4px 0 0 0',
};

const signoff: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: 'italic',
  fontSize: '15px',
  color: '#c4a47c',
  margin: '0',
};

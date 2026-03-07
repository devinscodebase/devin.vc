import { Text, Link } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface ContactConfirmationProps {
  name: string;
}

export default function ContactConfirmation({
  name,
}: ContactConfirmationProps) {
  return (
    <Layout preview={`Your message was received -- I'll follow up within a day or two.`} minimal>
      <Text style={heading}>
        Good to hear from you, {name}.
      </Text>
      <Text style={body}>
        Your note landed safely. Expect a personal follow-up within a day or two.
      </Text>
      <Text style={signoff}>-- Devin</Text>
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

const signoff: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: 'italic',
  fontSize: '15px',
  color: '#c4a47c',
  margin: '0',
};

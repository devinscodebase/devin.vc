import { Text } from '@react-email/components';
import * as React from 'react';
import { Layout } from './components/layout';

interface ContactConfirmationProps {
  name: string;
}

export default function ContactConfirmation({
  name,
}: ContactConfirmationProps) {
  return (
    <Layout preview="Thanks for reaching out">
      <Text style={heading}>Thanks for reaching out, {name}.</Text>
      <Text style={body}>
        I've received your message and will get back to you as soon as I can —
        usually within a day or two.
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
  margin: '0 0 24px 0',
};

const signoff: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: 'italic',
  fontSize: '14px',
  color: '#c4a47c',
  margin: '0',
};

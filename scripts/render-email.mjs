// Render the training-asset-delivery email to HTML and save it for preview.
import { render } from '@react-email/components';
import React from 'react';
import { writeFileSync } from 'node:fs';

const projectRoot = '/Users/devinalexander/Programming/devin';
const templatePath = `${projectRoot}/src/emails/training-asset-delivery.tsx`;

const mod = await import(templatePath);
const TrainingAssetDelivery = mod.default;

const html = await render(
  React.createElement(TrainingAssetDelivery, {
    firstName: 'Devin',
    assetTitle: 'Advertising Word List',
    assetTagline:
      'Plain-English definitions of the words used in advertising. Covers digital ads, paid media, print, radio, TV, and out-of-home.',
    assetUrl: 'https://www.devin.vc/training/advertising-word-list/words',
    categoryLabel: 'Word List',
    termCount: 73,
    groups: [
      'The Ad Itself',
      'Digital Ad Channels',
      'Print Advertising',
      'Radio & Audio Advertising',
      'TV Advertising',
      'Audience & Targeting',
      'Ad Performance',
      'Tracking & Attribution',
      'Landing & Conversion',
    ],
  })
);

writeFileSync('/tmp/training-email.html', html);
console.log('Wrote /tmp/training-email.html, size:', html.length);

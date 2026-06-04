import { createClient } from '@sanity/client';
import { randomUUID } from 'node:crypto';

// Backfills the landing-page copy fields (added to the trainingAsset schema) on
// the advertising-word-list document, so it keeps its current rich hero +
// showcase after the landing template stopped hardcoding advertising copy.
//
// Run:  SANITY_TOKEN=<write-token> bun scripts/seed-training-landing.mjs
//
// Idempotent: re-running just re-sets the same values. The website-design and
// seo lists intentionally get nothing here — they render the generic fallbacks
// until someone authors their hero/showcase in Studio.

const client = createClient({
  projectId: 'ka7dwvnq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
});

const ADVERTISING_ID = 'L7IjXWBdjuMzCIItc08nF8';

const heroSlides = [
  {
    visual: 'retargeting',
    term: 'Retargeting',
    note: 'You looked once and left. Now the same ad trails you from site to site, asking you back.',
  },
  {
    visual: 'click-rate',
    term: 'Click-Through Rate',
    note: 'Of everyone who sees an ad, the small slice who actually click it. Usually just a few percent.',
  },
  {
    visual: 'conversion',
    term: 'Conversion',
    note: 'A thousand people visit, most drift off, and only a handful do the thing you wanted.',
  },
  {
    visual: 'frequency',
    term: 'Frequency',
    note: 'How many times the same person sees your ad. Reach is people; frequency is repeats.',
  },
  {
    visual: 'bounce',
    term: 'Bounce Rate',
    note: 'Visitors who land on one page and leave at once, without clicking a single thing.',
  },
].map((s) => ({ _type: 'heroSlide', _key: randomUUID(), ...s }));

const landing = {
  heroHeadline: 'Advertising\nWord List',
  heroSubtitle:
    '73 of the most important terms in advertising, *fully defined and visualized*.',
  heroSlides,
  showcaseTitle: 'Some words are easier to show than to say',
  showcaseLead: 'Storyboard',
  showcasePair: ['Geo-Targeting', 'A/B Test'],
  categoriesTitle: 'From the ad itself to the sale it makes',
};

if (!process.env.SANITY_TOKEN) {
  console.error('Missing SANITY_TOKEN env var (needs write access).');
  process.exit(1);
}

const res = await client.patch(ADVERTISING_ID).set(landing).commit();
console.log(`Patched ${res._id} with landing copy.`);

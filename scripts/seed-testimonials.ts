import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ka7dwvnq',
  dataset: 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

const testimonials = [
  {
    _type: 'testimonial',
    quote:
      'Devin doesn\'t just execute — he sees around corners. He identified gaps in our GTM motion that nobody else caught and built the systems to close them.',
    name: 'Marcus Chen',
    role: 'VP of Growth',
    company: 'Andreou Enterprises',
    order: 1,
  },
  {
    _type: 'testimonial',
    quote:
      'One of the rare operators who can move between strategy and execution without losing altitude on either. Working with Devin changed how our team thinks about shipping.',
    name: 'Sarah Okafor',
    role: 'Head of Product',
    company: 'Bitmern Mining',
    order: 2,
  },
  {
    _type: 'testimonial',
    quote:
      'He brought an obsessive level of craft to everything — from our brand system to our internal dashboards. The kind of person who makes everyone around them better.',
    name: 'James Whitfield',
    role: 'CEO',
    company: 'Meridian Studios',
    order: 3,
  },
];

async function seed() {
  console.log('Seeding testimonials...\n');

  for (const t of testimonials) {
    const result = await client.create(t);
    console.log(`  ✓ Created "${t.name}" (${result._id})`);
  }

  console.log('\nDone — 3 testimonials created.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

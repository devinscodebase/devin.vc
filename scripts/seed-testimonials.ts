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
      'Devin brought a lot of depth and care to Richter related to our brand and marketing. He helped expand our reach and ensure that everything looked its best and presented us in the best way possible. I enjoyed working with him while here and would recommend his work to others.',
    name: 'Robert Cornish',
    role: 'CEO & Founder',
    company: 'Richter/RGC',
    order: 1,
  },
  {
    _type: 'testimonial',
    quote:
      'Devin did an extraordinary job driving new people into our company. His area expanded and drove in new clients to help propel The Customer Factory to new heights of profitability. He has an eye for detail complemented by his aesthetic background as an artist, which leads to crisp and direct communications in marketing. He is great to work with and brought an exciting energy while remaining focused and productive.',
    name: 'Spencer Marier',
    role: 'Project Manager',
    company: 'The Customer Factory',
    order: 2,
  },
];

async function seed() {
  // Delete existing testimonials first
  console.log('Deleting existing testimonials...');
  await client.delete({ query: '*[_type == "testimonial"]' });

  console.log('Seeding testimonials...\n');

  for (const t of testimonials) {
    const result = await client.create(t);
    console.log(`  ✓ Created "${t.name}" (${result._id})`);
  }

  console.log('\nDone — 2 testimonials created.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

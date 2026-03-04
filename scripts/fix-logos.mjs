/**
 * Patches tools missing logos — fetches from jsdelivr npm CDN, colorizes to white, uploads to Sanity.
 * Run: bun scripts/fix-logos.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ka7dwvnq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const fixes = [
  { name: 'Neon', slug: 'neon' },
  { name: 'Pipedrive', slug: 'pipedrive' },
  { name: 'Slack', slug: 'slack' },
  { name: 'Monday.com', slug: 'mondaydotcom' },
];

for (const fix of fixes) {
  const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${fix.slug}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`  ✗ ${fix.name}: ${res.status} at ${fix.slug}`);
    continue;
  }

  // The npm SVGs are black — recolor to white
  let svg = await res.text();
  svg = svg.replace(/<svg/, '<svg fill="#ffffff"');

  const buffer = Buffer.from(svg, 'utf-8');
  const asset = await client.assets.upload('image', buffer, {
    filename: `${fix.slug}.svg`,
    contentType: 'image/svg+xml',
  });

  const doc = await client.fetch(`*[_type == "tool" && name == $name][0]`, { name: fix.name });
  if (doc) {
    await client.patch(doc._id).set({
      logo: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    }).commit();
    console.log(`  ✓ Patched ${fix.name}`);
  }
}

console.log('Done.');

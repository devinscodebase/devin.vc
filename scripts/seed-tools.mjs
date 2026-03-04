/**
 * One-time script to seed tool data + SVG logos into Sanity.
 * Fetches white SVGs from Simple Icons CDN and uploads them as image assets.
 * Run: SANITY_WRITE_TOKEN=... node scripts/seed-tools.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ka7dwvnq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const tools = [
  // Design & Frontend (11)
  { name: 'Webflow', slug: 'webflow', icon: 'webflow', category: 'design-frontend', order: 1 },
  { name: 'Framer', slug: 'framer', icon: 'framer', category: 'design-frontend', order: 2 },
  { name: 'HTML', slug: 'html', icon: 'html5', category: 'design-frontend', order: 3 },
  { name: 'CSS', slug: 'css', icon: 'css3', category: 'design-frontend', order: 4 },
  { name: 'JavaScript', slug: 'javascript', icon: 'javascript', category: 'design-frontend', order: 5 },
  { name: 'React', slug: 'react', icon: 'react', category: 'design-frontend', order: 6 },
  { name: 'Next.js', slug: 'nextjs', icon: 'nextdotjs', category: 'design-frontend', order: 7 },
  { name: 'Astro', slug: 'astro', icon: 'astro', category: 'design-frontend', order: 8 },
  { name: 'Vite', slug: 'vite', icon: 'vite', category: 'design-frontend', order: 9 },
  { name: 'Svelte', slug: 'svelte', icon: 'svelte', category: 'design-frontend', order: 10 },
  { name: 'SvelteKit', slug: 'sveltekit', icon: 'svelte', category: 'design-frontend', order: 11 },

  // Backend & Data (7)
  { name: 'Bun', slug: 'bun', icon: 'bun', category: 'backend-data', order: 12 },
  { name: 'Ruby', slug: 'ruby', icon: 'ruby', category: 'backend-data', order: 13 },
  { name: 'Ruby on Rails', slug: 'ruby-on-rails', icon: 'rubyonrails', category: 'backend-data', order: 14 },
  { name: 'Supabase', slug: 'supabase', icon: 'supabase', category: 'backend-data', order: 15 },
  { name: 'Neon', slug: 'neon', icon: 'neon', category: 'backend-data', order: 16 },
  { name: 'Sanity', slug: 'sanity', icon: 'sanity', category: 'backend-data', order: 17 },
  { name: 'Pocketbase', slug: 'pocketbase', icon: 'pocketbase', category: 'backend-data', order: 18 },

  // Infrastructure & Ops (9)
  { name: 'Vercel', slug: 'vercel', icon: 'vercel', category: 'infra-ops', order: 19 },
  { name: 'Cloudflare', slug: 'cloudflare', icon: 'cloudflare', category: 'infra-ops', order: 20 },
  { name: 'Contabo', slug: 'contabo', icon: 'contabo', category: 'infra-ops', order: 21 },
  { name: 'Vultr', slug: 'vultr', icon: 'vultr', category: 'infra-ops', order: 22 },
  { name: 'HubSpot', slug: 'hubspot', icon: 'hubspot', category: 'infra-ops', order: 23 },
  { name: 'Pipedrive', slug: 'pipedrive', icon: 'pipedrive', category: 'infra-ops', order: 24 },
  { name: 'Slack', slug: 'slack', icon: 'slack', category: 'infra-ops', order: 25 },
  { name: 'Asana', slug: 'asana', icon: 'asana', category: 'infra-ops', order: 26 },
  { name: 'Monday.com', slug: 'monday', icon: 'mondaydotcom', category: 'infra-ops', order: 27 },
];

async function fetchAndUploadLogo(tool) {
  const url = `https://cdn.simpleicons.org/${tool.icon}/ffffff`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`  ⚠ Could not fetch icon for ${tool.name} (${res.status}), skipping logo`);
    return null;
  }

  const svgText = await res.text();
  const buffer = Buffer.from(svgText, 'utf-8');

  const asset = await client.assets.upload('image', buffer, {
    filename: `${tool.slug}.svg`,
    contentType: 'image/svg+xml',
  });

  console.log(`  ✓ Uploaded logo for ${tool.name} → ${asset._id}`);
  return asset._id;
}

async function seedTools() {
  console.log('Seeding tools into Sanity...\n');

  for (const tool of tools) {
    const assetId = await fetchAndUploadLogo(tool);

    const doc = {
      _type: 'tool',
      name: tool.name,
      slug: { _type: 'slug', current: tool.slug },
      category: tool.category,
      order: tool.order,
      ...(assetId && {
        logo: {
          _type: 'image',
          asset: { _type: 'reference', _ref: assetId },
        },
      }),
    };

    const result = await client.create(doc);
    console.log(`✓ Created: ${tool.name} (${result._id})\n`);
  }

  console.log('Done! All 27 tools seeded.');
}

seedTools().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

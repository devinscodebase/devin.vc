/**
 * Removes duplicate tool documents, keeping the one with a logo for each name.
 * Run: bun scripts/dedup-tools.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ka7dwvnq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const tools = await client.fetch(`*[_type == "tool"] | order(order asc) { _id, name, order, "hasLogo": defined(logo) }`);
console.log(`Found ${tools.length} total tool documents.\n`);

// Group by name
const groups = {};
for (const t of tools) {
  if (!groups[t.name]) groups[t.name] = [];
  groups[t.name].push(t);
}

const toDelete = [];
for (const [name, docs] of Object.entries(groups)) {
  if (docs.length === 1) continue;
  // Prefer the one with a logo
  const withLogo = docs.find(d => d.hasLogo);
  const keep = withLogo || docs[0];
  const dupes = docs.filter(d => d._id !== keep._id);
  toDelete.push(...dupes);
  console.log(`${name}: keeping ${keep._id}, deleting ${dupes.length} dupes`);
}

if (toDelete.length === 0) {
  console.log('No duplicates found.');
  process.exit(0);
}

console.log(`\nDeleting ${toDelete.length} duplicate documents...`);
let tx = client.transaction();
for (const d of toDelete) {
  tx = tx.delete(d._id);
}
await tx.commit();
console.log('Done. Duplicates removed.');

/**
 * One-time script to seed project data + screenshots into Sanity.
 * Run: node scripts/seed-projects.mjs
 */
import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const client = createClient({
  projectId: 'ka7dwvnq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const projects = [
  {
    name: 'Revenx',
    slug: 'revenx',
    url: 'https://revenx.com',
    category: 'B2B Marketing Platform',
    description: 'Appointment-driven digital marketing for financial advisors and insurance agents. Generates qualified, booked virtual appointments with public-sector employees — 44,000+ appointments booked annually.',
    contribution: 'Named and designed the full rebrand from B2B Business Experts to Revenx. Built the website, marketing funnels, and customer training platform. Helped scale from $30K/mo to $300K/mo.',
    tags: ['Branding', 'Web Design', 'Marketing', 'GTM'],
    accent: 'teal',
    featured: true,
    order: 1,
    screenshotFile: 'revenx.png',
  },
  {
    name: 'Equity & Help',
    slug: 'equity-and-help',
    url: 'https://equityandhelp.com',
    category: 'Real Estate Investment',
    description: 'Investment platform enabling steady returns backed by residential properties while helping working-class families achieve affordable homeownership across 32 states.',
    contribution: 'Designed and built the website and investor-facing digital presence for this socially conscious real estate platform.',
    tags: ['Web Design', 'UI/UX'],
    accent: 'amber',
    featured: false,
    order: 2,
    screenshotFile: 'equityandhelp.png',
  },
  {
    name: 'Giannis Andreou',
    slug: 'giannis-andreou',
    url: 'https://giannisandreou.com',
    category: 'Personal Brand & Education',
    description: "Personal brand and business hub for one of Greece & Cyprus's top crypto educators — 500K+ monthly views, 30+ courses, 4,000+ videos, and a portfolio of companies in the Bitcoin mining space.",
    contribution: 'Built the brand platform, marketing systems, and digital strategy as part of the Andreou Enterprises executive team.',
    tags: ['Branding', 'Web Design', 'Operations'],
    accent: 'rust',
    featured: true,
    order: 3,
    screenshotFile: 'giannisandreou.png',
  },
  {
    name: 'Bitmern Solo',
    slug: 'bitmern-solo',
    url: 'https://bitmernsolo.com',
    category: 'Crypto Mining Infrastructure',
    description: 'Solo mining pool built for everyone — miners keep entire block rewards with a flat 1% fee. Supports Bitcoin, Litecoin, Dogecoin, Bitcoin Cash, and DigiByte with real-time monitoring.',
    contribution: 'Built the entire platform from the ground up — front-end interface, back-end infrastructure, and the actual mining pool systems powering each supported chain.',
    tags: ['Full-Stack Dev', 'Infrastructure', 'Web App'],
    accent: 'teal',
    featured: true,
    order: 4,
    screenshotFile: 'bitmernsolo.png',
  },
  {
    name: 'IMAPAC',
    slug: 'imapac',
    url: 'https://imapac.com',
    category: 'Biopharma Networking & Events',
    description: 'Life sciences marketing and networking platform connecting professionals across the biopharmaceutical industry — 217 events across 150 countries, 60,000+ specialists in their database.',
    contribution: 'Designed the website and built internal systems for the team to manage their massive events database and website CMS at scale.',
    tags: ['Web Design', 'Internal Tools', 'CMS'],
    accent: 'amber',
    featured: true,
    order: 5,
    screenshotFile: 'imapac.png',
  },
  {
    name: 'Afrika National Granite',
    slug: 'afrika-national-granite',
    url: 'https://ang.co.za',
    category: 'Natural Stone Manufacturing',
    description: 'International supplier of premium granite slabs — vertically integrated from quarry to export, serving 25+ countries with polished, honed, and custom-finished stone since 2000.',
    contribution: 'Built the digital presence and marketing strategy for this South African granite manufacturer, positioning them for international reach.',
    tags: ['Web Design', 'Branding', 'Strategy'],
    accent: 'rust',
    featured: false,
    order: 6,
    screenshotFile: 'ang.png',
  },
];

const SCREENSHOT_DIR = resolve(import.meta.dirname, '../.tmp-screenshots');

async function uploadScreenshot(filename) {
  const filepath = resolve(SCREENSHOT_DIR, filename);
  if (!existsSync(filepath)) {
    console.log(`  ⚠ Screenshot not found: ${filename}, skipping image upload`);
    return null;
  }

  const buffer = readFileSync(filepath);
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType: 'image/png',
  });
  console.log(`  ✓ Uploaded ${filename} → ${asset._id}`);
  return asset._id;
}

async function seedProjects() {
  console.log('Seeding projects into Sanity...\n');

  for (const project of projects) {
    const { screenshotFile, slug, tags, ...rest } = project;

    // Upload screenshot
    const assetId = await uploadScreenshot(screenshotFile);

    const doc = {
      _type: 'project',
      ...rest,
      slug: { _type: 'slug', current: slug },
      tags,
      ...(assetId && {
        screenshot: {
          _type: 'image',
          asset: { _type: 'reference', _ref: assetId },
        },
      }),
    };

    const result = await client.create(doc);
    console.log(`✓ Created: ${project.name} (${result._id})\n`);
  }

  console.log('Done! All projects seeded.');
}

seedProjects().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

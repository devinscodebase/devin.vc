import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ka7dwvnq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
});

const descriptions = {
  'Q2ORqpzKAzd1MDE3LLNzep': 'Visual site builder for marketing pages and CMS-driven sites.',
  'EL2zMqEG6WmU5l3EVSxUrE': 'Design-to-code tool for interactive, animated websites.',
  'EL2zMqEG6WmU5l3EVSxrk5': 'The backbone of every web page — semantic, accessible markup.',
  'EL2zMqEG6WmU5l3EVSuA40': 'Styling language for layouts, animations, and responsive design.',
  'OihlZmGfhD3Tg5Wu7RF2fg': 'Dynamic scripting for interactivity, logic, and DOM manipulation.',
  'EL2zMqEG6WmU5l3EVSxxEC': 'Component library for building complex, stateful UIs.',
  'EL2zMqEG6WmU5l3EVSxzYU': 'Full-stack React framework with SSR, routing, and edge support.',
  'OihlZmGfhD3Tg5Wu7RFGEs': 'Content-first framework that ships zero JS by default.',
  'EL2zMqEG6WmU5l3EVSuJXT': 'Lightning-fast dev server and build tool for modern frontends.',
  'EL2zMqEG6WmU5l3EVSuMTY': 'Compiler-driven UI framework with minimal runtime overhead.',
  'OihlZmGfhD3Tg5Wu7RM9Xk': 'Full-stack Svelte framework with file-based routing and SSR.',
  'OihlZmGfhD3Tg5Wu7RFTsn': 'All-in-one JS runtime, bundler, and package manager — blazing fast.',
  'OihlZmGfhD3Tg5Wu7RFXvG': 'Expressive, developer-friendly language for scripting and backends.',
  'OihlZmGfhD3Tg5Wu7RFak7': 'Batteries-included web framework for rapid full-stack development.',
  'EL2zMqEG6WmU5l3EVSuZfC': 'Open-source Firebase alternative with Postgres, auth, and storage.',
  'EL2zMqEG6WmU5l3EVSyH7X': 'Serverless Postgres with branching and scale-to-zero.',
  'EL2zMqEG6WmU5l3EVSudvj': 'Structured content platform with real-time collaboration.',
  'OihlZmGfhD3Tg5Wu7RFlPj': 'Lightweight backend with auth, real-time DB, and file storage.',
  'Q2ORqpzKAzd1MDE3LLPR8h': 'Deployment platform optimized for frontend frameworks and edge.',
  'EL2zMqEG6WmU5l3EVSyOGi': 'Global CDN, DNS, and edge compute for performance and security.',
  'OihlZmGfhD3Tg5Wu7RMhEY': 'Affordable dedicated hosting for VPS and bare-metal servers.',
  'OihlZmGfhD3Tg5Wu7RMk88': 'Cloud compute and storage with global data center coverage.',
  'Q2ORqpzKAzd1MDE3LLPTOp': 'CRM and marketing automation for inbound growth.',
  'EL2zMqEG6WmU5l3EVSySvI': 'Sales CRM built for managing pipelines and closing deals.',
  'Q2ORqpzKAzd1MDE3LLPTsF': 'Team messaging platform for async communication and integrations.',
  'EL2zMqEG6WmU5l3EVSyWBz': 'Project management tool for tracking tasks and team workflows.',
  'Q2ORqpzKAzd1MDE3LLPUZb': 'Work OS for planning, tracking, and collaborating on projects.',
};

async function patchAll() {
  const entries = Object.entries(descriptions);
  console.log(`Patching ${entries.length} tools with descriptions…`);

  for (const [id, description] of entries) {
    await client.patch(id).set({ description }).commit();
    console.log(`  ✓ ${id}`);
  }

  console.log('Done.');
}

patchAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

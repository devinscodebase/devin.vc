import { createClient } from '@libsql/client/web';
import fs from 'node:fs';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  throw new Error('Missing Turso credentials');
}
const client = createClient({ url, authToken });

// Idempotent: only create if missing
await client.execute(`
  CREATE TABLE IF NOT EXISTS training_leads (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    asset_slug text NOT NULL,
    asset_title text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    company text NOT NULL,
    job_title text NOT NULL,
    resend_contact_id text,
    created_at text NOT NULL
  );
`);

const rs = await client.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='training_leads';`);
console.log('Table exists:', rs.rows.length > 0);

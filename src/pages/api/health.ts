import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { getResend } from '../../lib/resend';
import {
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  RESEND_API_KEY,
  NEWSLETTER_SECRET,
  RESEND_AUDIENCE_ID,
} from 'astro:env/server';

export const prerender = false;

export const GET: APIRoute = async () => {
  const checks: Record<string, unknown> = {};

  // 1. Check env vars
  checks.envVars = {
    TURSO_DATABASE_URL: typeof TURSO_DATABASE_URL === 'string' && TURSO_DATABASE_URL.length > 0 ? 'set' : 'MISSING',
    TURSO_AUTH_TOKEN: typeof TURSO_AUTH_TOKEN === 'string' && TURSO_AUTH_TOKEN.length > 0 ? 'set' : 'MISSING',
    RESEND_API_KEY: typeof RESEND_API_KEY === 'string' && RESEND_API_KEY.length > 0 ? 'set' : 'MISSING',
    NEWSLETTER_SECRET: typeof NEWSLETTER_SECRET === 'string' && NEWSLETTER_SECRET.length > 0 ? 'set' : 'MISSING',
    RESEND_AUDIENCE_ID: typeof RESEND_AUDIENCE_ID === 'string' && RESEND_AUDIENCE_ID.length > 0 ? 'set' : 'MISSING',
  };

  // 2. Check DB connection
  try {
    const db = getDb();
    const { sql } = await import('drizzle-orm');
    await db.run(sql`SELECT 1`);
    checks.db = 'ok';
  } catch (e) {
    checks.db = { error: e instanceof Error ? e.message : String(e) };
  }

  // 3. Check Resend client
  try {
    const resend = getResend();
    checks.resend = resend ? 'initialized' : 'null';
  } catch (e) {
    checks.resend = { error: e instanceof Error ? e.message : String(e) };
  }

  // 4. Check node:crypto
  try {
    const { createHmac } = await import('node:crypto');
    const hmac = createHmac('sha256', 'test').update('test').digest('hex');
    checks.crypto = hmac ? 'ok' : 'empty';
  } catch (e) {
    checks.crypto = { error: e instanceof Error ? e.message : String(e) };
  }

  // 5. Check react-email render
  try {
    const { render } = await import('@react-email/components');
    checks.reactEmail = typeof render === 'function' ? 'ok' : 'not a function';
  } catch (e) {
    checks.reactEmail = { error: e instanceof Error ? e.message : String(e) };
  }

  return new Response(JSON.stringify({ checks }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

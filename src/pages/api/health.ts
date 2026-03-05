import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.TURSO_DATABASE_URL = import.meta.env.TURSO_DATABASE_URL ? 'set' : 'MISSING';
  checks.TURSO_AUTH_TOKEN = import.meta.env.TURSO_AUTH_TOKEN ? 'set' : 'MISSING';
  checks.RESEND_API_KEY = import.meta.env.RESEND_API_KEY ? 'set' : 'MISSING';

  // Check DB connection
  try {
    const { createClient } = await import('@libsql/client');
    const client = createClient({
      url: import.meta.env.TURSO_DATABASE_URL,
      authToken: import.meta.env.TURSO_AUTH_TOKEN,
    });
    await client.execute('SELECT 1');
    checks.db = 'ok';
  } catch (e: any) {
    checks.db = `error: ${e.message}`;
  }

  // Check Resend
  try {
    const { Resend } = await import('resend');
    const r = new Resend(import.meta.env.RESEND_API_KEY);
    checks.resend = 'initialized';
  } catch (e: any) {
    checks.resend = `error: ${e.message}`;
  }

  return new Response(JSON.stringify(checks, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from 'astro:env/server';
import * as schema from '../db/schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}

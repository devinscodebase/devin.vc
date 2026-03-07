import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { notifications } from '../../../db/schema';
import { eq, desc, and, inArray, sql } from 'drizzle-orm';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ url }) => {
  const db = getDb();
  const type = url.searchParams.get('type'); // 'contact' | 'booking' | null (all)
  const status = url.searchParams.get('status'); // 'new' | 'read' | 'archived' | null (all)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (type === 'contact' || type === 'booking') {
    conditions.push(eq(notifications.type, type));
  }
  if (status === 'new' || status === 'read' || status === 'archived') {
    conditions.push(eq(notifications.status, status));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

export const PATCH: APIRoute = async ({ request }) => {
  const { ids, status } = await request.json();

  if (!Array.isArray(ids) || !ids.length) {
    return json({ error: 'ids array required' }, 400);
  }

  if (status !== 'read' && status !== 'archived' && status !== 'new') {
    return json({ error: 'Invalid status' }, 400);
  }

  const updates: Record<string, string | null> = { status };
  if (status === 'read') {
    updates.readAt = new Date().toISOString();
  } else if (status === 'new') {
    updates.readAt = null;
  }

  await getDb()
    .update(notifications)
    .set(updates)
    .where(inArray(notifications.id, ids));

  return json({ ok: true });
};

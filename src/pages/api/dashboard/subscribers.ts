import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { subscribers } from '../../../db/schema';
import { eq, desc, and, like, sql } from 'drizzle-orm';
import { getResend } from '../../../lib/resend';
import { RESEND_AUDIENCE_ID } from 'astro:env/server';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ url }) => {
  const db = getDb();
  const status = url.searchParams.get('status'); // 'pending' | 'confirmed' | 'unsubscribed' | null
  const search = url.searchParams.get('search')?.trim();
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status === 'pending' || status === 'confirmed' || status === 'unsubscribed') {
    conditions.push(eq(subscribers.status, status));
  }
  if (search) {
    conditions.push(like(subscribers.email, `%${search}%`));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [items, countResult, stats] = await Promise.all([
    db
      .select()
      .from(subscribers)
      .where(where)
      .orderBy(desc(subscribers.subscribedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(subscribers)
      .where(where),
    db
      .select({
        status: subscribers.status,
        count: sql<number>`count(*)`,
      })
      .from(subscribers)
      .groupBy(subscribers.status),
  ]);

  const total = countResult[0]?.count ?? 0;
  const statMap: Record<string, number> = {};
  for (const s of stats) {
    statMap[s.status] = s.count;
  }

  return json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
    stats: {
      confirmed: statMap.confirmed || 0,
      pending: statMap.pending || 0,
      unsubscribed: statMap.unsubscribed || 0,
    },
  });
};

export const DELETE: APIRoute = async ({ request }) => {
  const db = getDb();
  const { id } = await request.json();

  if (!id) {
    return json({ error: 'Subscriber id required' }, 400);
  }

  const subscriber = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.id, id))
    .get();

  if (!subscriber) {
    return json({ error: 'Subscriber not found' }, 404);
  }

  // Remove from Resend Audience if synced
  if (subscriber.resendContactId && RESEND_AUDIENCE_ID) {
    try {
      await getResend().contacts.remove({
        id: subscriber.resendContactId,
        audienceId: RESEND_AUDIENCE_ID,
      });
    } catch {
      // Non-critical
    }
  }

  await db.delete(subscribers).where(eq(subscribers.id, id));

  return json({ ok: true });
};

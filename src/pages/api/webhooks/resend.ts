import type { APIRoute } from 'astro';
import { Webhook } from 'svix';
import { getDb } from '../../../lib/db';
import { subscribers } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { RESEND_WEBHOOK_SECRET } from 'astro:env/server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_WEBHOOK_SECRET) {
    return new Response('Webhook not configured', { status: 500 });
  }

  const payload = await request.text();
  const headers = {
    'svix-id': request.headers.get('svix-id') || '',
    'svix-timestamp': request.headers.get('svix-timestamp') || '',
    'svix-signature': request.headers.get('svix-signature') || '',
  };

  // Verify signature
  let event: { type: string; data: Record<string, unknown> };
  try {
    const wh = new Webhook(RESEND_WEBHOOK_SECRET);
    event = wh.verify(payload, headers) as typeof event;
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle bounce and complaint events — auto-unsubscribe
  if (event.type === 'email.bounced' || event.type === 'email.complained') {
    const recipients = event.data.to as string[] | undefined;
    if (recipients?.length) {
      for (const email of recipients) {
        await getDb()
          .update(subscribers)
          .set({
            status: 'unsubscribed',
            unsubscribedAt: new Date().toISOString(),
          })
          .where(eq(subscribers.email, email.toLowerCase()));
      }
    }
  }

  return new Response('OK', { status: 200 });
};

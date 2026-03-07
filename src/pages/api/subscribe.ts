import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { subscribers } from '../../db/schema';
import { getResend, SENDER } from '../../lib/resend';
import { generateToken } from '../../lib/tokens';
import { eq } from 'drizzle-orm';
import { render } from '@react-email/components';
import NewsletterWelcome from '../../emails/newsletter-welcome';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, url }) => {
  const { email, firstName } = await request.json();

  if (!email || !email.includes('@')) {
    return json({ error: 'Valid email required' }, 400);
  }

  const token = generateToken(email);
  const siteUrl = url.origin;

  // Check for existing subscriber
  const db = getDb();
  const existing = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, email.toLowerCase()))
    .get();

  if (existing?.status === 'confirmed') {
    return json({ error: "You're already subscribed!" }, 409);
  }

  const confirmUrl = `${siteUrl}/confirm?token=${token}`;

  // Send double opt-in email
  const [html, text] = await Promise.all([
    render(NewsletterWelcome({ confirmUrl, firstName })),
    render(NewsletterWelcome({ confirmUrl, firstName }), { plainText: true }),
  ]);

  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${token}`;

  const { error: emailError } = await getResend().emails.send({
    from: SENDER,
    to: email,
    replyTo: 'me@devin.vc',
    subject: 'Confirm your subscription',
    html,
    text,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  if (emailError) {
    return json({ error: 'Failed to send confirmation email' }, 500);
  }

  if (existing) {
    // Re-subscribing or resending confirmation
    await db
      .update(subscribers)
      .set({
        status: 'pending',
        firstName: firstName || existing.firstName,
        token,
        subscribedAt: new Date().toISOString(),
        confirmedAt: null,
        unsubscribedAt: null,
      })
      .where(eq(subscribers.email, email.toLowerCase()));
  } else {
    await db.insert(subscribers).values({
      email: email.toLowerCase(),
      firstName: firstName || null,
      status: 'pending',
      token,
      subscribedAt: new Date().toISOString(),
    });
  }

  return json({ ok: true });
};

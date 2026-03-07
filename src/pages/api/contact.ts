import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { notifications } from '../../db/schema';
import { getResend, SENDER } from '../../lib/resend';
import { render } from '@react-email/components';
import ContactNotification from '../../emails/contact-notification';
import ContactConfirmation from '../../emails/contact-confirmation';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return json({ error: 'All fields are required' }, 400);
  }

  try {
    const [notificationHtml, notificationText, confirmationHtml, confirmationText] = await Promise.all([
      render(ContactNotification({ name, email, message })),
      render(ContactNotification({ name, email, message }), { plainText: true }),
      render(ContactConfirmation({ name })),
      render(ContactConfirmation({ name }), { plainText: true }),
    ]);

    // Log to DB first (independent of email delivery)
    const db = getDb();
    await db.insert(notifications).values({
      type: 'contact',
      fromName: name,
      fromEmail: email,
      subject: `New message from ${name}`,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    });

    // Send emails in parallel, capture results
    const resend = getResend();
    const [notify, confirm] = await Promise.allSettled([
      resend.emails.send({
        from: SENDER,
        to: 'me@devin.vc',
        replyTo: email,
        subject: `New message from ${name}`,
        html: notificationHtml,
        text: notificationText,
        headers: { 'X-Entity-Ref-ID': `contact-notify-${Date.now()}` },
      }),
      resend.emails.send({
        from: SENDER,
        to: email,
        replyTo: 'me@devin.vc',
        subject: `${name.split(' ')[0]}, your message was received`,
        html: confirmationHtml,
        text: confirmationText,
        headers: {
          'X-Entity-Ref-ID': `contact-confirm-${Date.now()}`,
        },
      }),
    ]);

    if (notify.status === 'rejected') {
      console.error('[contact] notification email failed:', notify.reason);
    }
    if (confirm.status === 'rejected') {
      console.error('[contact] confirmation email failed:', confirm.reason);
    }

    return json({ ok: true });
  } catch (err) {
    console.error('[contact] error:', err);
    return json({ error: 'Failed to send message' }, 500);
  }
};

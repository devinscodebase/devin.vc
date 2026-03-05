import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { notifications } from '../../db/schema';
import { resend, SENDER } from '../../lib/resend';
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
    const [notificationHtml, confirmationHtml] = await Promise.all([
      render(ContactNotification({ name, email, message })),
      render(ContactConfirmation({ name })),
    ]);

    // Log notification, email you, and confirm to sender — all in parallel
    await Promise.all([
      db.insert(notifications).values({
        type: 'contact',
        fromName: name,
        fromEmail: email,
        subject: `New message from ${name}`,
        message,
        status: 'new',
        createdAt: new Date().toISOString(),
      }),
      resend.emails.send({
        from: SENDER,
        to: 'hello@devin.vc',
        replyTo: email,
        subject: `New message from ${name}`,
        html: notificationHtml,
      }),
      resend.emails.send({
        from: SENDER,
        to: email,
        subject: `Thanks for reaching out, ${name.split(' ')[0]}`,
        html: confirmationHtml,
      }),
    ]);

    return json({ ok: true });
  } catch {
    return json({ error: 'Failed to send message' }, 500);
  }
};

import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { notifications } from '../../db/schema';
import { getResend, SENDER } from '../../lib/resend';
import { render } from '@react-email/components';
import { CAL_API_KEY, CAL_EVENT_TYPE_ID } from 'astro:env/server';
import BookingNotification from '../../emails/booking-notification';
import BookingConfirmation from '../../emails/booking-confirmation';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const { name, email, phone, notes, slot, timezone } = await request.json();

  if (!name || !email || !slot?.time) {
    return json({ error: 'Name, email, and time slot are required' }, 400);
  }

  const apiKey = CAL_API_KEY;
  const eventTypeId = CAL_EVENT_TYPE_ID;
  const tz = timezone || 'America/New_York';

  // Book via Cal.com if configured
  if (apiKey && eventTypeId) {
    try {
      const res = await fetch('https://api.cal.com/v2/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'cal-api-version': '2024-08-13',
        },
        body: JSON.stringify({
          eventTypeId: Number(eventTypeId),
          start: slot.time,
          attendee: { name, email, timeZone: tz },
          metadata: notes ? { notes } : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return json({ error: data?.message || 'Booking failed' }, res.status);
      }
    } catch {
      return json({ error: 'Failed to create booking' }, 500);
    }
  }

  // Format slot for display — include date and time
  const slotDate = new Date(slot.time);
  const slotLabel = slotDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: tz,
  });

  // Log notification + send emails (non-blocking to Cal.com response)
  try {
    const [notificationHtml, notificationText, confirmationHtml, confirmationText] = await Promise.all([
      render(BookingNotification({ name, email, phone, slot: slotLabel, timezone: tz, notes })),
      render(BookingNotification({ name, email, phone, slot: slotLabel, timezone: tz, notes }), { plainText: true }),
      render(BookingConfirmation({ name, slot: slotLabel, timezone: tz, phone })),
      render(BookingConfirmation({ name, slot: slotLabel, timezone: tz, phone }), { plainText: true }),
    ]);

    // Log to DB first
    const db = getDb();
    await db.insert(notifications).values({
      type: 'booking',
      fromName: name,
      fromEmail: email,
      subject: `New booking from ${name}`,
      message: notes || null,
      metadata: JSON.stringify({ slot: slotLabel, time: slot.time, timezone: tz, phone: phone || undefined }),
      status: 'new',
      createdAt: new Date().toISOString(),
    });

    // Send emails in parallel, log failures
    const resend = getResend();
    const [notify, confirm] = await Promise.allSettled([
      resend.emails.send({
        from: SENDER,
        to: 'me@devin.vc',
        replyTo: email,
        subject: `New booking from ${name}`,
        html: notificationHtml,
        text: notificationText,
      }),
      resend.emails.send({
        from: SENDER,
        to: email,
        replyTo: 'me@devin.vc',
        subject: `You're booked - ${slotLabel}`,
        html: confirmationHtml,
        text: confirmationText,
        headers: {
          'X-Entity-Ref-ID': `booking-confirm-${Date.now()}`,
        },
      }),
    ]);

    if (notify.status === 'rejected') {
      console.error('[booking] notification email failed:', notify.reason);
    }
    if (confirm.status === 'rejected') {
      console.error('[booking] confirmation email failed:', confirm.reason);
    }
  } catch (err) {
    console.error('[booking] notification/email error:', err);
    // Notification/email failure shouldn't block booking success
  }

  return json({ ok: true, mock: !apiKey || !eventTypeId || undefined });
};

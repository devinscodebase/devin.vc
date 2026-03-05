import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { notifications } from '../../db/schema';
import { resend, SENDER } from '../../lib/resend';
import { render } from '@react-email/components';
import BookingNotification from '../../emails/booking-notification';
import BookingConfirmation from '../../emails/booking-confirmation';

export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const { name, email, notes, slot, timezone } = await request.json();

  if (!name || !email || !slot?.time) {
    return json({ error: 'Name, email, and time slot are required' }, 400);
  }

  const apiKey = import.meta.env.CAL_API_KEY;
  const eventTypeId = import.meta.env.CAL_EVENT_TYPE_ID;
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

  // Format slot for display
  const slotLabel = slot.label || slot.time;

  // Log notification + send emails (non-blocking to Cal.com response)
  try {
    const [notificationHtml, confirmationHtml] = await Promise.all([
      render(BookingNotification({ name, email, slot: slotLabel, timezone: tz, notes })),
      render(BookingConfirmation({ name, slot: slotLabel, timezone: tz })),
    ]);

    await Promise.all([
      db.insert(notifications).values({
        type: 'booking',
        fromName: name,
        fromEmail: email,
        subject: `New booking from ${name}`,
        message: notes || null,
        metadata: JSON.stringify({ slot: slotLabel, time: slot.time, timezone: tz }),
        status: 'new',
        createdAt: new Date().toISOString(),
      }),
      resend.emails.send({
        from: SENDER,
        to: 'hello@devin.vc',
        replyTo: email,
        subject: `New booking from ${name}`,
        html: notificationHtml,
      }),
      resend.emails.send({
        from: SENDER,
        to: email,
        subject: `You're booked — ${slotLabel}`,
        html: confirmationHtml,
      }),
    ]);
  } catch {
    // Notification/email failure shouldn't block booking success
  }

  return json({ ok: true, mock: !apiKey || !eventTypeId || undefined });
};

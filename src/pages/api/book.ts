import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { name, email, notes, slot, timezone } = await request.json();

  if (!name || !email || !slot?.time) {
    return new Response(JSON.stringify({ error: 'Name, email, and time slot are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = import.meta.env.CAL_API_KEY;
  const eventTypeId = import.meta.env.CAL_EVENT_TYPE_ID;

  if (!apiKey || !eventTypeId) {
    // Mock success when Cal.com is not configured
    return new Response(JSON.stringify({ ok: true, mock: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
        attendee: {
          name,
          email,
          timeZone: timezone || 'America/New_York',
        },
        metadata: notes ? { notes } : undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: data?.message || 'Booking failed' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

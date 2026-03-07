import type { APIRoute } from 'astro';
import { CAL_API_KEY, CAL_EVENT_TYPE_ID } from 'astro:env/server';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get('date');
  const timezone = url.searchParams.get('timezone') || 'America/New_York';

  if (!date) {
    return new Response(JSON.stringify({ error: 'Date parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = CAL_API_KEY;
  const eventTypeId = CAL_EVENT_TYPE_ID;

  if (!apiKey || !eventTypeId) {
    // Return mock slots when Cal.com is not configured
    const mockSlots = [
      { time: `${date}T09:00:00`, label: '9:00 AM' },
      { time: `${date}T10:00:00`, label: '10:00 AM' },
      { time: `${date}T11:00:00`, label: '11:00 AM' },
      { time: `${date}T14:00:00`, label: '2:00 PM' },
      { time: `${date}T15:00:00`, label: '3:00 PM' },
      { time: `${date}T16:00:00`, label: '4:00 PM' },
    ];

    return new Response(JSON.stringify({ slots: mockSlots, mock: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const startTime = `${date}T00:00:00.000Z`;
    const endTime = `${date}T23:59:59.999Z`;

    const calUrl = new URL('https://api.cal.com/v2/slots/available');
    calUrl.searchParams.set('startTime', startTime);
    calUrl.searchParams.set('endTime', endTime);
    calUrl.searchParams.set('eventTypeId', eventTypeId);
    calUrl.searchParams.set('timeZone', timezone);

    const res = await fetch(calUrl.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'cal-api-version': '2024-08-13',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ slots: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const rawSlots = data?.data?.slots?.[date] || [];

    const slots = rawSlots.map((s: any) => {
      const dt = new Date(s.time);
      const label = dt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone,
      });
      return { time: s.time, label };
    });

    return new Response(JSON.stringify({ slots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ slots: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

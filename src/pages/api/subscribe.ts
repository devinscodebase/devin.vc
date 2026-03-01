import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json();

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = import.meta.env.BUTTONDOWN_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Newsletter not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch('https://api.buttondown.com/v1/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg =
      res.status === 409
        ? "You're already subscribed!"
        : data?.detail || 'Something went wrong';
    return new Response(JSON.stringify({ error: msg }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

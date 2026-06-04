import { describe, test, expect, mock, beforeEach, afterAll } from 'bun:test';

// Secret SET -> verification is enforced (the fetch path). The disabled/skip
// branch (secret unset) lives in turnstile.disabled.test.ts because the env
// import binding is snapshotted at module load and can't be toggled per-test.
// Export the union of env keys other modules read, so this mock can satisfy
// link-time binding resolution regardless of test-file execution order.
mock.module('astro:env/server', () => ({
  TURNSTILE_SECRET_KEY: 'test-secret',
  RESEND_TRAINING_AUDIENCE_ID: undefined,
}));

const { verifyTurnstile } = await import('./turnstile');

const realFetch = globalThis.fetch;
let lastUrl: string | undefined;
let lastBody: FormData | undefined;

function stubFetch(impl: () => Promise<Response>) {
  const fn = mock(async (url: any, init: any) => {
    lastUrl = String(url);
    lastBody = init?.body as FormData;
    return impl();
  });
  globalThis.fetch = fn as any;
  return fn;
}

beforeEach(() => {
  lastUrl = undefined;
  lastBody = undefined;
});

afterAll(() => {
  globalThis.fetch = realFetch;
});

describe('verifyTurnstile (enforced)', () => {
  test('no token short-circuits to false without calling siteverify', async () => {
    const fn = stubFetch(async () => new Response('{}'));
    expect(await verifyTurnstile(undefined)).toBe(false);
    expect(await verifyTurnstile(null)).toBe(false);
    expect(await verifyTurnstile('')).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  test('valid token + success:true resolves true', async () => {
    stubFetch(async () => new Response(JSON.stringify({ success: true })));
    expect(await verifyTurnstile('tok')).toBe(true);
  });

  test('success:false resolves false', async () => {
    stubFetch(async () => new Response(JSON.stringify({ success: false })));
    expect(await verifyTurnstile('tok')).toBe(false);
  });

  test('missing success field resolves false', async () => {
    stubFetch(async () => new Response(JSON.stringify({ foo: 'bar' })));
    expect(await verifyTurnstile('tok')).toBe(false);
  });

  test('posts secret, response, and remoteip to the siteverify endpoint', async () => {
    stubFetch(async () => new Response(JSON.stringify({ success: true })));
    await verifyTurnstile('the-token', '203.0.113.7');
    expect(lastUrl).toBe(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    );
    expect(lastBody?.get('secret')).toBe('test-secret');
    expect(lastBody?.get('response')).toBe('the-token');
    expect(lastBody?.get('remoteip')).toBe('203.0.113.7');
  });

  test('omits remoteip when no ip is given', async () => {
    stubFetch(async () => new Response(JSON.stringify({ success: true })));
    await verifyTurnstile('the-token');
    expect(lastBody?.has('remoteip')).toBe(false);
  });

  test('network error is caught and resolves false', async () => {
    stubFetch(async () => {
      throw new Error('network down');
    });
    expect(await verifyTurnstile('tok')).toBe(false);
  });

  test('malformed JSON body resolves false', async () => {
    stubFetch(async () => new Response('not json'));
    expect(await verifyTurnstile('tok')).toBe(false);
  });
});

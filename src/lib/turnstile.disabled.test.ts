import { describe, test, expect, mock } from 'bun:test';

// Secret UNSET -> verification is skipped entirely (graceful-by-config). Kept in
// its own file because the env import binding is fixed at module load.
mock.module('astro:env/server', () => ({
  TURNSTILE_SECRET_KEY: undefined,
  RESEND_TRAINING_AUDIENCE_ID: undefined,
}));

const { verifyTurnstile } = await import('./turnstile');

describe('verifyTurnstile (disabled / key unset)', () => {
  test('returns true regardless of token when no secret is configured', async () => {
    expect(await verifyTurnstile('anything')).toBe(true);
    expect(await verifyTurnstile(undefined)).toBe(true);
    expect(await verifyTurnstile('')).toBe(true);
  });

  test('never hits the network when disabled', async () => {
    const fn = mock(async () => new Response('{}'));
    const realFetch = globalThis.fetch;
    globalThis.fetch = fn as any;
    try {
      await verifyTurnstile('tok', '1.2.3.4');
      expect(fn).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

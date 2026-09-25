import { describe, expect, test } from 'bun:test';

import { EMAIL_MAX, joinWaitlist, normalizeEmail, type WaitlistDeps } from './waitlist';

function fakeDeps(existing: string[] = []) {
  const stored = new Set(existing);
  const sent: string[] = [];
  const deps: WaitlistDeps = {
    insert: async (email) => {
      if (stored.has(email)) return false;
      stored.add(email);
      return true;
    },
    sendConfirmation: async (email) => {
      sent.push(email);
    },
  };
  return { deps, stored, sent };
}

describe('normalizeEmail', () => {
  test('trims and lowercases', () => {
    expect(normalizeEmail('  Me@Devin.VC ')).toBe('me@devin.vc');
  });

  test('rejects non-strings, blanks, and malformed addresses', () => {
    for (const value of [undefined, null, 42, '', '   ', 'me', 'me@devin', '@devin.vc', 'me @devin.vc', 'a@b@c.d']) {
      expect(normalizeEmail(value)).toBeNull();
    }
  });

  test('rejects addresses over the length cap', () => {
    const local = 'a'.repeat(EMAIL_MAX);
    expect(normalizeEmail(`${local}@devin.vc`)).toBeNull();
  });
});

describe('joinWaitlist', () => {
  test('stores a new address and sends one confirmation', async () => {
    const { deps, stored, sent } = fakeDeps();
    const result = await joinWaitlist({ email: 'Owner@Example.com', consent: true }, deps);
    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect([...stored]).toEqual(['owner@example.com']);
    expect(sent).toEqual(['owner@example.com']);
  });

  test('a repeat signup succeeds without a second email', async () => {
    const { deps, sent } = fakeDeps(['owner@example.com']);
    const result = await joinWaitlist({ email: 'owner@example.com', consent: true }, deps);
    expect(result.status).toBe(200);
    expect(sent).toEqual([]);
  });

  test('a filled honeypot answers ok and stores nothing', async () => {
    const { deps, stored, sent } = fakeDeps();
    const result = await joinWaitlist({ email: 'bot@example.com', company: 'Acme' }, deps);
    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(stored.size).toBe(0);
    expect(sent).toEqual([]);
  });

  test('rejects a bad address with 422', async () => {
    const { deps, stored } = fakeDeps();
    const result = await joinWaitlist({ email: 'not-an-email' }, deps);
    expect(result).toEqual({ status: 422, body: { ok: false, error: 'invalid_email' } });
    expect(stored.size).toBe(0);
  });

  test('rejects a signup without consent', async () => {
    const { deps, stored } = fakeDeps();
    for (const consent of [undefined, false, 'true', 'off']) {
      const result = await joinWaitlist({ email: 'owner@example.com', consent }, deps);
      expect(result).toEqual({ status: 422, body: { ok: false, error: 'consent_required' } });
    }
    expect(stored.size).toBe(0);
  });

  test('accepts the no-JavaScript checkbox value', async () => {
    const { deps, stored } = fakeDeps();
    const result = await joinWaitlist({ email: 'owner@example.com', consent: 'on' }, deps);
    expect(result.status).toBe(200);
    expect(stored.size).toBe(1);
  });

  test('rejects a non-object body with 400', async () => {
    const { deps } = fakeDeps();
    expect((await joinWaitlist(null, deps)).status).toBe(400);
    expect((await joinWaitlist('me@devin.vc', deps)).status).toBe(400);
  });

  test('a storage failure is a 503', async () => {
    const logged: string[] = [];
    const result = await joinWaitlist(
      { email: 'owner@example.com', consent: true },
      {
        insert: async () => {
          throw new Error('connection refused');
        },
        log: (message) => logged.push(message),
      },
    );
    expect(result).toEqual({ status: 503, body: { ok: false, error: 'unavailable' } });
    expect(logged).toEqual(['waitlist insert failed']);
  });

  test('an email failure still counts the signup', async () => {
    const logged: string[] = [];
    const result = await joinWaitlist(
      { email: 'owner@example.com', consent: true },
      {
        insert: async () => true,
        sendConfirmation: async () => {
          throw new Error('domain not verified');
        },
        log: (message) => logged.push(message),
      },
    );
    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(logged).toEqual(['waitlist confirmation failed']);
  });

  test('adds the contact after storing, for new and repeat signups', async () => {
    const order: string[] = [];
    const deps: WaitlistDeps = {
      insert: async () => {
        order.push('insert');
        return order.filter((step) => step === 'insert').length === 1;
      },
      addContact: async (email) => {
        order.push(`contact:${email}`);
      },
      sendConfirmation: async () => {
        order.push('confirm');
      },
    };
    await joinWaitlist({ email: 'Owner@Example.com', consent: true }, deps);
    await joinWaitlist({ email: 'owner@example.com', consent: true }, deps);
    expect(order).toEqual([
      'insert', 'contact:owner@example.com', 'confirm',
      'insert', 'contact:owner@example.com',
    ]);
  });

  test('a contact sync failure still counts the signup and still confirms', async () => {
    const logged: string[] = [];
    const sent: string[] = [];
    const result = await joinWaitlist(
      { email: 'owner@example.com', consent: true },
      {
        insert: async () => true,
        addContact: async () => {
          throw new Error('Resend 500');
        },
        sendConfirmation: async (email) => {
          sent.push(email);
        },
        log: (message) => logged.push(message),
      },
    );
    expect(result.status).toBe(200);
    expect(sent).toEqual(['owner@example.com']);
    expect(logged).toEqual(['waitlist contact sync failed']);
  });

  test('no contact is added when storage fails', async () => {
    const added: string[] = [];
    const result = await joinWaitlist(
      { email: 'owner@example.com', consent: true },
      {
        insert: async () => {
          throw new Error('down');
        },
        addContact: async (email) => {
          added.push(email);
        },
      },
    );
    expect(result.status).toBe(503);
    expect(added).toEqual([]);
  });

  test('works with no email sender configured', async () => {
    const result = await joinWaitlist({ email: 'owner@example.com', consent: true }, { insert: async () => true });
    expect(result.status).toBe(200);
  });
});

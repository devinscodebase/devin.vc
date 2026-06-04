import { describe, test, expect, mock, beforeEach } from 'bun:test';

/*
  Unit tests for the shared training-lead service. Every external boundary is
  mocked at the module edge (turnstile, db, resend, sanity, email render +
  template, env) so these tests exercise ONLY the orchestration logic in
  submitTrainingLead and the pure helpers — no network, DB, or email.
*/

// ─── Mutable control state, reset per test ───
let turnstileResult: boolean;
let sanityAsset: any;
let existingLeads: any[];
let insertShouldThrow: boolean;

// Fixed for this file (env binding is snapshotted at import). With the audience
// id present, the marketingConsent flag is what gates the audience add.
const AUDIENCE_ID = 'aud_test';

// ─── Spies ───
const verifyTurnstileMock = mock(async () => turnstileResult);
const sanityFetch = mock(async () => sanityAsset);
const renderMock = mock(async () => 'rendered');
const templateMock = mock((props: any) => ({ props }));

const insertValues = mock(async (_vals: any) => {
  if (insertShouldThrow) throw new Error('db down');
});
const updateWhere = mock(async () => {});
const contactsCreate = mock(async () => ({ data: { id: 'contact_123' } }));
const emailsSend = mock(async () => ({ data: { id: 'email_1' } }));

const fakeDb = {
  select: () => ({
    from: () => ({
      where: () => ({ limit: async () => existingLeads }),
    }),
  }),
  insert: () => ({ values: insertValues }),
  update: () => ({ set: () => ({ where: updateWhere }) }),
};

// ─── Module mocks (must precede the dynamic import below) ───
mock.module('astro:env/server', () => ({
  RESEND_TRAINING_AUDIENCE_ID: AUDIENCE_ID,
  TURNSTILE_SECRET_KEY: undefined,
}));
mock.module('./turnstile', () => ({ verifyTurnstile: verifyTurnstileMock }));
mock.module('./db', () => ({ getDb: () => fakeDb }));
mock.module('./resend', () => ({
  getResend: () => ({
    contacts: { create: contactsCreate },
    emails: { send: emailsSend },
  }),
  SENDER: 'Test Sender <test@send.devin.vc>',
}));
mock.module('./sanity', () => ({ sanityClient: { fetch: sanityFetch } }));
mock.module('@react-email/components', () => ({ render: renderMock }));
mock.module('../emails/training-asset-delivery', () => ({ default: templateMock }));

const {
  submitTrainingLead,
  groupSlug,
  categoryLabels,
  gateCookieName,
  gateCookieOptions,
  isTrainingAssetEnabled,
  TRAINING_GATE_MAX_AGE_SECONDS,
  SITE_URL,
} = await import('./training-leads');

// ─── Fixtures ───
const validAsset = {
  title: 'Advertising Word List',
  tagline: 'Words that sell',
  category: 'word-list',
  slug: 'advertising-word-list',
  termCount: 73,
  groups: ['Hooks', 'Closers'],
};

const validInput = () => ({
  name: 'Jane Doe',
  email: 'Jane@Example.com ',
  company: 'Acme',
  jobTitle: 'CMO',
  assetSlug: 'advertising-word-list',
  consent: true,
  marketingConsent: false,
  website: '',
  turnstileToken: 'tok',
});

// Pass a waitUntil that collects background promises so we can await them and
// assert the fire-and-forget side effects deterministically.
function collector() {
  const bg: Promise<unknown>[] = [];
  return {
    waitUntil: (p: Promise<unknown>) => {
      bg.push(p);
    },
    settle: () => Promise.all(bg),
    bg,
  };
}

beforeEach(() => {
  turnstileResult = true;
  sanityAsset = validAsset;
  existingLeads = [];
  insertShouldThrow = false;
  for (const m of [
    verifyTurnstileMock,
    sanityFetch,
    renderMock,
    templateMock,
    insertValues,
    updateWhere,
    contactsCreate,
    emailsSend,
  ])
    m.mockClear();
});

// ─── Honeypot ───
describe('honeypot', () => {
  test('filled honeypot returns fake success and skips ALL side effects', async () => {
    const res = await submitTrainingLead({ ...validInput(), website: 'http://spam' });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.assetUrl).toBe('/training/advertising-word-list/words');
      expect(res.assetSlug).toBe('advertising-word-list');
    }
    expect(verifyTurnstileMock).not.toHaveBeenCalled();
    expect(sanityFetch).not.toHaveBeenCalled();
    expect(insertValues).not.toHaveBeenCalled();
    expect(emailsSend).not.toHaveBeenCalled();
  });
});

// ─── Validation ───
describe('validation', () => {
  test.each([
    ['name', { name: '' }],
    ['email', { email: '' }],
    ['company', { company: '' }],
    ['jobTitle', { jobTitle: '' }],
    ['assetSlug', { assetSlug: '' }],
  ])('missing %s -> 400 required', async (_label, override) => {
    const res = await submitTrainingLead({ ...validInput(), ...override });
    expect(res).toEqual({ ok: false, error: 'All fields are required.', status: 400 });
    expect(verifyTurnstileMock).not.toHaveBeenCalled();
  });

  test('whitespace-only fields are treated as empty', async () => {
    const res = await submitTrainingLead({ ...validInput(), company: '   ' });
    expect(res.ok).toBe(false);
  });

  test('invalid email -> 400', async () => {
    const res = await submitTrainingLead({ ...validInput(), email: 'not-an-email' });
    expect(res).toEqual({
      ok: false,
      error: 'Please enter a valid email address.',
      status: 400,
    });
  });

  test('missing consent -> 400', async () => {
    const res = await submitTrainingLead({ ...validInput(), consent: false });
    expect(res.status).toBe(400);
    expect((res as any).error).toContain('Privacy Policy');
  });

  test('consent accepts the string "on" (native form checkbox)', async () => {
    const res = await submitTrainingLead({ ...validInput(), consent: 'on' as any });
    expect(res.ok).toBe(true);
  });

  test('consent accepts the string "true"', async () => {
    const res = await submitTrainingLead({ ...validInput(), consent: 'true' as any });
    expect(res.ok).toBe(true);
  });

  test('disabled slug -> 404 before turnstile/sanity run', async () => {
    const res = await submitTrainingLead({ ...validInput(), assetSlug: 'unknown-asset' });
    expect(res).toEqual({ ok: false, error: 'Training asset not found.', status: 404 });
    expect(verifyTurnstileMock).not.toHaveBeenCalled();
    expect(sanityFetch).not.toHaveBeenCalled();
  });
});

// ─── Turnstile gate ───
describe('turnstile gate', () => {
  test('failed verification -> 403 and nothing persisted', async () => {
    turnstileResult = false;
    const res = await submitTrainingLead(validInput());
    expect(res).toEqual({
      ok: false,
      error: 'Could not verify you are human. Please try again.',
      status: 403,
    });
    expect(sanityFetch).not.toHaveBeenCalled();
    expect(insertValues).not.toHaveBeenCalled();
  });

  test('passes the raw token and ip through to verifyTurnstile', async () => {
    await submitTrainingLead({ ...validInput(), turnstileToken: 'abc' }, { ip: '9.9.9.9' });
    expect(verifyTurnstileMock).toHaveBeenCalledWith('abc', '9.9.9.9');
  });
});

// ─── Sanity lookup ───
describe('asset lookup', () => {
  test('asset not found in Sanity -> 404', async () => {
    sanityAsset = null;
    const res = await submitTrainingLead(validInput());
    expect(res).toEqual({ ok: false, error: 'Training asset not found.', status: 404 });
    expect(insertValues).not.toHaveBeenCalled();
  });
});

// ─── Persistence ───
describe('persistence', () => {
  test('happy path inserts the lead and returns the canonical asset url', async () => {
    const c = collector();
    const res = await submitTrainingLead(validInput(), c);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.assetUrl).toBe(`${SITE_URL}/training/advertising-word-list/words`);
      expect(res.assetTitle).toBe('Advertising Word List');
    }
    expect(insertValues).toHaveBeenCalledTimes(1);
  });

  test('normalizes email (lowercase + trim) and persists asset metadata', async () => {
    await submitTrainingLead(validInput(), collector());
    const vals = insertValues.mock.calls[0][0] as any;
    expect(vals.email).toBe('jane@example.com');
    expect(vals.name).toBe('Jane Doe');
    expect(vals.assetSlug).toBe('advertising-word-list');
    expect(vals.assetTitle).toBe('Advertising Word List');
    expect(typeof vals.createdAt).toBe('string');
  });

  test('clamps over-long free-text fields to 200 chars', async () => {
    const longName = 'a'.repeat(500);
    await submitTrainingLead({ ...validInput(), name: longName }, collector());
    const vals = insertValues.mock.calls[0][0] as any;
    expect(vals.name.length).toBe(200);
  });

  test('dedupe: existing lead skips insert but still succeeds', async () => {
    existingLeads = [{ id: 1 }];
    const c = collector();
    const res = await submitTrainingLead(validInput(), c);
    expect(res.ok).toBe(true);
    expect(insertValues).not.toHaveBeenCalled();
    await c.settle();
    // delivery email still goes out on a resubmit
    expect(emailsSend).toHaveBeenCalled();
  });

  test('DB failure -> 500 and no emails sent', async () => {
    insertShouldThrow = true;
    const c = collector();
    const res = await submitTrainingLead(validInput(), c);
    expect(res).toEqual({
      ok: false,
      error: 'Failed to save your details. Please try again.',
      status: 500,
    });
    await c.settle();
    expect(emailsSend).not.toHaveBeenCalled();
  });
});

// ─── Background fan-out ───
describe('background side effects', () => {
  test('sends a notification to Devin and a delivery email to the lead', async () => {
    const c = collector();
    await submitTrainingLead(validInput(), c);
    await c.settle();

    expect(emailsSend).toHaveBeenCalledTimes(2);
    const recipients = emailsSend.mock.calls.map((call: any[]) => call[0].to);
    expect(recipients).toContain('me@devin.vc');
    expect(recipients).toContain('jane@example.com');

    const delivery = emailsSend.mock.calls.find((c: any[]) => c[0].to === 'jane@example.com')![0];
    expect(delivery.replyTo).toBe('me@devin.vc');
    expect(delivery.subject).toContain('Jane');
  });

  test('marketingConsent=false skips the audience add', async () => {
    const c = collector();
    await submitTrainingLead({ ...validInput(), marketingConsent: false }, c);
    await c.settle();
    expect(contactsCreate).not.toHaveBeenCalled();
  });

  test('marketingConsent=true adds to the audience and back-fills the contact id', async () => {
    const c = collector();
    await submitTrainingLead({ ...validInput(), marketingConsent: true }, c);
    await c.settle();
    expect(contactsCreate).toHaveBeenCalledTimes(1);
    const arg = contactsCreate.mock.calls[0][0] as any;
    expect(arg.audienceId).toBe(AUDIENCE_ID);
    expect(arg.email).toBe('jane@example.com');
    expect(arg.firstName).toBe('Jane');
    // contact id is persisted back onto the lead row
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });

  test('marketingConsent accepts the string "on"', async () => {
    const c = collector();
    await submitTrainingLead({ ...validInput(), marketingConsent: 'on' as any }, c);
    await c.settle();
    expect(contactsCreate).toHaveBeenCalledTimes(1);
  });

  test('background work is handed to waitUntil, not awaited inline', async () => {
    const c = collector();
    await submitTrainingLead(validInput(), c);
    // emails are queued, not yet sent, until we settle the collected promises
    expect(c.bg.length).toBeGreaterThan(0);
  });

  test('emails still send when no waitUntil is provided (dev path)', async () => {
    // Without waitUntil the promises are fire-and-forget; await a microtask flush.
    await submitTrainingLead(validInput());
    await new Promise((r) => setTimeout(r, 0));
    expect(emailsSend).toHaveBeenCalled();
  });
});

// ─── Pure helpers ───
describe('groupSlug', () => {
  test('lowercases and hyphenates', () => {
    expect(groupSlug('Hooks & Closers')).toBe('hooks-closers');
  });
  test('trims leading/trailing separators', () => {
    expect(groupSlug('  Power Words!  ')).toBe('power-words');
  });
  test('collapses runs of non-alphanumerics', () => {
    expect(groupSlug('A___B   C')).toBe('a-b-c');
  });
});

describe('categoryLabels', () => {
  test('maps known categories to human labels', () => {
    expect(categoryLabels['word-list']).toBe('Word List');
    expect(categoryLabels.playbook).toBe('Playbook');
  });
});

describe('gate cookie helpers', () => {
  test('gateCookieName is prefixed per slug', () => {
    expect(gateCookieName('advertising-word-list')).toBe(
      'training-asset-advertising-word-list'
    );
  });

  test('gateCookieOptions are scoped, long-lived, and hardened', () => {
    const opts = gateCookieOptions('advertising-word-list');
    expect(opts.path).toBe('/training/advertising-word-list');
    expect(opts.maxAge).toBe(TRAINING_GATE_MAX_AGE_SECONDS);
    expect(opts.sameSite).toBe('lax');
    expect(opts.httpOnly).toBe(true);
    expect(opts.secure).not.toBe(true); // false outside prod
  });

  test('max age is 60 days', () => {
    expect(TRAINING_GATE_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 60);
  });
});

describe('isTrainingAssetEnabled', () => {
  test('true only for allowlisted slugs', () => {
    expect(isTrainingAssetEnabled('advertising-word-list')).toBe(true);
  });
  test('false for unknown or undefined slugs', () => {
    expect(isTrainingAssetEnabled('web-design-word-list')).toBe(false);
    expect(isTrainingAssetEnabled(undefined)).toBe(false);
  });
});

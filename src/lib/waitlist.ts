export const EMAIL_MAX = 254;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > EMAIL_MAX) return null;
  return EMAIL_RE.test(email) ? email : null;
}

export type WaitlistError = 'bad_request' | 'invalid_email' | 'consent_required' | 'unavailable';

export type WaitlistResponse = { ok: true } | { ok: false; error: WaitlistError };

export interface WaitlistDeps {
  insert: (email: string) => Promise<boolean>;
  addContact?: (email: string) => Promise<void>;
  sendConfirmation?: (email: string) => Promise<void>;
  log?: (message: string, error: unknown) => void;
}

export async function joinWaitlist(
  body: unknown,
  deps: WaitlistDeps,
): Promise<{ status: number; body: WaitlistResponse }> {
  if (typeof body !== 'object' || body === null) {
    return { status: 400, body: { ok: false, error: 'bad_request' } };
  }
  const fields = body as Record<string, unknown>;

  if (typeof fields.company === 'string' && fields.company.trim() !== '') {
    return { status: 200, body: { ok: true } };
  }

  const email = normalizeEmail(fields.email);
  if (!email) {
    return { status: 422, body: { ok: false, error: 'invalid_email' } };
  }

  if (fields.consent !== true && fields.consent !== 'on') {
    return { status: 422, body: { ok: false, error: 'consent_required' } };
  }

  let isNew: boolean;
  try {
    isNew = await deps.insert(email);
  } catch (error) {
    deps.log?.('waitlist insert failed', error);
    return { status: 503, body: { ok: false, error: 'unavailable' } };
  }

  if (deps.addContact) {
    try {
      await deps.addContact(email);
    } catch (error) {
      deps.log?.('waitlist contact sync failed', error);
    }
  }

  if (isNew && deps.sendConfirmation) {
    try {
      await deps.sendConfirmation(email);
    } catch (error) {
      deps.log?.('waitlist confirmation failed', error);
    }
  }

  return { status: 200, body: { ok: true } };
}

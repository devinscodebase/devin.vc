import { useRef, useState, type FormEvent } from 'react';

import { getPostHog, getPostHogHeaders } from '../lib/posthog';
import { normalizeEmail } from '../lib/waitlist';
import iconEmailUnread from '../icons/freehand/email-unread.svg?raw';

type Status = 'idle' | 'sending' | 'invalid' | 'no-consent' | 'failed' | 'joined';

interface Props {
  onJoined: (email: string) => void;
}

export default function WaitlistForm({ onJoined }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const companyRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending' || status === 'joined') return;

    if (!normalizeEmail(email)) {
      setStatus('invalid');
      inputRef.current?.focus();
      return;
    }
    if (!consent) {
      setStatus('no-consent');
      consentRef.current?.focus();
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getPostHogHeaders() },
        body: JSON.stringify({ email, consent, company: companyRef.current?.value ?? '' }),
      });
      if (response.status === 422) {
        const body = await response.json().catch(() => null);
        if (body?.error === 'consent_required') {
          setStatus('no-consent');
          consentRef.current?.focus();
        } else {
          setStatus('invalid');
          inputRef.current?.focus();
        }
        return;
      }
      if (response.ok) {
        const posthog = getPostHog();
        const distinctId = posthog?.get_distinct_id();
        if (posthog && distinctId) posthog.identify(distinctId, { email: email.trim().toLowerCase() });
        posthog?.logger?.info('waitlist request completed', { status: 'success', status_code: response.status });
        setStatus('joined');
        onJoined(email.trim());
        return;
      }

      const posthog = getPostHog();
      posthog?.capture('waitlist_submission_failed', { status_code: response.status });
      posthog?.logger?.error('waitlist request completed', { status: 'failed', status_code: response.status });
      setStatus('failed');
    } catch (error) {
      const posthog = getPostHog();
      posthog?.captureException(error, { flow: 'waitlist' });
      posthog?.capture('waitlist_submission_failed', { failure_reason: 'network_error' });
      posthog?.logger?.error('waitlist request completed', {
        status: 'failed',
        failure_reason: 'network_error',
        error_type: error instanceof Error ? error.name : 'unknown',
      });
      setStatus('failed');
    }
  }

  const invalid = status === 'invalid';
  const noConsent = status === 'no-consent';

  return (
    <>
      <form className="signup is-hero is-centered" action="/api/waitlist" method="post" noValidate onSubmit={onSubmit}>
        <div className={invalid ? 'field is-error' : 'field'}>
          <label className="label sr-only" htmlFor="waitlist-email">Email</label>
          <div className="field_control">
            <span className="field_icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconEmailUnread }} />
            <input
              ref={inputRef}
              className="field_input"
              id="waitlist-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (invalid) setStatus('idle');
              }}
              aria-invalid={invalid}
              aria-describedby={invalid ? 'waitlist-email-message' : undefined}
            />
          </div>
          {invalid && (
            <p className="field_message" id="waitlist-email-message">
              That address doesn't look complete. Check it and try again.
            </p>
          )}
        </div>
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="waitlist-company">Company</label>
          <input ref={companyRef} id="waitlist-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="signup_consent">
          <label className="field_check">
            <input
              ref={consentRef}
              type="checkbox"
              name="consent"
              required
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                if (noConsent) setStatus('idle');
              }}
              aria-invalid={noConsent}
              aria-describedby={noConsent ? 'waitlist-consent-message' : undefined}
            />
            <span>
              I have read and agree to the{' '}
              <a className="text-link" href="/privacy">privacy policy</a>.
            </span>
          </label>
          {noConsent && (
            <p className="field_message" id="waitlist-consent-message">
              Tick the box to join the waitlist.
            </p>
          )}
        </div>
        <button className={status === 'sending' || status === 'joined' ? 'button is-hero is-loading' : 'button is-hero'} type="submit" aria-disabled={status === 'sending' || status === 'joined'}>
          Join the waitlist
        </button>
      </form>
      {status === 'failed' && (
        <p className="alert is-error max-w-sm mx-auto mt-small" role="alert">
          <strong>Not sent</strong> The signup didn't go through. Try again in a minute, or email{' '}
          <a className="text-link" href="mailto:me@devin.vc">me@devin.vc</a>.
        </p>
      )}
    </>
  );
}

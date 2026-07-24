// ────────────────────────────────────────────────────────────────
// ConsentBanner.tsx — the cookie consent notice. A small sheet,
// not a bar. Hydrated island (client:idle), but NO portal: its
// SSR'd-hidden markup is a frozen contract — the card ships in the
// initial HTML with the `hidden` attribute (initial state matches
// the server HTML, so no hydration mismatch and no flash).
//
// localStorage contract (shared with the window.devinVcConsent
// global that Site.astro's inline script defines synchronously):
//   key      'devin-vc-consent'
//   values   'accepted' | 'declined'
//   Anything else = non-consent, decline-by-default.
// If a visitor already answered, this component never un-hides,
// so the sheet never renders visibly or animates at all.
// Otherwise it shows 1600ms after hydration. Forward-looking
// infrastructure only: nothing on this site sets tracking cookies
// today (see /privacy), so there is no live analytics call to
// gate yet.
// ────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';

import iconCandyCookie from '../icons/freehand/candy-cookie.svg?raw';

const CONSENT_KEY = 'devin-vc-consent';
const SHOW_DELAY_MS = 1600;

export default function ConsentBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(CONSENT_KEY);
    } catch {
      stored = null;
    }
    if (stored === 'accepted' || stored === 'declined') return; // already answered, never show
    const timer = window.setTimeout(() => setHidden(false), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const answer = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Storage unavailable (e.g. Safari private mode): hide anyway.
    }
    setHidden(true);
  };

  return (
    <div className="consent card is-elevated" role="region" aria-label="Cookie notice" hidden={hidden}>
      <span className="grain-overlay" aria-hidden="true"></span>
      <span className="icon" style={{ width: '2em', height: '2em' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconCandyCookie }} />
      <p className="text-small mt-small">
        This site doesn't set tracking cookies today. Choosing accept or decline now decides what happens if that changes, explained on the <a className="text-link" href="/privacy">privacy page</a>.
      </p>
      <div className="button-group mt-medium">
        <button className="button is-small" type="button" onClick={() => answer('accepted')}>Accept</button>
        <button className="button is-secondary is-small" type="button" onClick={() => answer('declined')}>Decline</button>
      </div>
    </div>
  );
}

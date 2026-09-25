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
    if (stored === 'accepted' || stored === 'declined') return;
    const timer = window.setTimeout(() => setHidden(false), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const answer = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
    }
    window.dispatchEvent(new CustomEvent('devin-vc-consent-changed', { detail: value }));
    setHidden(true);
  };

  return (
    <div className="consent card is-elevated" role="region" aria-label="Cookie notice" hidden={hidden}>
      <span className="grain-overlay" aria-hidden="true"></span>
      <span className="icon" style={{ width: '2em', height: '2em' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconCandyCookie }} />
      <p className="text-small mt-small">
        We use Google Analytics and PostHog cookies to understand how this site is used. They are set only if you accept. See our <a className="text-link" href="/cookies">Cookie Policy</a>.
      </p>
      <div className="button-group mt-medium">
        <button className="button is-small" type="button" onClick={() => answer('accepted')}>Accept</button>
        <button className="button is-secondary is-small" type="button" onClick={() => answer('declined')}>Decline</button>
      </div>
    </div>
  );
}

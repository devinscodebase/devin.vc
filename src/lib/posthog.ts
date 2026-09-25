import type { PostHog } from 'posthog-js';

declare global {
  interface Window {
    posthog?: PostHog;
  }
}

export function getPostHog(): PostHog | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.posthog;
}

export function getPostHogHeaders(): Record<string, string> {
  const posthog = getPostHog();
  if (!posthog) return {};

  const distinctId = posthog.get_distinct_id();
  const sessionId = posthog.get_session_id();

  return {
    ...(distinctId ? { 'X-PostHog-Distinct-Id': distinctId } : {}),
    ...(sessionId ? { 'X-PostHog-Session-Id': sessionId } : {}),
    'X-PostHog-Consent': 'accepted',
  };
}

<script>
  import { onMount } from 'svelte';

  const STORAGE_KEY = 'cookie-consent';

  let visible = $state(false);
  let dismissing = $state(false);
  let entered = $state(false);

  function injectAnalytics() {
    // Cloudflare Web Analytics — injected via CF dashboard, no client JS needed.
    // This function is kept as a hook for any future client-side analytics.
  }

  function dismiss(callback) {
    dismissing = true;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450;
    setTimeout(() => {
      visible = false;
      dismissing = false;
      callback?.();
    }, duration);
  }

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    dismiss(injectAnalytics);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    dismiss();
  }

  onMount(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (consent === 'accepted') {
      injectAnalytics();
    } else if (consent === null) {
      visible = true;
      // Stagger entrance: card slides in, then content fades
      requestAnimationFrame(() => {
        entered = true;
      });
    }
  });
</script>

{#if visible}
  <div
    class="consent"
    class:dismissing
    role="dialog"
    aria-label="Cookie consent"
  >
    <div class="card">
      <!-- Grain texture matching nav overlay -->
      <div class="grain-overlay" style="border-radius: inherit;" aria-hidden="true"></div>

      <!-- Accent border glow -->
      <div class="accent-edge" aria-hidden="true"></div>

      <div class="content" class:entered>
        <div class="header">
          <span class="label">Privacy</span>
          <h3 class="title">A quick note</h3>
        </div>

        <p class="body">
          This site uses analytics cookies to understand how visitors engage. Nothing personal, just page views and performance.
        </p>

        <div class="actions">
          <button class="btn-decline" onclick={decline}>No thanks</button>
          <button class="btn-accept" onclick={accept}>
            <span>Sounds good</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .consent {
    position: fixed;
    bottom: clamp(1rem, 3vw, 1.75rem);
    left: clamp(1rem, 3vw, 1.75rem);
    z-index: 50;
    animation: card-in 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .consent.dismissing {
    animation: card-out 450ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }

  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes card-out {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(12px) scale(0.97);
    }
  }

  .card {
    position: relative;
    width: min(22rem, calc(100vw - 2rem));
    background: color-mix(in oklab, var(--color-bg) 92%, transparent);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: 14px;
    overflow: hidden;
    box-shadow:
      0 4px 24px color-mix(in oklab, var(--color-bg) 60%, transparent),
      0 1px 3px color-mix(in oklab, var(--color-bg) 40%, transparent);
  }

  /* Left accent edge — subtle gold bar */
  .accent-edge {
    position: absolute;
    top: 1.25rem;
    bottom: 1.25rem;
    left: 0;
    width: 2px;
    background: linear-gradient(
      to bottom,
      transparent,
      var(--color-accent),
      transparent
    );
    opacity: 0.6;
    border-radius: 0 1px 1px 0;
  }

  .content {
    position: relative;
    padding: 1.5rem 1.5rem 1.25rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 150ms,
      transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 150ms;
  }

  .content.entered {
    opacity: 1;
    transform: translateY(0);
  }

  .header {
    display: flex;
    align-items: baseline;
    gap: 0.625rem;
  }

  .label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-accent);
    position: relative;
    top: -0.05em;
  }

  .title {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: 1.15rem;
    color: var(--color-text);
    margin: 0;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .body {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    line-height: 1.6;
    color: var(--color-text-muted);
    margin: 0;
    letter-spacing: 0.005em;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.25rem;
  }

  /* ---- Buttons ---- */
  .btn-decline,
  .btn-accept {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    transition:
      background 200ms cubic-bezier(0.16, 1, 0.3, 1),
      color 200ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 120ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-decline {
    background: transparent;
    color: var(--color-text-muted);
    padding: 0.5rem 0.875rem;
  }

  .btn-decline:hover {
    color: var(--color-text);
    background: color-mix(in oklab, var(--color-text-muted) 8%, transparent);
  }

  .btn-decline:active {
    transform: scale(0.97);
  }

  .btn-accept {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background: var(--color-accent);
    color: var(--color-bg);
    padding: 0.5rem 1rem;
    box-shadow: 0 1px 8px color-mix(in oklab, var(--color-accent) 20%, transparent);
  }

  .btn-accept svg {
    transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-accept:hover {
    filter: brightness(1.08);
    box-shadow: 0 2px 16px color-mix(in oklab, var(--color-accent) 30%, transparent);
  }

  .btn-accept:hover svg {
    transform: translateX(2px);
  }

  .btn-accept:active {
    transform: scale(0.97);
  }

  /* Focus-visible */
  .btn-decline:focus-visible,
  .btn-accept:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* ---- Responsive ---- */
  @media (max-width: 480px) {
    .consent {
      left: 0.75rem;
      right: 0.75rem;
      bottom: 0.75rem;
    }

    .card {
      width: 100%;
    }

    .content {
      padding: 1.25rem 1.25rem 1.125rem 1.5rem;
    }

    .actions {
      justify-content: flex-end;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .consent,
    .consent.dismissing {
      animation: none;
    }

    .content {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>

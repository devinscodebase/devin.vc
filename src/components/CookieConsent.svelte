<script>
  import { onMount } from 'svelte';
  import Button from './ui/Button.svelte';

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
      <!-- Top accent rail — same convention as the contact + lead cards. -->
      <span class="card-bar" aria-hidden="true"></span>
      <!-- Film grain on the elevated surface, matching nav + hero. -->
      <span class="grain-overlay" aria-hidden="true"></span>

      <div class="content" class:entered>
        <div class="header">
          <span class="eyebrow">
            <span class="eyebrow-rule"></span>
            <span class="eyebrow-text">Privacy</span>
          </span>
          <h3 class="title">A quick note</h3>
        </div>

        <p class="body">
          This site uses analytics cookies to understand how visitors engage. Nothing personal, just page views and performance.
        </p>

        <div class="actions">
          <Button variant="ghost" size="sm" onclick={decline}>No thanks</Button>
          <Button variant="primary" size="sm" arrow onclick={accept}>Sounds good</Button>
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
    animation: card-in var(--duration-slow) var(--ease-out-expo) forwards;
  }

  .consent.dismissing {
    animation: card-out var(--duration-normal) var(--ease-in-out-smooth) forwards;
  }

  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.985);
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
      transform: translateY(10px) scale(0.99);
    }
  }

  /* Architectural surface card — mirrors the contact + lead cards: solid
     elevated surface, hairline border, sharp 4px corners, real layered
     shadow, and a 2px accent rail across the top. No glassmorphism. */
  .card {
    position: relative;
    width: min(23rem, calc(100vw - 2rem));
    background: var(--color-surface);
    border: var(--border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }

  .card-bar {
    position: absolute;
    inset: 0 0 auto 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--color-accent),
      color-mix(in oklab, var(--color-accent) 30%, transparent)
    );
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 1;
    padding: var(--space-card);
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity var(--duration-slow) var(--ease-out-expo) 150ms,
      transform var(--duration-slow) var(--ease-out-expo) 150ms;
  }

  .content.entered {
    opacity: 1;
    transform: translateY(0);
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  /* Eyebrow — accent rule + uppercase label, matching the site's section
     and visual labels. */
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
  }
  .eyebrow-rule {
    display: inline-block;
    width: 18px;
    height: 1px;
    background: var(--color-accent);
    opacity: 0.6;
  }
  .eyebrow-text {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent);
  }

  .title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    margin: 0;
    letter-spacing: var(--tracking-tight);
    line-height: 1.15;
  }

  .body {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin: 0;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.35rem;
  }

  /* Buttons come from the Button primitive (ghost + primary) — focus, hover,
     and active states all live there. */

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

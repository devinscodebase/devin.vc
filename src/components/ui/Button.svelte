<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger';
  type Size = 'sm' | 'md' | 'lg';

  type Props = {
    variant?: Variant;
    size?: Size;
    href?: string;
    target?: '_self' | '_blank';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    arrow?: boolean;
    fullWidth?: boolean;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    children?: import('svelte').Snippet;
  };

  let {
    variant = 'primary',
    size = 'md',
    href,
    target,
    type = 'button',
    disabled = false,
    loading = false,
    arrow = false,
    fullWidth = false,
    onclick,
    class: className = '',
    children,
  }: Props = $props();

  const classes = $derived(
    [
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      fullWidth ? 'btn--full' : '',
      loading ? 'btn--loading' : '',
      arrow ? 'btn--has-arrow' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

{#if href}
  <a
    {href}
    {target}
    rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    class={classes}
    aria-disabled={disabled || undefined}
    onclick={onclick}
  >
    {#if loading}<span class="btn__spinner" aria-hidden="true"></span>{/if}
    <span class="btn__label">{@render children?.()}</span>
    {#if arrow}
      <svg class="btn__arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 7H13M8 2L13 7l-5 5" />
      </svg>
    {/if}
  </a>
{:else}
  <button class={classes} {type} {disabled} {onclick}>
    {#if loading}<span class="btn__spinner" aria-hidden="true"></span>{/if}
    <span class="btn__label">{@render children?.()}</span>
    {#if arrow}
      <svg class="btn__arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 7H13M8 2L13 7l-5 5" />
      </svg>
    {/if}
  </button>
{/if}

<style>
  /*
    Mirrors the established site pattern:
      • Sharp corners (no border-radius)
      • DM Sans uppercase, tracking-wide labels
      • Primary CTAs use a two-layer gradient that slides on hover (accent → teal)
      • Spring scale on hover (1.02) using cubic-bezier(0.34, 1.56, 0.64, 1)
      • Default easing: ease-out-expo, ~0.25s
  */
  .btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-weight: var(--weight-medium);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    text-decoration: none;
    cursor: pointer;
    line-height: 1;
    white-space: nowrap;
    border-radius: 0;
    border: 1px solid transparent;
    background: transparent;
    color: var(--color-text);
    transition:
      background-position 250ms var(--ease-out-expo),
      background-color var(--duration-fast) var(--ease-out-expo),
      border-color var(--duration-fast) var(--ease-out-expo),
      color var(--duration-fast) var(--ease-out-expo),
      transform var(--duration-fast) var(--ease-spring),
      box-shadow var(--duration-fast) var(--ease-out-expo);
  }

  .btn:hover:not(:disabled):not([aria-disabled='true']) {
    transform: scale(1.02);
  }

  .btn:active:not(:disabled):not([aria-disabled='true']) {
    transform: scale(0.97);
    transition-duration: 100ms;
  }

  .btn:disabled,
  .btn[aria-disabled='true'] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ============================================
     SIZES — proportions taken from live-site CTAs
     ============================================ */
  .btn--sm { font-size: var(--text-xs); padding: 0.6rem 1.25rem; }
  .btn--md { font-size: var(--text-xs); padding: 0.78rem 1.75rem; }
  .btn--lg { font-size: var(--text-sm); padding: 0.95rem 2.5rem; }

  /* ============================================
     PRIMARY — accent-gold base with teal slide-in
     Background-position animation matches Hero/Contact/Booking CTA pattern.
     ============================================ */
  .btn--primary {
    background-color: var(--color-accent);
    background-image: linear-gradient(
      90deg,
      var(--color-accent-teal) 50%,
      transparent 50%
    );
    background-size: 200% 100%;
    background-position: 100% 0;
    background-repeat: no-repeat;
    border-color: var(--color-accent);
    color: var(--color-bg);
  }

  .btn--primary:hover:not(:disabled):not([aria-disabled='true']) {
    background-position: 0% 0;
    border-color: var(--color-accent-teal);
    color: var(--color-bg);
  }

  /* ============================================
     SECONDARY — outlined, fills subtly on hover
     ============================================ */
  .btn--secondary {
    background: transparent;
    color: var(--color-text);
    /* 60% mix clears WCAG 1.4.11 (3:1 for functional UI borders) — was 40% (2.21:1 fail). */
    border-color: color-mix(in oklab, var(--color-text-muted) 60%, transparent);
  }

  .btn--secondary:hover:not(:disabled):not([aria-disabled='true']) {
    border-color: var(--color-accent);
    background: color-mix(in oklab, var(--color-accent) 8%, transparent);
    color: var(--color-text);
  }

  /* ============================================
     GHOST — borderless utility action
     ============================================ */
  .btn--ghost {
    background: transparent;
    color: var(--color-text-muted);
    border-color: transparent;
  }

  .btn--ghost:hover:not(:disabled):not([aria-disabled='true']) {
    color: var(--color-text);
    background: color-mix(in oklab, var(--color-text) 5%, transparent);
  }

  /* ============================================
     LINK — pure text link with animated arrow appearance.
     No padding, no border, accent color on hover, arrow fades in.
     ============================================ */
  .btn--link {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    gap: 0.4rem;
  }

  .btn--link:hover:not(:disabled):not([aria-disabled='true']) {
    color: var(--color-accent);
    transform: none;
    background: transparent;
  }

  .btn--link.btn--sm { font-size: var(--text-xs); }
  .btn--link.btn--md { font-size: var(--text-xs); }
  .btn--link.btn--lg { font-size: var(--text-sm); }

  /* Link variant: arrow hidden by default, fades in + translates on hover */
  .btn--link .btn__arrow {
    opacity: 0;
    transform: translateX(-3px);
  }

  .btn--link:hover .btn__arrow {
    opacity: 1;
    transform: translateX(0);
  }

  /* ============================================
     DANGER — error-tinted CTA
     ============================================ */
  .btn--danger {
    background-color: var(--color-error);
    color: var(--color-bg);
    border-color: var(--color-error);
  }

  .btn--danger:hover:not(:disabled):not([aria-disabled='true']) {
    background-color: color-mix(in oklab, var(--color-error) 80%, var(--color-text));
    border-color: color-mix(in oklab, var(--color-error) 80%, var(--color-text));
  }

  /* ============================================
     ARROW — translates 3px on hover for filled variants
     ============================================ */
  .btn__arrow {
    flex-shrink: 0;
    transition: transform var(--duration-fast) var(--ease-out-expo), opacity var(--duration-fast) var(--ease-out-expo);
  }

  .btn:not(.btn--link):hover:not(:disabled):not([aria-disabled='true']) .btn__arrow {
    transform: translateX(3px);
  }

  .btn--full { width: 100%; }

  .btn--loading .btn__label { opacity: 0.55; }
  .btn--loading { pointer-events: none; }

  .btn__spinner {
    width: 0.85em;
    height: 0.85em;
    border: 1.5px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: btn-spin 0.7s linear infinite;
  }

  @keyframes btn-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn { transition-duration: 0ms !important; }
    .btn:hover { transform: none !important; }
  }
</style>

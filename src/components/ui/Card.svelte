<script lang="ts">
  type Variant = 'flat' | 'outlined' | 'elevated' | 'grain';
  type Padding = 'none' | 'sm' | 'md' | 'lg';

  type Props = {
    variant?: Variant;
    padding?: Padding;
    href?: string;
    target?: '_self' | '_blank';
    header?: import('svelte').Snippet;
    media?: import('svelte').Snippet;
    footer?: import('svelte').Snippet;
    class?: string;
    children?: import('svelte').Snippet;
  };

  let {
    variant = 'flat',
    padding = 'md',
    href,
    target,
    header,
    media,
    footer,
    class: className = '',
    children,
  }: Props = $props();

  const classes = $derived(
    [
      'card',
      `card--${variant}`,
      `card--p-${padding}`,
      href ? 'card--interactive' : '',
      media ? 'card--has-media' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

{#snippet body()}
  {#if variant === 'grain'}<span class="grain-overlay card__grain" aria-hidden="true"></span>{/if}
  {#if media}<div class="card__media">{@render media()}</div>{/if}
  <div class="card__inner">
    {#if header}<div class="card__header">{@render header()}</div>{/if}
    <div class="card__body">{@render children?.()}</div>
    {#if footer}<div class="card__footer">{@render footer()}</div>{/if}
  </div>
{/snippet}

{#if href}
  <a class={classes} {href} {target} rel={target === '_blank' ? 'noopener noreferrer' : undefined}>
    {@render body()}
  </a>
{:else}
  <div class={classes}>
    {@render body()}
  </div>
{/if}

<style>
  .card {
    position: relative;
    display: block;
    color: var(--color-text);
    text-decoration: none;
    border-radius: 4px;
    overflow: hidden;
    transition:
      background-color var(--duration-normal) var(--ease-out-expo),
      border-color var(--duration-normal) var(--ease-out-expo),
      transform var(--duration-normal) var(--ease-out-expo),
      box-shadow var(--duration-normal) var(--ease-out-expo);
  }

  .card__inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  .card__media {
    position: relative;
    z-index: 1;
    margin: calc(-1 * var(--card-padding, 0px));
    margin-bottom: var(--card-padding, 0px);
    overflow: hidden;
  }

  .card__media :global(img),
  .card__media :global(picture),
  .card__media :global(video) {
    display: block;
    width: 100%;
    height: auto;
  }

  .card__header {
    margin-bottom: 1.25rem;
  }

  /* Footer separation: short accent hairline at top-left (editorial, not a heavy divider) */
  .card__footer {
    position: relative;
    margin-top: 1.5rem;
    padding-top: 1.25rem;
  }

  .card__footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 1.75rem;
    height: 1px;
    background: color-mix(in oklab, var(--color-accent) 55%, transparent);
  }

  /* ============================================
     VARIANTS
     ============================================ */

  /* DEFAULT: flat — soft tinted surface, no border */
  .card--flat {
    background: color-mix(in oklab, var(--color-text) 4%, transparent);
    border: 1px solid transparent;
  }

  /* Outlined: hairline border, transparent bg */
  .card--outlined {
    background: transparent;
    border: var(--border-subtle);
  }

  /* Elevated: tinted surface + layered shadow (warm halos in dark mode) */
  .card--elevated {
    background: var(--color-surface);
    border: var(--border-subtle);
    box-shadow: var(--shadow-md);
  }

  /* Grain: textured surface using shared grain overlay */
  .card--grain {
    background: var(--color-surface);
    border: var(--border-subtle);
  }

  /* Card grain is intentionally stronger than the global default so the texture is visible */
  .card__grain {
    opacity: calc(var(--grain-opacity) * 2.2);
    transition: opacity var(--duration-normal) var(--ease-out-expo);
  }

  /* ============================================
     PADDING
     ============================================ */
  .card--p-none { --card-padding: 0; padding: 0; }
  .card--p-sm   { --card-padding: clamp(0.875rem, 1.5vw, 1.25rem); padding: var(--card-padding); }
  .card--p-md   { --card-padding: clamp(1.25rem, 2.5vw, 1.75rem); padding: var(--card-padding); }
  .card--p-lg   { --card-padding: var(--space-card); padding: var(--card-padding); }

  /* ============================================
     INTERACTIVE
     ============================================ */
  .card--interactive { cursor: pointer; }

  .card--interactive.card--flat:hover {
    background: color-mix(in oklab, var(--color-text) 6%, transparent);
  }

  .card--interactive.card--outlined:hover {
    border-color: color-mix(in oklab, var(--color-accent) 50%, transparent);
  }

  .card--interactive.card--elevated:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .card--interactive.card--grain:hover .card__grain {
    opacity: calc(var(--grain-opacity) * 3);
  }

  @media (prefers-reduced-motion: reduce) {
    .card { transition: none; }
    .card--interactive.card--elevated:hover { transform: none; }
  }
</style>

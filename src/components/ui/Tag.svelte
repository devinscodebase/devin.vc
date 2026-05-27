<script lang="ts">
  type Tone = 'default' | 'accent' | 'muted' | 'inverse' | 'success' | 'warning' | 'danger';
  type Size = 'sm' | 'md';

  type Props = {
    index?: string | number;
    tone?: Tone;
    size?: Size;
    rule?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
  };

  let { index, tone = 'default', size = 'sm', rule = true, class: className = '', children }: Props = $props();

  const indexLabel = $derived(
    typeof index === 'number' ? String(index).padStart(2, '0') : index ?? null
  );

  const isFilled = $derived(tone === 'inverse' || tone === 'success' || tone === 'warning' || tone === 'danger');
</script>

<span class={`tag tag--${tone} tag--${size} ${isFilled ? 'tag--filled' : ''} ${className}`}>
  {#if indexLabel !== null && indexLabel !== undefined}
    <span class="tag__index">{indexLabel}</span>
    {#if rule}<span class="tag__rule" aria-hidden="true"></span>{/if}
  {/if}
  <span class="tag__label">{@render children?.()}</span>
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-family: var(--font-body);
    font-weight: var(--weight-medium);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--color-text-muted);
    line-height: 1;
  }

  .tag--sm { font-size: var(--text-xs); }
  .tag--md { font-size: var(--text-sm); }

  .tag--default { color: var(--color-text-muted); }
  .tag--accent  { color: var(--color-accent); }
  .tag--muted   { color: var(--color-text-subtle); }

  /* Filled chips */
  .tag--filled {
    padding: 0.35em 0.6em;
    border-radius: 2px;
    gap: 0.45rem;
  }

  .tag--inverse {
    background: var(--color-text);
    color: var(--color-bg);
  }

  .tag--success {
    background: color-mix(in oklab, var(--color-success) 18%, transparent);
    color: var(--color-success);
  }

  .tag--warning {
    background: color-mix(in oklab, var(--color-accent-amber) 18%, transparent);
    color: var(--color-accent-amber);
  }

  .tag--danger {
    background: color-mix(in oklab, var(--color-error) 16%, transparent);
    color: var(--color-error);
  }

  .tag__index {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }

  .tag__rule {
    width: 1.5rem;
    height: 1px;
    background: color-mix(in oklab, currentColor 45%, transparent);
  }

  .tag--filled .tag__rule {
    background: color-mix(in oklab, currentColor 50%, transparent);
    width: 0.85rem;
  }
</style>

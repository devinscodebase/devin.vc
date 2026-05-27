<script lang="ts">
  type Level = 1 | 2 | 3 | 4 | 5 | 6;
  type Size = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm';
  type Family = 'serif' | 'sans';
  type Tone = 'default' | 'muted' | 'accent';

  type Props = {
    level?: Level;
    size?: Size;
    family?: Family;
    tone?: Tone;
    balance?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
  };

  let {
    level = 2,
    size = '2xl',
    family = 'serif',
    tone = 'default',
    balance = true,
    class: className = '',
    children,
  }: Props = $props();

  const tag = $derived(`h${level}`);
</script>

<svelte:element
  this={tag}
  class={`heading heading--${size} heading--${family} heading--${tone} ${balance ? 'heading--balance' : ''} ${className}`}
>
  {@render children?.()}
</svelte:element>

<style>
  .heading {
    margin: 0;
    color: var(--color-text);
    line-height: 1.05;
    letter-spacing: var(--tracking-tight);
    font-style: normal;
  }

  /* Headings never render italic — even when nested em/i tags would otherwise force it. */
  .heading :global(em),
  .heading :global(i) {
    font-style: normal;
  }

  .heading--balance { text-wrap: balance; }

  .heading--serif {
    font-family: var(--font-display);
    font-weight: var(--weight-regular);
  }

  .heading--sans {
    font-family: var(--font-body);
    font-weight: var(--weight-medium);
  }

  /* Sizes map 1:1 to type-scale tokens */
  .heading--4xl { font-size: var(--text-4xl); line-height: 0.9; letter-spacing: -0.045em; }
  .heading--3xl { font-size: var(--text-3xl); line-height: 0.95; letter-spacing: -0.035em; }
  .heading--2xl { font-size: var(--text-2xl); line-height: 1.0;  letter-spacing: -0.025em; }
  .heading--xl  { font-size: var(--text-xl);  line-height: 1.08; letter-spacing: -0.02em; }
  .heading--lg  { font-size: var(--text-lg);  line-height: 1.2;  letter-spacing: -0.01em; }
  .heading--md  { font-size: var(--text-md);  line-height: 1.3;  letter-spacing: 0; }
  .heading--sm  { font-size: var(--text-base); line-height: 1.35; letter-spacing: 0; }

  /* Sans headings: slightly looser tracking */
  .heading--sans.heading--md,
  .heading--sans.heading--sm { letter-spacing: -0.005em; }

  .heading--muted  { color: var(--color-text-muted); }
  .heading--accent { color: var(--color-accent); }
</style>

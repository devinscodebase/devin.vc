<script lang="ts">
  type As = 'p' | 'span' | 'div';
  type Size = 'xs' | 'sm' | 'base' | 'md' | 'lg';
  type Tone = 'default' | 'muted' | 'subtle' | 'accent';
  type Weight = 'light' | 'regular' | 'medium';
  type Family = 'sans' | 'serif' | 'mono';
  type Leading = 'tight' | 'normal' | 'relaxed';

  type Props = {
    as?: As;
    size?: Size;
    tone?: Tone;
    weight?: Weight;
    family?: Family;
    italic?: boolean;
    leading?: Leading;
    measure?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
  };

  let {
    as = 'p',
    size = 'base',
    tone = 'default',
    weight = 'regular',
    family = 'sans',
    italic = false,
    leading = 'normal',
    measure = false,
    class: className = '',
    children,
  }: Props = $props();
</script>

<svelte:element
  this={as}
  class={`text text--${size} text--${tone} text--w-${weight} text--${family} text--lh-${leading} ${italic ? 'text--italic' : ''} ${measure ? 'text--measure' : ''} ${className}`}
>
  {@render children?.()}
</svelte:element>

<style>
  .text { margin: 0; color: var(--color-text); }

  .text--sans  { font-family: var(--font-body); }
  .text--serif { font-family: var(--font-display); }
  .text--mono  { font-family: var(--font-mono); }

  .text--italic { font-style: italic; }

  /* Funnel Display has no italic variant — italic on the display family
     produces a synthesized oblique. Force normal when combined. */
  .text--serif.text--italic { font-style: normal; }

  .text--w-light   { font-weight: var(--weight-light); }
  .text--w-regular { font-weight: var(--weight-regular); }
  .text--w-medium  { font-weight: var(--weight-medium); }

  .text--xs   { font-size: var(--text-xs);   letter-spacing: 0.015em; }
  .text--sm   { font-size: var(--text-sm); }
  .text--base { font-size: var(--text-base); }
  .text--md   { font-size: var(--text-md); }
  .text--lg   { font-size: var(--text-lg);  letter-spacing: -0.005em; }

  .text--lh-tight   { line-height: 1.25; }
  .text--lh-normal  { line-height: 1.55; }
  .text--lh-relaxed { line-height: 1.72; }

  .text--default { color: var(--color-text); }
  .text--muted   { color: var(--color-text-muted); }
  .text--subtle  { color: var(--color-text-subtle); }
  .text--accent  { color: var(--color-accent); }

  .text--measure { max-width: 62ch; }
</style>

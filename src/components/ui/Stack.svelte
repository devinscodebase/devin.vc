<script lang="ts">
  // Gap scale matches design tokens directly. Token-named gaps for layout-level
  // spacing; numeric gaps for component-internal rhythm.
  type Gap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | 'element' | 'card' | 'block' | 'block-lg' | 'section';
  type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  type Justify = 'start' | 'center' | 'end' | 'between' | 'around';
  type Direction = 'vertical' | 'horizontal';

  type Props = {
    gap?: Gap;
    align?: Align;
    justify?: Justify;
    direction?: Direction;
    wrap?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
  };

  let {
    gap = '3',
    align = 'stretch',
    justify = 'start',
    direction = 'vertical',
    wrap = false,
    class: className = '',
    children,
  }: Props = $props();
</script>

<div
  class={`stack stack--${direction} stack--gap-${gap} stack--align-${align} stack--justify-${justify} ${wrap ? 'stack--wrap' : ''} ${className}`}
>
  {@render children?.()}
</div>

<style>
  .stack { display: flex; }

  .stack--vertical   { flex-direction: column; }
  .stack--horizontal { flex-direction: row; }

  .stack--wrap { flex-wrap: wrap; }

  .stack--align-start    { align-items: flex-start; }
  .stack--align-center   { align-items: center; }
  .stack--align-end      { align-items: flex-end; }
  .stack--align-stretch  { align-items: stretch; }
  .stack--align-baseline { align-items: baseline; }

  .stack--justify-start   { justify-content: flex-start; }
  .stack--justify-center  { justify-content: center; }
  .stack--justify-end     { justify-content: flex-end; }
  .stack--justify-between { justify-content: space-between; }
  .stack--justify-around  { justify-content: space-around; }

  /* Numeric: component-internal rhythm — 4pt scale */
  .stack--gap-0 { gap: 0; }
  .stack--gap-1 { gap: 0.25rem; }  /* 4px */
  .stack--gap-2 { gap: 0.5rem; }   /* 8px */
  .stack--gap-3 { gap: 0.75rem; }  /* 12px */
  .stack--gap-4 { gap: 1rem; }     /* 16px */
  .stack--gap-5 { gap: 1.5rem; }   /* 24px */
  .stack--gap-6 { gap: 2rem; }     /* 32px */

  /* Token-named: layout-level rhythm — fluid via clamp() */
  .stack--gap-element  { gap: var(--space-element); }
  .stack--gap-card     { gap: var(--space-card); }
  .stack--gap-block    { gap: var(--space-block); }
  .stack--gap-block-lg { gap: var(--space-block-lg); }
  .stack--gap-section  { gap: var(--space-section); }
</style>

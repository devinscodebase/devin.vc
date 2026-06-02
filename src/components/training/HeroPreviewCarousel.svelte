<script>
  /*
    HeroPreviewCarousel — editorial slide deck for the training landing hero.

    Slides are rendered into the default slot by the parent. This component
    owns:
      · active slide index
      · top eyebrow ("Sample · 01 of 05") + thin advancing rule
      · bottom prev/next arrows
      · auto-advance with hover/focus pause
      · pointer swipe (touch + mouse drag)
      · prefers-reduced-motion: no auto-advance

    Visual approach is editorial, not Instagram-stories. A single thin
    horizontal rule fills L→R as the slide advances. Slide segments are
    discoverable on hover (the rule is clickable across N regions).
  */
  import { onMount } from 'svelte';

  let { count = 5, interval = 9000 } = $props();

  let active = $state(0);
  let paused = $state(false);
  let root;

  $effect(() => {
    if (!root) return;
    const slides = root.querySelectorAll('[data-slide]');
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
    });
  });

  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (!paused) active = (active + 1) % count;
    }, interval);
    return () => window.clearInterval(id);
  });

  // ── Pointer swipe ─────────────────────────────────────────────────────────
  let startX = 0;
  let dragging = false;
  function onPointerDown(e) {
    if (e.target.closest('button')) return;
    dragging = true;
    startX = e.clientX;
    paused = true;
  }
  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (dx < -40) next();
    else if (dx > 40) prev();
    pauseFor(800);
  }
  function onPointerCancel() {
    dragging = false;
    pauseFor(800);
  }
  function pauseFor(ms) {
    paused = true;
    setTimeout(() => { paused = false; }, ms);
  }
  function go(i) {
    active = i;
    pauseFor(4000);
  }
  function next() { go((active + 1) % count); }
  function prev() { go((active - 1 + count) % count); }
</script>

<div
  class="carousel"
  bind:this={root}
  onmouseenter={() => (paused = true)}
  onmouseleave={() => (paused = false)}
  onfocusin={() => (paused = true)}
  onfocusout={() => (paused = false)}
  onpointerdown={onPointerDown}
  onpointerup={onPointerUp}
  onpointercancel={onPointerCancel}
  role="region"
  aria-roledescription="carousel"
  aria-label="Sample visuals from the word list"
>
  <!-- ─── Progress rule only — eyebrow + counter were duplicating the
       slide-head; the rule alone is enough chrome at the top. ─── -->
  <div class="rule" role="tablist" aria-label="Choose slide">
    <span
      class="rule-fill"
      aria-hidden="true"
      style={`width: ${((active + 1) / count) * 100}%`}
    ></span>
    {#each Array(count) as _, i}
      <button
        type="button"
        class="rule-hit"
        class:active={i === active}
        role="tab"
        aria-selected={i === active}
        aria-label={`Show slide ${i + 1} of ${count}`}
        onclick={() => go(i)}
      ></button>
    {/each}
  </div>

  <!-- ─── Slide stack ─── -->
  <div class="slides">
    <slot />
  </div>

  <!-- ─── Bottom: prev arrow · counter · next arrow ─── -->
  <div class="foot">
    <button type="button" class="arrow" aria-label="Previous slide" onclick={prev}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 7H1M6 2L1 7l5 5" />
      </svg>
    </button>
    <span class="foot-counter" aria-live="polite">
      <span class="foot-counter-num">{String(active + 1).padStart(2, '0')}</span>
      <span class="foot-counter-sep" aria-hidden="true">/</span>
      <span class="foot-counter-total">{String(count).padStart(2, '0')}</span>
    </span>
    <button type="button" class="arrow" aria-label="Next slide" onclick={next}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 7h12M8 2l5 5-5 5" />
      </svg>
    </button>
  </div>
</div>

<style>
  .carousel {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    touch-action: pan-y;
    user-select: none;
  }

  /* ─── Single progress rule ─── */
  .rule {
    position: relative;
    height: 1px;
    background: color-mix(in oklab, var(--color-text-muted) 18%, transparent);
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
  }
  .rule-fill {
    position: absolute;
    inset: 0 auto 0 0;
    height: 1px;
    background: var(--words-accent, var(--color-accent));
    transition: width var(--duration-slow, 500ms) var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
    pointer-events: none;
  }
  .rule-hit {
    position: relative;
    /* Increase tap surface vertically without changing the visual rule */
    height: 18px;
    margin-top: -9px;
    margin-bottom: -8px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    cursor: pointer;
  }
  .rule-hit:focus-visible {
    outline: 2px solid var(--words-accent, var(--color-accent));
    outline-offset: 4px;
  }

  /* ─── Slides — stacked, crossfade in place ─── */
  .slides {
    display: grid;
    grid-template-areas: 'stack';
    min-height: 0;
    margin-top: 0.25rem;
  }
  .slides :global([data-slide]) {
    grid-area: stack;
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity var(--duration-normal, 350ms) var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
      transform var(--duration-normal, 350ms) var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
    pointer-events: none;
  }
  .slides :global([data-slide].is-active) {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  /* ─── Footer: prev · counter · next ─── */
  .foot {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    column-gap: 0.85rem;
    padding-top: 0.95rem;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
  }
  .foot-counter {
    justify-self: center;
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-subtle);
    font-variant-numeric: tabular-nums;
    letter-spacing: var(--tracking-tight);
  }
  .foot-counter-num { color: var(--color-text); font-weight: var(--weight-medium); }
  .foot-counter-sep { opacity: 0.5; }
  .arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 22%, transparent);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      color var(--duration-fast) var(--ease-out-expo),
      border-color var(--duration-fast) var(--ease-out-expo),
      background-color var(--duration-fast) var(--ease-out-expo);
  }
  .arrow:hover {
    color: var(--words-accent, var(--color-accent));
    border-color: var(--words-accent, var(--color-accent));
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 6%, transparent);
  }
  .arrow:focus-visible {
    outline: 2px solid var(--words-accent, var(--color-accent));
    outline-offset: 2px;
  }
</style>

<script>
  /*
    HeroTermLoop — the landing hero's right column.

    Crossfades through a handful of animated term examples ([data-slide]
    children supplied by the parent). Intentionally minimal chrome: a row of
    clickable dots, nothing else. Auto-advances, pauses on hover/focus, and
    under prefers-reduced-motion it holds on the first slide (no auto-motion).

    Inactive slides have their inner CSS animations paused, so each example
    plays fresh when it becomes the active slide.
  */
  import { onMount } from 'svelte';

  let { count = 5, interval = 3800 } = $props();

  let active = $state(0);
  let paused = $state(false);
  let root;

  $effect(() => {
    if (!root) return;
    const slides = root.querySelectorAll('[data-slide]');
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
  });

  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (!paused) active = (active + 1) % count;
    }, interval);
    return () => window.clearInterval(id);
  });

  function go(i) {
    active = i;
    paused = true;
    setTimeout(() => (paused = false), 5000);
  }
</script>

<div
  class="loop"
  bind:this={root}
  onmouseenter={() => (paused = true)}
  onmouseleave={() => (paused = false)}
  onfocusin={() => (paused = true)}
  onfocusout={() => (paused = false)}
  role="region"
  aria-roledescription="carousel"
  aria-label="Animated examples from the word list"
>
  <div class="stage">
    <slot />
  </div>

  <div class="dots" role="tablist" aria-label="Choose example">
    {#each Array(count) as _, i}
      <button
        type="button"
        class="dot"
        class:active={i === active}
        role="tab"
        aria-selected={i === active}
        aria-label={`Show example ${i + 1} of ${count}`}
        onclick={() => go(i)}
      ></button>
    {/each}
  </div>
</div>

<style>
  .loop {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    width: 100%;
  }

  /* Open stage — slides stacked, crossfading in place. No card chrome:
     the diagrams sit directly on the page, full-bleed and large. */
  .stage {
    position: relative;
    display: grid;
    grid-template-areas: 'stack';
  }
  /* Crossfade handoff. The hidden state doubles as the exit state, so the
     timing is split per-direction: the OUTGOING slide uses this base rule —
     a quick fade with a soft blur + sink, clearing fast so it doesn't muddy
     the overlap. The INCOMING slide uses the .is-active rule — a slower,
     slightly delayed rise + focus-pull so it settles cleanly after the old
     one has gone. z-index keeps the incoming slide painting on top. */
  .stage :global([data-slide]) {
    grid-area: stack;
    z-index: 1;
    opacity: 0;
    transform: translateY(14px) scale(0.985);
    filter: blur(7px);
    transition:
      opacity 360ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 480ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)),
      filter 360ms ease-out;
    pointer-events: none;
    will-change: opacity, transform, filter;
  }
  .stage :global([data-slide].is-active) {
    z-index: 2;
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
    transition:
      opacity 560ms cubic-bezier(0.22, 1, 0.36, 1) 110ms,
      transform 720ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) 110ms,
      filter 520ms ease-out 110ms;
    pointer-events: auto;
  }
  /* Strip animations from inactive slides entirely. Removing the override
     when a slide becomes active restarts its animations from 0 — so every
     example plays fresh each time it rotates into view. */
  .stage :global([data-slide]:not(.is-active) *) {
    animation: none !important;
  }

  /* Dots — the only chrome. */
  .dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .dot {
    width: 7px;
    height: 7px;
    padding: 0;
    border: none;
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--color-text-muted) 32%, transparent);
    cursor: pointer;
    transition:
      width var(--duration-normal, 350ms) var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)),
      background-color var(--duration-normal, 350ms) var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1));
  }
  .dot.active {
    width: 20px;
    background: var(--words-accent, var(--color-accent));
  }
  .dot:focus-visible {
    outline: 2px solid var(--words-accent, var(--color-accent));
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .stage :global([data-slide]) {
      transition: opacity 200ms linear;
      transform: none;
      filter: none;
    }
    .stage :global([data-slide].is-active) {
      transition: opacity 200ms linear;
      transform: none;
      filter: none;
    }
  }
</style>

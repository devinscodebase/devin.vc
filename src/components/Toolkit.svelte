<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let { tools = [] } = $props();
  let section;
  let activeTool = $state(null);
  let isHovering = $state(false);
  let hideTimeout;

  const categories = [
    { key: 'design-frontend', label: 'Design & Frontend', speed: '60s', direction: 'normal' },
    { key: 'backend-data', label: 'Backend & Data', speed: '75s', direction: 'reverse' },
    { key: 'infra-ops', label: 'Infrastructure & Ops', speed: '65s', direction: 'normal' },
    { key: 'marketing', label: 'Marketing & Growth', speed: '70s', direction: 'reverse' },
  ];

  const COPIES = 4;

  function getToolsByCategory(key) {
    return tools.filter(t => t.category === key);
  }

  function onChipEnter(tool) {
    clearTimeout(hideTimeout);
    activeTool = tool;
  }

  function onChipTap(tool) {
    clearTimeout(hideTimeout);
    if (activeTool?.name === tool.name) {
      activeTool = null;
      isHovering = false;
    } else {
      activeTool = tool;
      isHovering = true;
    }
  }

  function onMarqueeEnter() {
    clearTimeout(hideTimeout);
    isHovering = true;
  }

  function onMarqueeLeave() {
    isHovering = false;
    hideTimeout = setTimeout(() => {
      activeTool = null;
    }, 300);
  }

  onMount(() => {
    if (window.__vtNav) {
      section.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
      return;
    }

    const tag = section.querySelector('.section-tag');
    const header = section.querySelector('.toolkit-header');
    const rows = section.querySelectorAll('.marquee-row');

    const stop = inView(section, () => {
      animate(tag, { opacity: [0, 1], y: [8, 0] }, {
        duration: 0.35,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(header, { opacity: [0, 1], y: [12, 0] }, {
        duration: 0.4,
        delay: 0.05,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(rows, { opacity: [0, 1], y: [15, 0] }, {
        duration: 0.4,
        delay: stagger(0.1, { start: 0.12 }),
        easing: [0.25, 1, 0.5, 1],
      });

      stop();
    }, { amount: 0.15 });

    return () => {
      stop();
      clearTimeout(hideTimeout);
    };
  });
</script>

<section class="toolkit" bind:this={section}>
  <div class="toolkit-inner">
    <div class="section-tag" style="opacity: 0;"><span class="tag-number">04</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Toolkit</span></div>

    <div class="toolkit-header" style="opacity: 0;">
      <h2 class="section-heading">Tools I Work With</h2>

      <div class="detail-panel" class:is-visible={activeTool}>
        {#if activeTool}
          {#key activeTool.name}
            <div class="detail-content">
              {#if activeTool.logoUrl}
                <img
                  class="detail-logo"
                  src="{activeTool.logoUrl}"
                  alt=""
                  width="28"
                  height="28"
                />
              {/if}
              <div class="detail-text">
                <span class="detail-name">{activeTool.name}</span>
                {#if activeTool.description}
                  <span class="detail-sep" aria-hidden="true"></span>
                  <span class="detail-desc">{activeTool.description}</span>
                {/if}
              </div>
            </div>
          {/key}
        {/if}
      </div>
    </div>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="marquee-wrap"
    class:is-browsing={isHovering}
    onmouseenter={onMarqueeEnter}
    onmouseleave={onMarqueeLeave}
  >
    {#each categories as cat, i}
      {@const items = getToolsByCategory(cat.key)}
      <div
        class="marquee-row"
        style="--speed: {cat.speed}; --direction: {cat.direction}; --copies: {COPIES}; opacity: 0;"
        role="marquee"
        aria-label="{cat.label} tools"
      >
        <div class="marquee-track">
          {#each Array(COPIES) as _, copy}
            <div class="marquee-set" aria-hidden={copy > 0 ? 'true' : undefined}>
              {#each items as tool (copy + '-' + tool.name)}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span
                  class="chip"
                  class:is-active={activeTool?.name === tool.name}
                  onmouseenter={() => onChipEnter(tool)}
                  onclick={() => onChipTap(tool)}
                >
                  {#if tool.logoUrl}
                    <img
                      class="chip-logo"
                      src="{tool.logoUrl}"
                      alt=""
                      width="24"
                      height="24"
                      loading="lazy"
                      decoding="async"
                    />
                  {/if}
                  <span class="chip-name">{tool.name}</span>
                </span>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .toolkit {
    position: relative;
    padding: var(--space-section) 0;
    background: var(--color-bg);
    overflow: hidden;
  }

  .toolkit-inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 var(--space-page-x);
  }

  /* ---- Section tag ---- */
  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  .tag-number {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1rem, 1.4vw, 1.15rem);
    line-height: 1;
    color: var(--color-accent-teal);
  }

  .tag-dash {
    width: 24px;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent-teal), transparent);
  }

  .tag-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  /* ---- Header row: heading left, detail right ---- */
  .toolkit-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: clamp(2rem, 4vw, 3rem);
    margin-bottom: var(--space-block);
  }

  .section-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 400;
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: -0.02em;
    margin: 0;
    flex-shrink: 0;
  }

  /* ---- Detail panel (right of heading, capped width) ---- */
  .detail-panel {
    max-width: 420px;
    min-width: 0;
    min-height: 4.5rem;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
  }

  .detail-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    max-width: 100%;
    animation: detail-enter 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes detail-enter {
    from {
      opacity: 0;
      transform: translateY(5px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .detail-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
    flex-shrink: 0;
  }

  :global([data-theme='light']) .detail-logo {
    filter: invert(1);
  }

  .detail-text {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
  }

  .detail-name {
    font-family: 'Instrument Serif', serif;
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--color-text);
    line-height: 1;
    flex-shrink: 0;
  }

  .detail-sep {
    display: none;
  }

  .detail-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 400;
    line-height: 1.45;
    color: var(--color-text-muted);
  }

  /* ---- Marquee layout ---- */
  .marquee-wrap {
    display: flex;
    flex-direction: column;
    gap: clamp(0.85rem, 1.8vw, 1.25rem);
  }

  .marquee-row {
    position: relative;
    /* Only mask left/right edges, add vertical padding so chips aren't clipped top/bottom */
    padding: 4px 0;
    mask-image: linear-gradient(
      90deg,
      transparent 0%,
      black 8%,
      black 92%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      90deg,
      transparent 0%,
      black 8%,
      black 92%,
      transparent 100%
    );
  }

  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee-scroll var(--speed, 35s) linear infinite;
    animation-direction: var(--direction, normal);
  }

  .is-browsing .marquee-track {
    animation-play-state: paused;
  }

  @keyframes marquee-scroll {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(calc(-100% / var(--copies, 4)), 0, 0);
    }
  }

  .marquee-set {
    display: flex;
    gap: clamp(0.75rem, 1.4vw, 1.15rem);
    padding-right: clamp(0.75rem, 1.4vw, 1.15rem);
    flex-shrink: 0;
  }

  /* ---- Chip ---- */
  .chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem 1.15rem;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: 6px;
    white-space: nowrap;
    cursor: default;
    transition:
      border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* When browsing, subtly dim non-active chips */
  .is-browsing .chip {
    opacity: 0.45;
  }

  /* Active chip glows */
  .is-browsing .chip.is-active {
    opacity: 1;
    border-color: color-mix(in oklab, var(--color-accent-teal) 45%, transparent);
    background: color-mix(in oklab, var(--color-accent-teal) 5%, transparent);
    transform: scale(1.04);
  }

  .chip-logo {
    width: 24px;
    height: 24px;
    object-fit: contain;
    filter: grayscale(1) opacity(0.45);
    transition: filter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global([data-theme='light']) .chip-logo {
    filter: grayscale(1) opacity(0.45) invert(1);
  }

  .is-browsing .chip.is-active .chip-logo {
    filter: none;
  }

  :global([data-theme='light']) .is-browsing .chip.is-active .chip-logo {
    filter: invert(1);
  }

  .chip-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .is-browsing .chip.is-active .chip-name {
    color: var(--color-text);
  }

  /* ---- Reduced motion ---- */
  @media (prefers-reduced-motion: reduce) {
    .marquee-track {
      animation-play-state: paused;
    }

    .detail-content {
      animation: none;
    }
  }

  /* ---- Mobile ---- */
  @media (max-width: 640px) {
    .toolkit-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .detail-panel {
      justify-content: flex-start;
      max-width: 100%;
    }

    .chip {
      padding: 0.5rem 0.85rem;
      gap: 0.45rem;
    }

    .chip-logo {
      width: 18px;
      height: 18px;
    }

    .chip-name {
      font-size: 0.7rem;
    }

    .marquee-set {
      gap: 0.6rem;
      padding-right: 0.6rem;
    }

    .detail-logo {
      width: 22px;
      height: 22px;
    }

    .detail-name {
      font-size: 0.95rem;
    }

    .detail-desc {
      font-size: 0.75rem;
    }
  }

  /* On touch devices, reduce reserved height since it's tap-to-show */
  @media (hover: none) {
    .detail-panel {
      min-height: 0;
    }
  }
</style>

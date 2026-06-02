<script>
  /*
    Ad Format visual — interactive comparator.

    Six common ad format aspect ratios shown at proportional scale so the
    viewer can feel how dramatically a 9:16 Story differs from a 16:9
    YouTube ad differs from a 320×50 banner. Click any chip to "select"
    it — the chip scales up, gets the accent fill, and a label slides
    out with the use case. Picks up the parent's --words-accent so it
    re-tints by word list.
  */
  let selected = $state('1:1');

  const formats = [
    { id: '1:1',     w: 1,   h: 1,   label: 'Square',      use: 'Instagram and Facebook feed posts',  icon: 'frame' },
    { id: '4:5',     w: 4,   h: 5,   label: 'Portrait',    use: 'Instagram feed — biggest thumb space', icon: 'frame' },
    { id: '9:16',    w: 9,   h: 16,  label: 'Vertical',    use: 'Stories, Reels, TikTok, Shorts',      icon: 'phone' },
    { id: '16:9',    w: 16,  h: 9,   label: 'Landscape',   use: 'YouTube and in-stream video',          icon: 'play'  },
    { id: '300x250', w: 300, h: 250, label: 'Rectangle',   use: '300×250 display "MPU" — in-article',  icon: 'box'   },
    { id: '320x50',  w: 320, h: 50,  label: 'Mobile Banner', use: '320×50 banner — top of mobile pages', icon: 'bar'  },
  ];

  // Normalize so all chips fit within a shared bounding box; we set a max
  // edge per chip and let the other dimension scale by aspect.
  const MAX_W = 96;
  const MAX_H = 96;
  function dims(f) {
    const ratio = f.w / f.h;
    if (ratio >= 1) {
      const width = MAX_W;
      const height = width / ratio;
      return { width, height };
    } else {
      const height = MAX_H;
      const width = height * ratio;
      return { width, height };
    }
  }
</script>

<div class="ad-format">
  <div class="rail" role="radiogroup" aria-label="Ad format comparator">
    {#each formats as f}
      {@const d = dims(f)}
      <button
        type="button"
        class="chip"
        class:selected={selected === f.id}
        role="radio"
        aria-checked={selected === f.id}
        aria-label={`${f.label} format, ${f.id}`}
        onclick={() => selected = f.id}
      >
        <span class="frame-shell">
          <span
            class="frame"
            style="width: {d.width}px; height: {d.height}px;"
          >
            {#if f.icon === 'phone'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
                <rect x="7" y="3" width="10" height="18" rx="2"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
            {:else if f.icon === 'play'}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="9,7 19,12 9,17"/>
              </svg>
            {:else if f.icon === 'bar'}
              <svg viewBox="0 0 24 8" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
                <line x1="4" y1="4" x2="20" y2="4"/>
              </svg>
            {:else if f.icon === 'box'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
                <rect x="5" y="7" width="14" height="10" rx="1.5"/>
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
                <rect x="5" y="5" width="14" height="14" rx="1.5"/>
              </svg>
            {/if}
          </span>
        </span>
        <span class="ratio">{f.id}</span>
        <span class="name">{f.label}</span>
      </button>
    {/each}
  </div>

  <div class="caption" aria-live="polite">
    {#each formats as f}
      {#if selected === f.id}
        <span class="caption-id">{f.id}</span>
        <span class="caption-sep" aria-hidden="true">·</span>
        <span class="caption-use">{f.use}</span>
      {/if}
    {/each}
  </div>
</div>

<style>
  .ad-format {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem 1.25rem 1rem;
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-lg);
  }

  .rail {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    align-items: end;
    gap: 0.5rem;
  }

  @media (max-width: 560px) {
    .rail { grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
  }

  .chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.25rem 0.4rem;
    background: transparent;
    border: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
    transition: transform var(--duration-fast) var(--ease-spring);
  }
  .chip:hover { transform: translateY(-2px); }

  .frame-shell {
    /* Reserve a constant 96×96 slot so chips align even when frames are tiny (banner). */
    width: 96px;
    height: 96px;
    display: grid;
    place-items: center;
  }

  .frame {
    display: grid;
    place-items: center;
    background: color-mix(in oklab, var(--color-text-muted) 8%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 22%, transparent);
    border-radius: var(--radius-sm);
    color: color-mix(in oklab, var(--color-text-muted) 55%, transparent);
    transition:
      background var(--duration-fast) var(--ease-out-expo),
      border-color var(--duration-fast) var(--ease-out-expo),
      color var(--duration-fast) var(--ease-out-expo);
  }
  .frame :global(svg) { width: 38%; height: 38%; max-width: 22px; max-height: 22px; }

  .chip.selected .frame {
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 14%, transparent);
    border-color: var(--words-accent, var(--color-accent));
    color: var(--words-accent, var(--color-accent));
  }

  .ratio {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.02em;
    color: var(--color-text-muted);
    transition: color var(--duration-fast) var(--ease-out-expo);
  }
  .chip.selected .ratio { color: var(--words-accent, var(--color-accent)); }

  .name {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    transition: color var(--duration-fast) var(--ease-out-expo);
  }
  .chip.selected .name { color: var(--color-text); }

  .caption {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.65rem 0.25rem 0;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    min-height: 1.4em;
  }
  .caption-id {
    font-family: var(--font-mono);
    color: var(--words-accent, var(--color-accent));
    font-size: var(--text-xs);
    letter-spacing: 0.02em;
  }
  .caption-sep { opacity: 0.5; }
  .caption-use { color: var(--color-text); }

  @media (prefers-reduced-motion: reduce) {
    .chip, .frame, .ratio, .name { transition: none; }
    .chip:hover { transform: none; }
  }
</style>

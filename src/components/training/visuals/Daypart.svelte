<script>
  /*
    Daypart visual — 24-hour ring with five named dayparts as colored
    wedges. Hover/tap a wedge to see its time range and relative cost.
  */
  let selected = $state('morning');

  // (start hour, end hour) — end may wrap past 24
  const parts = [
    { id: 'overnight',  label: 'Overnight',  start: 0,  end: 6,  cost: 'Lowest',     desc: 'Late-night and early morning' },
    { id: 'morning',    label: 'Morning drive', start: 6, end: 10, cost: 'Premium',  desc: 'Commute hours — most listened-to' },
    { id: 'midday',     label: 'Midday',      start: 10, end: 15, cost: 'Mid',       desc: 'Office and home listening' },
    { id: 'afternoon',  label: 'Afternoon drive', start: 15, end: 19, cost: 'Premium', desc: 'Return commute — second peak' },
    { id: 'evening',    label: 'Evening',     start: 19, end: 24, cost: 'Mid',       desc: 'Dinner through late evening' },
  ];

  // Convert hour to angle from top, going clockwise
  // Start at top (12 o'clock = midnight). 360° = 24 hours.
  function hourToAngle(h) {
    return (h / 24) * 360;
  }

  // Build an SVG arc path between two angles, on a ring with inner+outer radius
  function arcPath(startA, endA, outerR, innerR) {
    const cx = 100, cy = 100;
    const toRad = (deg) => (deg - 90) * Math.PI / 180;
    const x1 = cx + outerR * Math.cos(toRad(startA));
    const y1 = cy + outerR * Math.sin(toRad(startA));
    const x2 = cx + outerR * Math.cos(toRad(endA));
    const y2 = cy + outerR * Math.sin(toRad(endA));
    const x3 = cx + innerR * Math.cos(toRad(endA));
    const y3 = cy + innerR * Math.sin(toRad(endA));
    const x4 = cx + innerR * Math.cos(toRad(startA));
    const y4 = cy + innerR * Math.sin(toRad(startA));
    const largeArc = (endA - startA) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  const selectedPart = $derived(parts.find(p => p.id === selected));

  function fmtHour(h) {
    if (h === 0) return '12a';
    if (h === 12) return '12p';
    if (h < 12) return `${h}a`;
    return `${h - 12}p`;
  }
</script>

<div class="daypart">
  <div class="grid">
    <div class="clock-wrap">
      <svg viewBox="0 0 200 200" class="clock" aria-label="24-hour daypart ring">
        <!-- Wedges -->
        {#each parts as p}
          <path
            d={arcPath(hourToAngle(p.start), hourToAngle(p.end), 90, 56)}
            class={`wedge wedge-${p.id}`}
            class:active={selected === p.id}
            onmouseenter={() => selected = p.id}
            onfocus={() => selected = p.id}
            onclick={() => selected = p.id}
            role="button"
            tabindex="0"
            aria-label={`${p.label}, ${fmtHour(p.start)} to ${fmtHour(p.end)}`}
          />
        {/each}

        <!-- Hour ticks -->
        {#each [0, 6, 12, 18] as h}
          {@const a = hourToAngle(h)}
          {@const rad = (a - 90) * Math.PI / 180}
          <line
            x1={100 + 92 * Math.cos(rad)}
            y1={100 + 92 * Math.sin(rad)}
            x2={100 + 98 * Math.cos(rad)}
            y2={100 + 98 * Math.sin(rad)}
            class="tick"
          />
          <text
            x={100 + 108 * Math.cos(rad)}
            y={100 + 108 * Math.sin(rad)}
            text-anchor="middle"
            dominant-baseline="middle"
            class="hour-label"
          >{fmtHour(h)}</text>
        {/each}

        <!-- Center label -->
        <text x="100" y="96" text-anchor="middle" class="center-num">24h</text>
        <text x="100" y="112" text-anchor="middle" class="center-sub">DAY</text>
      </svg>
    </div>

    <div class="readout">
      <div class="readout-head">
        <span class="readout-label">{selectedPart?.label}</span>
        <span class={`cost-chip cost-${selectedPart?.cost.toLowerCase()}`}>{selectedPart?.cost}</span>
      </div>
      <div class="readout-time">
        {fmtHour(selectedPart?.start)} — {fmtHour(selectedPart?.end)}
      </div>
      <p class="readout-desc">{selectedPart?.desc}</p>
      <ul class="parts-list">
        {#each parts as p}
          <li>
            <button
              type="button"
              class="part-btn"
              class:active={selected === p.id}
              onclick={() => selected = p.id}
            >
              <span class={`part-swatch swatch-${p.id}`}></span>
              <span class="part-name">{p.label}</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<style>
  .daypart {
    padding: 1.25rem;
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-lg);
  }

  .grid {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 1.5rem;
    align-items: center;
  }
  @media (max-width: 580px) { .grid { grid-template-columns: 1fr; } }

  .clock-wrap { display: grid; place-items: center; }
  .clock { width: 100%; max-width: 220px; }

  /* Wedge base — fills get assigned per id */
  .wedge {
    stroke: var(--color-bg);
    stroke-width: 1.5;
    cursor: pointer;
    transition: opacity var(--duration-fast) var(--ease-out-expo), transform var(--duration-fast) var(--ease-spring);
    transform-origin: 100px 100px;
    opacity: 0.45;
  }
  .wedge:hover, .wedge:focus-visible, .wedge.active { opacity: 1; outline: none; }
  .wedge.active { transform: scale(1.04); }

  .wedge-overnight  { fill: color-mix(in oklab, var(--color-text-muted) 45%, transparent); }
  .wedge-morning    { fill: var(--words-accent, var(--color-accent)); }
  .wedge-midday     { fill: color-mix(in oklab, var(--color-accent-teal) 70%, transparent); }
  .wedge-afternoon  { fill: var(--color-accent-rust); }
  .wedge-evening    { fill: color-mix(in oklab, var(--color-accent-amber) 65%, transparent); }

  .tick { stroke: var(--color-text-subtle); stroke-width: 1; }
  .hour-label {
    font-family: var(--font-mono);
    font-size: 7px;
    fill: var(--color-text-muted);
  }
  .center-num {
    font-family: var(--font-display);
    font-size: 18px;
    fill: var(--color-text);
  }
  .center-sub {
    font-family: var(--font-body);
    font-size: 6px;
    letter-spacing: 0.2em;
    fill: var(--color-text-subtle);
  }

  /* ─── Readout ─── */
  .readout { display: flex; flex-direction: column; gap: 0.55rem; }
  .readout-head { display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
  .readout-label {
    font-family: var(--font-display);
    font-size: var(--text-md);
    color: var(--color-text);
  }
  .cost-chip {
    padding: 0.18rem 0.5rem;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
  }
  .cost-premium {
    color: var(--color-bg);
    background: var(--words-accent, var(--color-accent));
  }
  .cost-mid {
    color: var(--color-text);
    background: color-mix(in oklab, var(--color-text-muted) 14%, transparent);
  }
  .cost-lowest {
    color: var(--color-text-muted);
    background: color-mix(in oklab, var(--color-text-muted) 8%, transparent);
  }
  .readout-time {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  .readout-desc {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text);
    margin: 0;
    line-height: 1.5;
  }

  .parts-list {
    list-style: none; margin: 0.45rem 0 0; padding: 0;
    display: flex; flex-wrap: wrap; gap: 0.3rem;
  }
  .part-btn {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 14%, transparent);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    transition: border-color var(--duration-fast), color var(--duration-fast);
  }
  .part-btn.active { color: var(--color-text); border-color: var(--words-accent, var(--color-accent)); }

  .part-swatch { width: 8px; height: 8px; border-radius: var(--radius-full); }
  .swatch-overnight  { background: color-mix(in oklab, var(--color-text-muted) 45%, transparent); }
  .swatch-morning    { background: var(--words-accent, var(--color-accent)); }
  .swatch-midday     { background: color-mix(in oklab, var(--color-accent-teal) 70%, transparent); }
  .swatch-afternoon  { background: var(--color-accent-rust); }
  .swatch-evening    { background: color-mix(in oklab, var(--color-accent-amber) 65%, transparent); }

  @media (prefers-reduced-motion: reduce) {
    .wedge { transition: none; transform: none !important; }
  }
</style>

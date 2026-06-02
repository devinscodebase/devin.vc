<script>
  /*
    ROAS visual — interactive money-in / money-out calculator.

    Two sliders (Ad spend, Revenue) drive a live ROAS multiplier that
    shifts color band as it crosses break-even and "good campaign"
    thresholds. The chart in the middle is a proportional bar pair
    (spend bar vs revenue bar) so the multiplier becomes visceral.

    Defaults to a clean 4x example so the static state already explains
    the term without interaction.
  */

  let spend = $state(1000);
  let revenue = $state(4000);

  const roas = $derived(spend > 0 ? revenue / spend : 0);

  // Color band logic — tuned so the default 4× lands in the warm "Profitable"
  // band (accent gold) rather than the green "Strong" band, which only fires
  // when ROAS is truly exceptional.
  const band = $derived(
    roas < 1 ? 'loss' :
    roas < 2 ? 'flat' :
    roas < 6 ? 'good' :
    'great'
  );

  // Width ratio for the two bars — clamp so extreme values stay readable
  const maxVal = $derived(Math.max(spend, revenue, 1));
  const spendPct = $derived(Math.max(8, (spend / maxVal) * 100));
  const revenuePct = $derived(Math.max(8, (revenue / maxVal) * 100));

  function fmt(n) {
    if (n >= 1000) return '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return '$' + Math.round(n).toLocaleString();
  }

  function fmtRoas(n) {
    if (!isFinite(n) || n === 0) return '0×';
    if (n >= 10) return n.toFixed(0) + '×';
    return n.toFixed(n === Math.floor(n) ? 0 : 1) + '×';
  }
</script>

<div class="roas">
  <!-- Headline ROAS multiplier -->
  <div class="readout">
    <div class="multiplier band-{band}">
      <span class="multiplier-num">{fmtRoas(roas)}</span>
      <span class="multiplier-label">ROAS</span>
    </div>
    <div class="formula">
      <span class="formula-row">
        <span class="formula-input">{fmt(revenue)}</span>
        <span class="formula-op">÷</span>
        <span class="formula-input">{fmt(spend)}</span>
        <span class="formula-op">=</span>
        <span class="formula-result band-{band}">{fmtRoas(roas)}</span>
      </span>
      <span class="formula-legend">Revenue · Spend</span>
    </div>
  </div>

  <!-- Proportional bars -->
  <div class="bars" aria-hidden="true">
    <div class="bar-row">
      <span class="bar-label">Spend</span>
      <div class="bar-track">
        <div class="bar bar-spend" style="width: {spendPct}%;"></div>
      </div>
      <span class="bar-value">{fmt(spend)}</span>
    </div>
    <div class="bar-row">
      <span class="bar-label">Revenue</span>
      <div class="bar-track">
        <div class="bar bar-revenue band-{band}" style="width: {revenuePct}%;"></div>
      </div>
      <span class="bar-value">{fmt(revenue)}</span>
    </div>
  </div>

  <!-- Sliders -->
  <div class="controls">
    <label class="control">
      <span class="control-label">
        <span class="control-name">Ad spend</span>
        <span class="control-value">{fmt(spend)}</span>
      </span>
      <input
        type="range"
        min="100"
        max="10000"
        step="100"
        bind:value={spend}
        aria-label="Ad spend in dollars"
      />
    </label>

    <label class="control">
      <span class="control-label">
        <span class="control-name">Revenue from ads</span>
        <span class="control-value">{fmt(revenue)}</span>
      </span>
      <input
        type="range"
        min="0"
        max="40000"
        step="100"
        bind:value={revenue}
        aria-label="Revenue from ads in dollars"
      />
    </label>
  </div>

  <!-- Band legend -->
  <div class="band-legend">
    <span class="band-chip band-loss" class:active={band === 'loss'}>Losing money</span>
    <span class="band-chip band-flat" class:active={band === 'flat'}>Break-even</span>
    <span class="band-chip band-good" class:active={band === 'good'}>Profitable</span>
    <span class="band-chip band-great" class:active={band === 'great'}>Strong</span>
  </div>
</div>

<style>
  .roas {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem 1.25rem 1.1rem;
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-lg);
  }

  /* ─── Headline readout ─── */
  .readout {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding-bottom: 0.85rem;
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  .multiplier {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }
  .multiplier-num {
    font-family: var(--font-display);
    font-size: clamp(2.25rem, 5vw, 3.25rem);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-tight);
    line-height: 1;
    color: var(--band-color, var(--words-accent, var(--color-accent)));
    font-variant-numeric: tabular-nums;
  }
  .multiplier-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .formula {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: flex-end;
    text-align: right;
  }
  .formula-row {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }
  .formula-input { color: var(--color-text); }
  .formula-op { color: var(--color-text-subtle); opacity: 0.7; }
  .formula-result {
    color: var(--band-color, var(--words-accent, var(--color-accent)));
    font-weight: 600;
  }
  .formula-legend {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    opacity: 0.7;
  }

  /* ─── Band colors — assigned to a CSS var so it cascades to all child color: var(--band-color) ─── */
  .band-loss  { --band-color: var(--color-error); }
  .band-flat  { --band-color: var(--color-text-muted); }
  .band-good  { --band-color: var(--words-accent, var(--color-accent)); }
  .band-great { --band-color: var(--color-success); }

  /* ─── Bars ─── */
  .bars {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .bar-row {
    display: grid;
    grid-template-columns: 88px 1fr 64px;
    align-items: center;
    gap: 0.75rem;
  }
  .bar-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .bar-track {
    height: 10px;
    background: color-mix(in oklab, var(--color-text-muted) 8%, transparent);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .bar {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width var(--duration-normal) var(--ease-out-expo);
  }
  .bar-spend {
    background: linear-gradient(
      90deg,
      color-mix(in oklab, var(--color-text-muted) 55%, transparent),
      color-mix(in oklab, var(--color-text-muted) 40%, transparent)
    );
  }
  .bar-revenue {
    background: linear-gradient(
      90deg,
      var(--band-color, var(--words-accent, var(--color-accent))),
      color-mix(in oklab, var(--band-color, var(--words-accent, var(--color-accent))) 75%, transparent)
    );
  }
  .bar-value {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* ─── Sliders ─── */
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding-top: 0.4rem;
  }
  .control {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .control-label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .control-name {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .control-value {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
  }

  /* Range slider styling — webkit + moz */
  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: color-mix(in oklab, var(--color-text-muted) 14%, transparent);
    border-radius: var(--radius-full);
    outline: none;
    cursor: pointer;
  }
  input[type='range']:focus-visible {
    outline: 2px solid var(--words-accent, var(--color-accent));
    outline-offset: 4px;
    border-radius: var(--radius-sm);
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--words-accent, var(--color-accent));
    border-radius: var(--radius-full);
    border: 2px solid var(--color-bg);
    cursor: grab;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    transition: transform var(--duration-fast) var(--ease-spring);
  }
  input[type='range']::-webkit-slider-thumb:active {
    cursor: grabbing;
    transform: scale(1.15);
  }
  input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--words-accent, var(--color-accent));
    border-radius: var(--radius-full);
    border: 2px solid var(--color-bg);
    cursor: grab;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  }

  /* ─── Band legend ─── */
  .band-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding-top: 0.4rem;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }
  .band-chip {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.22rem 0.55rem;
    border-radius: var(--radius-sm);
    color: var(--color-text-subtle);
    background: color-mix(in oklab, var(--color-text-muted) 5%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    transition:
      color var(--duration-fast) var(--ease-out-expo),
      background var(--duration-fast) var(--ease-out-expo),
      border-color var(--duration-fast) var(--ease-out-expo);
  }
  .band-chip.active {
    color: var(--band-color);
    background: color-mix(in oklab, var(--band-color) 10%, transparent);
    border-color: color-mix(in oklab, var(--band-color) 35%, transparent);
  }

  @media (max-width: 480px) {
    .readout { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    .formula { align-items: flex-start; text-align: left; }
    .bar-row { grid-template-columns: 64px 1fr 60px; gap: 0.5rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bar, .multiplier, .band-chip { transition: none; }
  }
</style>

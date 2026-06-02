<script>
  /*
    A/B Test — stripped down. Two variant cards with their CTRs, a
    winner badge on B, and a small re-run affordance. No splitter,
    no fork, no meta strip.
  */
  import { TrophyIcon, RefreshCwIcon } from 'lucide-svelte';

  const targetA = 2.1;
  const targetB = 3.8;

  let aPct = $state(targetA);
  let bPct = $state(targetB);
  let running = $state(false);

  function runTest() {
    if (running) return;
    running = true;
    aPct = 0;
    bPct = 0;
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      aPct = +(targetA * eased).toFixed(1);
      bPct = +(targetB * eased).toFixed(1);
      if (t < 1) requestAnimationFrame(step);
      else running = false;
    }
    requestAnimationFrame(step);
  }
</script>

<div class="ab">
  <div class="grid">
    <article class="variant" class:winner={!running && bPct < aPct}>
      <div class="variant-head">
        <span class="variant-tag">A</span>
        <span class="variant-name">Better sleep, guaranteed.</span>
      </div>
      <div class="metric">
        <span class="metric-num">{aPct.toFixed(1)}%</span>
        <span class="metric-key">CTR</span>
      </div>
    </article>

    <article class="variant" class:winner={!running && bPct > aPct}>
      <div class="variant-head">
        <span class="variant-tag tag-b">B</span>
        <span class="variant-name">Sleep like it's 1995.</span>
      </div>
      <div class="metric">
        <span class="metric-num">{bPct.toFixed(1)}%</span>
        <span class="metric-key">CTR</span>
      </div>
      {#if !running && bPct > aPct}
        <span class="winner-badge">
          <TrophyIcon size={12} />
          Winner
        </span>
      {/if}
    </article>
  </div>

  <div class="footer">
    <span class="result">
      {#if running}
        Running test…
      {:else}
        <strong>B wins</strong> by {(bPct - aPct).toFixed(1)} points
      {/if}
    </span>
    <button type="button" class="btn" onclick={runTest} disabled={running}>
      <RefreshCwIcon size={12} />
      Re-run
    </button>
  </div>
</div>

<style>
  .ab {
    padding: 1.5rem;
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.85rem;
  }
  @media (max-width: 540px) {
    .grid { grid-template-columns: 1fr; }
  }

  .variant {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 1rem;
    background: var(--color-surface);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-md);
    transition: border-color var(--duration-normal) var(--ease-out-expo), background var(--duration-normal) var(--ease-out-expo);
  }
  .variant.winner {
    border-color: var(--words-accent, var(--color-accent));
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 6%, transparent);
  }

  .variant-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .variant-tag {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--color-text-muted) 18%, transparent);
    color: var(--color-text);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    line-height: 1;
    flex-shrink: 0;
  }
  .variant-tag.tag-b {
    background: var(--words-accent, var(--color-accent));
    color: var(--color-bg);
  }
  .variant-name {
    font-family: var(--font-display);
    font-size: var(--text-md);
    color: var(--color-text);
    line-height: 1.25;
  }

  .metric {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }
  .metric-num {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    line-height: 1;
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    font-variant-numeric: tabular-nums;
  }
  .variant.winner .metric-num { color: var(--words-accent, var(--color-accent)); }
  .metric-key {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .winner-badge {
    position: absolute;
    top: -10px;
    right: 12px;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.55rem;
    background: var(--words-accent, var(--color-accent));
    color: var(--color-bg);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
    box-shadow: 0 2px 4px color-mix(in oklab, black 12%, transparent);
  }
  .winner-badge :global(svg) { width: 12px; height: 12px; }

  /* ─── Footer ─── */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
    padding-top: 0.75rem;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }
  .result {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  .result strong {
    color: var(--words-accent, var(--color-accent));
    font-weight: var(--weight-medium);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 18%, transparent);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color var(--duration-fast), border-color var(--duration-fast);
  }
  .btn :global(svg) { width: 12px; height: 12px; }
  .btn:hover:not(:disabled) {
    color: var(--words-accent, var(--color-accent));
    border-color: var(--words-accent, var(--color-accent));
  }
  .btn:disabled { opacity: 0.5; cursor: wait; }

  @media (prefers-reduced-motion: reduce) {
    .variant { transition: none; }
  }
</style>

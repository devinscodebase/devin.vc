<script>
  /*
    Lookalike Audience visual — seed audience on the left, similarity slider
    in the middle, expanded lookalike cluster on the right. Sliding the
    expansion factor grows the lookalike cluster smoothly.
  */
  let expansion = $state(5);  // 1, 2, 5, 10 — percent of country

  const seedSize = 8;
  const ringSizes = { 1: 18, 2: 32, 5: 60, 10: 100 };
  const ringSize = $derived(ringSizes[expansion]);
  const reachLabel = $derived({
    1:  '~1% of country · tightest match',
    2:  '~2% of country · close match',
    5:  '~5% of country · balanced',
    10: '~10% of country · widest reach',
  }[expansion]);
</script>

<div class="lookalike">
  <div class="canvas">
    <!-- Seed audience -->
    <div class="cluster seed">
      <div class="cluster-label">Your seed audience</div>
      <div class="cluster-area">
        {#each Array(seedSize) as _, i}
          <span class="dot dot-seed"
            style="
              left: {25 + Math.cos(i * 2 * Math.PI / seedSize) * 18 + (i * 7 % 6 - 3)}%;
              top: {50 + Math.sin(i * 2 * Math.PI / seedSize) * 28 + (i * 5 % 6 - 3)}%;
            "></span>
        {/each}
      </div>
      <div class="cluster-meta">~1,000 customers</div>
    </div>

    <!-- Arrow + slider -->
    <div class="middle">
      <svg class="arrow" viewBox="0 0 60 24" aria-hidden="true">
        <line x1="0" y1="12" x2="50" y2="12"/>
        <polyline points="42,5 50,12 42,19" fill="none"/>
      </svg>
      <div class="middle-label">Similarity</div>
    </div>

    <!-- Lookalike audience -->
    <div class="cluster lookalike-cluster">
      <div class="cluster-label">Lookalike audience</div>
      <div class="cluster-area">
        <!-- Concentric ring scaled by expansion -->
        <span class="ring" style="width: {ringSize * 1.4}%; height: {ringSize * 1.4}%;"></span>
        <span class="ring ring-inner" style="width: {ringSize}%; height: {ringSize}%;"></span>
        <!-- Random dots -->
        {#each Array(Math.round(8 + expansion * 6)) as _, i}
          {@const seed = i * 1271 % 100}
          <span class="dot dot-lookalike"
            style="
              left: {15 + (seed * 7 % 60)}%;
              top: {15 + ((seed * 13 + 3) % 60)}%;
            "></span>
        {/each}
      </div>
      <div class="cluster-meta">{reachLabel}</div>
    </div>
  </div>

  <!-- Expansion control -->
  <div class="controls" role="radiogroup" aria-label="Expansion factor">
    <span class="controls-label">Expand to:</span>
    {#each [1, 2, 5, 10] as e}
      <button
        type="button"
        class="exp-btn"
        class:active={expansion === e}
        onclick={() => expansion = e}
        role="radio"
        aria-checked={expansion === e}
      >{e}%</button>
    {/each}
  </div>
</div>

<style>
  .lookalike {
    padding: 1.25rem;
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-lg);
    display: flex; flex-direction: column; gap: 0.85rem;
  }

  .canvas {
    display: grid;
    grid-template-columns: 1fr 80px 1fr;
    gap: 0.5rem;
    align-items: stretch;
  }
  @media (max-width: 580px) {
    .canvas { grid-template-columns: 1fr; grid-template-rows: auto 60px auto; }
    .arrow { transform: rotate(90deg); }
  }

  .cluster {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.8rem;
    background: var(--color-surface);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-md);
    min-height: 180px;
  }
  .cluster-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .cluster-area { position: relative; flex: 1; }
  .cluster-meta {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .dot {
    position: absolute;
    width: 8px; height: 8px;
    border-radius: var(--radius-full);
    transform: translate(-50%, -50%);
  }
  .dot-seed {
    background: var(--words-accent, var(--color-accent));
  }
  .dot-lookalike {
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 65%, transparent);
    transition: opacity var(--duration-fast) var(--ease-out-expo);
  }

  .ring {
    position: absolute;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 10%, transparent);
    border: 1px dashed color-mix(in oklab, var(--words-accent, var(--color-accent)) 40%, transparent);
    transition: width var(--duration-normal) var(--ease-out-expo), height var(--duration-normal) var(--ease-out-expo);
  }
  .ring-inner {
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 18%, transparent);
    border: 1px dashed color-mix(in oklab, var(--words-accent, var(--color-accent)) 60%, transparent);
  }

  .middle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
  .arrow {
    width: 100%;
    color: var(--words-accent, var(--color-accent));
    stroke: currentColor;
    stroke-width: 1.5;
    fill: none;
  }
  .middle-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding-top: 0.4rem;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }
  .controls-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin-right: auto;
  }
  .exp-btn {
    padding: 0.25rem 0.6rem;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 14%, transparent);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: color var(--duration-fast), border-color var(--duration-fast), background var(--duration-fast);
  }
  .exp-btn:hover {
    color: var(--color-text);
    border-color: color-mix(in oklab, var(--words-accent, var(--color-accent)) 50%, transparent);
  }
  .exp-btn.active {
    background: var(--words-accent, var(--color-accent));
    color: var(--color-bg);
    border-color: var(--words-accent, var(--color-accent));
  }

  @media (prefers-reduced-motion: reduce) {
    .ring { transition: none; }
  }
</style>

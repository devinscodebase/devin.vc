<script>
  /*
    Headline visual — side-by-side weak/strong comparison.

    Two ad mocks shown together. The weak one and the strong one are
    visible at the same time so the difference is immediate. Scroll-stop
    rate sits inline below each headline as a tiny inline metric.
    No toggle, no stretched single-column layout.
  */

  const variants = [
    {
      tier: 'weak',
      tag: 'Weak',
      headline: 'Welcome to Rest Studio',
      body: 'We sell mattresses online with free shipping.',
      stopRate: 0.4,
      verdict: 'Scrolled past',
    },
    {
      tier: 'strong',
      tag: 'Strong',
      headline: 'Sleep like it\'s 1995.',
      body: 'Memory foam, 100-night trial, free returns.',
      stopRate: 5.8,
      verdict: 'Stopped the scroll',
    },
  ];
</script>

<div class="hl">
  <div class="grid">
    {#each variants as v}
      <article class={`card tier-${v.tier}`}>
        <div class="card-tag">
          <span class="dot"></span>
          {v.tag} headline
        </div>

        <div class="ad">
          <div class="ad-art" aria-hidden="true">
            <svg viewBox="0 0 100 50" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id={`hl-${v.tier}`} x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stop-color="currentColor" stop-opacity="0.4"/>
                  <stop offset="1" stop-color="currentColor" stop-opacity="0.08"/>
                </linearGradient>
              </defs>
              <rect width="100" height="50" fill={`url(#hl-${v.tier})`}/>
              <circle cx="72" cy="22" r="7" fill="currentColor" opacity="0.7"/>
              <path d="M0,42 Q26,30 50,38 T100,32 L100,50 L0,50 Z" fill="currentColor" opacity="0.5"/>
            </svg>
          </div>
          <div class="ad-text">
            <h5 class="ad-headline">{v.headline}</h5>
            <p class="ad-body">{v.body}</p>
          </div>
        </div>

        <div class="metric">
          <span class="metric-num">{v.stopRate.toFixed(1)}%</span>
          <div class="metric-bar">
            <span class="metric-fill" style={`width: ${Math.min(v.stopRate * 14, 100)}%`}></span>
          </div>
          <span class="metric-key">scroll-stop rate</span>
        </div>

        <div class={`verdict verdict-${v.tier}`}>
          <span class="verdict-icon" aria-hidden="true">{v.tier === 'strong' ? '✓' : '×'}</span>
          {v.verdict}
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  .hl {
    padding: 1.5rem;
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-lg);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 540px) {
    .grid { grid-template-columns: 1fr; }
  }

  /* ─── Card ─── */
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 1rem;
    background: var(--color-surface);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-md);
  }
  .card.tier-strong {
    border-color: color-mix(in oklab, var(--words-accent, var(--color-accent)) 40%, transparent);
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 4%, transparent);
  }

  .card-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .card.tier-strong .card-tag { color: var(--words-accent, var(--color-accent)); }
  .dot {
    width: 7px; height: 7px;
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--color-text-muted) 35%, transparent);
  }
  .card.tier-strong .dot { background: var(--words-accent, var(--color-accent)); }

  /* ─── Ad mock ─── */
  .ad {
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: color-mix(in oklab, var(--color-text-muted) 6%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }
  .ad-art {
    aspect-ratio: 5 / 2;
    color: var(--words-accent, var(--color-accent));
  }
  .ad-art svg { width: 100%; height: 100%; display: block; }
  .ad-text {
    padding: 0.7rem 0.85rem 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .ad-headline {
    font-family: var(--font-display);
    font-size: var(--text-md);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    margin: 0;
    line-height: 1.2;
    /* Ensure both headlines occupy the same min-height for visual symmetry */
    min-height: 1.4em;
  }
  .ad-body {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    line-height: 1.45;
    color: var(--color-text-muted);
    margin: 0;
  }

  /* ─── Metric (inline horizontal bar + readout) ─── */
  .metric {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    column-gap: 0.65rem;
    row-gap: 0.25rem;
    align-items: center;
  }
  .metric-num {
    grid-column: 1;
    grid-row: 1;
    font-family: var(--font-display);
    font-size: var(--text-md);
    color: var(--color-text);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .card.tier-strong .metric-num { color: var(--words-accent, var(--color-accent)); }
  .metric-bar {
    grid-column: 2;
    grid-row: 1;
    height: 4px;
    background: color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .metric-fill {
    display: block;
    height: 100%;
    background: color-mix(in oklab, var(--color-text-muted) 40%, transparent);
    border-radius: var(--radius-full);
  }
  .card.tier-strong .metric-fill {
    background: var(--words-accent, var(--color-accent));
  }
  .metric-key {
    grid-column: 1 / -1;
    grid-row: 2;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  /* ─── Verdict ─── */
  .verdict {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-sm);
    align-self: flex-start;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.04em;
  }
  .verdict-weak {
    background: color-mix(in oklab, var(--color-error) 12%, transparent);
    color: var(--color-error);
  }
  .verdict-strong {
    background: color-mix(in oklab, var(--color-success) 12%, transparent);
    color: var(--color-success);
  }
  .verdict-icon {
    width: 14px; height: 14px;
    display: grid; place-items: center;
    font-size: var(--text-xs);
    line-height: 1;
  }
</style>

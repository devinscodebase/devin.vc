<script>
  /*
    Hook visual — a 3-second countdown that fires on view.

    Three frames in a row representing 0–1s, 1–2s, 2–3s. A playhead
    sweeps from left to right. At ~3s it lands on a "Stay or scroll?"
    decision marker. Restarts on click.
  */
  let progress = $state(0);  // 0 → 1 over 3s
  let rafId;
  let startedAt = null;

  function tick(t) {
    if (startedAt === null) startedAt = t;
    const elapsed = (t - startedAt) / 1000;
    progress = Math.min(elapsed / 3, 1);
    if (progress < 1) rafId = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(rafId);
    progress = 0;
    startedAt = null;
    rafId = requestAnimationFrame(tick);
  }

  $effect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { progress = 1; return; }
    start();
    return () => cancelAnimationFrame(rafId);
  });
</script>

<div class="hook">
  <div class="track" role="img" aria-label="3-second hook timeline">
    <!-- Frames -->
    <div class="frames">
      <div class="frame">
        <span class="frame-label">0:00 → 0:01</span>
        <div class="frame-art">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
          </svg>
        </div>
        <span class="frame-tag">First glance</span>
      </div>
      <div class="frame">
        <span class="frame-label">0:01 → 0:02</span>
        <div class="frame-art">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/>
            <line x1="12" y1="7" x2="12" y2="12"/>
            <line x1="12" y1="12" x2="15" y2="14"/>
          </svg>
        </div>
        <span class="frame-tag">Brain decides</span>
      </div>
      <div class="frame decision">
        <span class="frame-label">0:02 → 0:03</span>
        <div class="frame-art">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6,4 6,20"/>
            <polyline points="6,4 11,9 6,14"/>
            <polyline points="18,4 18,20"/>
            <polyline points="18,20 13,15 18,10"/>
          </svg>
        </div>
        <span class="frame-tag">Stay or scroll?</span>
      </div>
    </div>

    <!-- Playhead -->
    <div class="playhead-track" aria-hidden="true">
      <span class="playhead" style="left: {progress * 100}%"></span>
    </div>

    <!-- Time scale -->
    <div class="scale" aria-hidden="true">
      <span>0s</span><span>1s</span><span>2s</span><span>3s</span>
    </div>
  </div>

  <button type="button" class="replay" onclick={start} aria-label="Replay the 3-second hook">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
    </svg>
    <span>Replay</span>
  </button>
</div>

<style>
  .hook {
    padding: 1.25rem;
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .track { display: flex; flex-direction: column; gap: 0.55rem; }

  .frames { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.45rem; }
  .frame {
    display: flex; flex-direction: column; gap: 0.4rem;
    padding: 0.7rem;
    background: var(--color-surface);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-md);
    align-items: center;
    text-align: center;
  }
  .frame.decision {
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 10%, transparent);
    border-color: color-mix(in oklab, var(--words-accent, var(--color-accent)) 40%, transparent);
  }
  .frame-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-subtle);
    letter-spacing: 0.04em;
  }
  .frame-art {
    width: 32px; height: 32px;
    color: var(--color-text-muted);
  }
  .frame.decision .frame-art { color: var(--words-accent, var(--color-accent)); }
  .frame-art svg { width: 100%; height: 100%; }
  .frame-tag {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }
  .frame.decision .frame-tag { color: var(--words-accent, var(--color-accent)); font-weight: var(--weight-medium); }

  .playhead-track {
    position: relative;
    height: 3px;
    background: color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-full);
  }
  .playhead {
    position: absolute;
    top: -3px;
    width: 9px;
    height: 9px;
    border-radius: var(--radius-full);
    background: var(--words-accent, var(--color-accent));
    transform: translateX(-50%);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--words-accent, var(--color-accent)) 18%, transparent);
  }

  .scale {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-subtle);
  }

  .replay {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.7rem;
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 18%, transparent);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color var(--duration-fast), color var(--duration-fast);
  }
  .replay svg { width: 12px; height: 12px; }
  .replay:hover { border-color: var(--words-accent, var(--color-accent)); color: var(--words-accent, var(--color-accent)); }

  @media (prefers-reduced-motion: reduce) {
    .playhead { transition: none; }
    .replay { display: none; }
  }
</style>

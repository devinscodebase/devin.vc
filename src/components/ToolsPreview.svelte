<script>
  import { onMount } from 'svelte';
  import { animate, inView } from 'motion';

  const tools = [
    { name: 'GTM Budget Planner', tag: 'Planning', description: 'Reverse-engineer your funnel from revenue target to daily activity.', href: '/tools/gtm-planner', accent: 'teal', number: '01' },
    { name: 'Retention Calculator', tag: 'Retention', description: 'See the real cost of customer churn over 3 years.', href: '/tools/retention-calculator', accent: 'amber', number: '02' },
    { name: 'Marketing Scorecard', tag: 'Diagnostics', description: 'Score your marketing engine across 11 metrics.', href: '/tools/marketing-scorecard', accent: 'rust', number: '03' },
  ];

  let section;
  let inner;

  function entryEnter(e) {
    const entry = e.currentTarget;
    const name = entry.querySelector('.entry-name');
    animate(entry, { y: -3 }, { duration: 0.15, easing: [0.34, 1.56, 0.64, 1] });
    if (name) animate(name, { x: 3 }, { duration: 0.15, easing: [0.34, 1.56, 0.64, 1] });
  }

  function entryLeave(e) {
    const entry = e.currentTarget;
    const name = entry.querySelector('.entry-name');
    animate(entry, { y: 0 }, { duration: 0.25, easing: [0.16, 1, 0.3, 1] });
    if (name) animate(name, { x: 0 }, { duration: 0.25, easing: [0.16, 1, 0.3, 1] });
  }

  onMount(() => {
    const entries = section.querySelectorAll('.tool-entry');
    entries.forEach(entry => {
      entry.addEventListener('mousemove', (e) => {
        const rect = entry.getBoundingClientRect();
        entry.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        entry.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
      });
    });

    if (window.__vtNav) {
      inner.classList.remove('will-animate');
      return;
    }

    const stop = inView(section, () => {
      inner.classList.remove('will-animate');
      inner.classList.add('revealed');
      stop();
    }, { amount: 0.15 });

    return () => stop();
  });
</script>

<section class="tools-preview" bind:this={section}>
  <div class="tools-preview-inner will-animate" bind:this={inner}>
    <div class="section-tag"><span class="tag-number">06</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Tools</span></div>
    <div class="tools-header">
      <h2 class="section-heading">Free Tools</h2>
      <a href="/tools" class="view-all">
        View all
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 7h12M8 2l5 5-5 5" />
        </svg>
      </a>
    </div>

    <div class="tools-showcase">
      {#each tools as tool}
        <a href={tool.href} class="tool-entry accent-{tool.accent}" onmouseenter={entryEnter} onmouseleave={entryLeave}>
          <div class="entry-bar" aria-hidden="true"></div>
          <span class="entry-number" aria-hidden="true">{tool.number}</span>
          <div class="entry-body">
            <span class="entry-tag">{tool.tag}</span>
            <h3 class="entry-name">{tool.name}</h3>
            <p class="entry-desc">{tool.description}</p>
          </div>
          <svg class="entry-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 7h12M8 2l5 5-5 5" />
          </svg>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .tools-preview {
    position: relative;
    padding: var(--space-section) var(--space-page-x);
    background: var(--color-bg);
  }

  .tools-preview-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  /* ---- Entrance animation (CSS-driven) ---- */
  .will-animate .section-tag,
  .will-animate .tools-header,
  .will-animate .tool-entry {
    opacity: 0;
    transform: translateY(12px);
  }

  .revealed .section-tag {
    animation: fadeSlideUp 0.35s cubic-bezier(0.25, 1, 0.5, 1) both;
  }

  .revealed .tools-header {
    animation: fadeSlideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) 50ms both;
  }

  .revealed .tool-entry {
    animation: fadeSlideUp 0.45s cubic-bezier(0.25, 1, 0.5, 1) both;
  }

  .revealed .tool-entry:nth-child(1) { animation-delay: 100ms; }
  .revealed .tool-entry:nth-child(2) { animation-delay: 180ms; }
  .revealed .tool-entry:nth-child(3) { animation-delay: 260ms; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .revealed .section-tag,
    .revealed .tools-header,
    .revealed .tool-entry {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }

  /* ---- Section tag ---- */
  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
  }

  .tag-number {
    font-family: var(--font-display);
    font-size: var(--text-md);
    line-height: 1;
    color: var(--color-accent-teal);
  }

  .tag-dash {
    width: 24px;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent-teal), transparent);
  }

  .tag-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  /* ---- Header ---- */
  .tools-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-block);
  }

  .section-heading {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    margin: 0;
  }

  .view-all {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .view-all:hover { color: var(--color-accent); }

  .view-all svg {
    transition: transform var(--duration-fast) var(--ease-out-expo);
  }

  .view-all:hover svg { transform: translateX(3px); }

  /* ---- Showcase ---- */
  .tools-showcase {
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 1.5vw, 1rem);
  }

  /* ---- Entry ---- */
  .tool-entry {
    --entry-accent: var(--color-accent-teal);
    display: flex;
    align-items: center;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
    padding: clamp(1.25rem, 2.5vw, 1.75rem) clamp(1.25rem, 2.5vw, 2rem);
    text-decoration: none;
    position: relative;
    overflow: hidden;
    background: color-mix(in oklab, var(--color-text-muted) 3%, transparent);
    transition: background var(--duration-normal) var(--ease-out-expo);
  }

  .tool-entry.accent-teal { --entry-accent: var(--color-accent-teal); }
  .tool-entry.accent-amber { --entry-accent: var(--color-accent-amber); }
  .tool-entry.accent-rust { --entry-accent: var(--color-accent-rust); }

  .tool-entry:hover {
    background: color-mix(in oklab, var(--entry-accent) 4%, transparent);
  }

  /* Cursor-following spotlight — uses entry accent */
  .tool-entry::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      400px circle at var(--glow-x, 50%) var(--glow-y, 50%),
      color-mix(in oklab, var(--entry-accent) 6%, transparent),
      transparent 45%
    );
    opacity: 0;
    transition: opacity var(--duration-normal) var(--ease-out-expo);
    pointer-events: none;
  }

  .tool-entry:hover::before { opacity: 1; }

  /* ---- Accent bar — CSS transition, no JS ---- */
  .entry-bar {
    position: absolute;
    left: 0;
    top: 15%;
    bottom: 15%;
    width: 3px;
    border-radius: 0 2px 2px 0;
    background: var(--entry-accent);
    transform-origin: center;
    transition: transform var(--duration-normal) var(--ease-out-expo);
  }

  .tool-entry:hover .entry-bar { transform: scaleY(1.15); }

  /* ---- Ghost number — CSS transition, no JS ---- */
  .entry-number {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    line-height: 1;
    color: var(--entry-accent);
    opacity: 0.05;
    flex-shrink: 0;
    width: clamp(2.5rem, 4vw, 3.5rem);
    text-align: center;
    pointer-events: none;
    position: relative;
    z-index: 1;
    transition: opacity var(--duration-normal) var(--ease-out-expo);
  }

  .tool-entry:hover .entry-number { opacity: 0.12; }

  /* ---- Body ---- */
  .entry-body {
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .entry-tag {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--entry-accent);
    display: block;
    margin-bottom: 0.35rem;
  }

  .entry-name {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: var(--weight-regular);
    line-height: 1.2;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text);
    margin: 0 0 0.3rem;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .tool-entry:hover .entry-name { color: var(--color-accent); }

  .entry-desc {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    line-height: 1.55;
    color: var(--color-text-muted);
    margin: 0;
  }

  /* ---- Arrow ---- */
  .entry-arrow {
    flex-shrink: 0;
    color: var(--color-text-muted);
    opacity: 0.4;
    transition: transform var(--duration-fast) var(--ease-out-expo),
                opacity var(--duration-fast) var(--ease-out-expo),
                color var(--duration-fast) var(--ease-out-expo);
    position: relative;
    z-index: 1;
  }

  .tool-entry:hover .entry-arrow {
    transform: translateX(3px);
    opacity: 1;
    color: var(--color-accent);
  }

  @media (max-width: 640px) {
    .entry-number { display: none; }
    .tool-entry { gap: 1rem; }
  }
</style>

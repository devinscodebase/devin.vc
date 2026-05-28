<script>
  import { onMount } from 'svelte';

  /*
    Entrance fades handled by the global .reveal utility. Component owns
    the cursor-following spotlight effect on each card (pure DOM/CSS
    custom-property bridge — no motion lib needed). Hover lift + name
    shift are now pure CSS transitions.
  */

  let section;

  onMount(() => {
    const cards = section.querySelectorAll('.project');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
      });
    });
  });
</script>

<section class="now" bind:this={section}>
  <div class="now-inner">
    <div class="section-tag reveal" style="--reveal-i: 0"><span class="tag-number">03</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Now</span></div>
    <h2 class="section-heading reveal" style="--reveal-i: 1">What I'm Working On</h2>

    <div class="projects">
      <a href="/contact" class="project reveal" style="--reveal-i: 2">
        <div class="project-top">
          <span class="project-number">01</span>
          <div class="project-header">
            <span class="status-dot" aria-hidden="true"></span>
            <span class="project-status">Available</span>
          </div>
        </div>
        <h3 class="project-name">Open to marketing consulting projects, web design projects, and more</h3>
        <p class="project-desc">GTM strategy, marketing systems, web design, operations, and growth for companies that need senior-level thinking without a full-time hire. Let's talk.</p>
      </a>

      <article class="project reveal" style="--reveal-i: 3">
        <div class="project-top">
          <span class="project-number">02</span>
          <div class="project-header">
            <span class="status-dot building" aria-hidden="true"></span>
            <span class="project-status">Building</span>
          </div>
        </div>
        <h3 class="project-name">Something Secret</h3>
        <p class="project-desc">A work management platform for small teams. Consolidates chats, tasks, CRM, marketing, G-Suite, and more into one place, delivering everything your team needs at a fraction of the cost of running them all separately.</p>
      </article>

      <article class="project reveal" style="--reveal-i: 4">
        <div class="project-top">
          <span class="project-number">03</span>
          <div class="project-header">
            <span class="status-dot exploring" aria-hidden="true"></span>
            <span class="project-status">Exploring</span>
          </div>
        </div>
        <h3 class="project-name">Send</h3>
        <p class="project-desc">A cold email marketing platform built to outperform everything else on the market. Backed by firsthand experience sending over half a billion cold emails.</p>
      </article>
    </div>

  </div>
</section>

<style>
  .now {
    position: relative;
    padding: var(--space-section) var(--space-page-x);
    background: var(--color-bg);
  }

  .now-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
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

  .section-heading {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    margin: 0 0 var(--space-block);
  }

  /* Asymmetric editorial grid */
  .projects {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-template-rows: auto auto;
    gap: var(--space-element);
  }

  /* Featured first card spans both rows */
  .project:first-child {
    grid-row: 1 / 3;
  }

  .project {
    padding: var(--space-card);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    transition:
      border-color var(--duration-fast) var(--ease-out-expo),
      transform var(--duration-fast) var(--ease-spring);
    text-decoration: none;
    color: inherit;
  }

  a.project:hover { transform: translateY(-4px); }
  article.project:hover { transform: translateY(-4px); }

  /* Cursor-following spotlight */
  .project::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      400px circle at var(--glow-x, 50%) var(--glow-y, 50%),
      color-mix(in oklab, var(--color-accent-teal) 8%, transparent),
      transparent 40%
    );
    opacity: 0;
    transition: opacity var(--duration-fast) var(--ease-out-expo);
    pointer-events: none;
  }

  .project:nth-child(2)::before {
    background: radial-gradient(
      400px circle at var(--glow-x, 50%) var(--glow-y, 50%),
      color-mix(in oklab, var(--color-accent-amber) 8%, transparent),
      transparent 40%
    );
  }

  .project:nth-child(3)::before {
    background: radial-gradient(
      400px circle at var(--glow-x, 50%) var(--glow-y, 50%),
      color-mix(in oklab, var(--color-accent-rust) 8%, transparent),
      transparent 40%
    );
  }

  .project:hover::before {
    opacity: 1;
  }

  .project:hover {
    border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
  }

  /* Status + number row */
  .project-top {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: var(--space-element);
    position: relative;
    z-index: 1;
  }

  /* Watermark numbers — oversized ghost typography */
  .project-number {
    font-family: var(--font-display);
    font-size: clamp(5rem, 12vw, 8rem);
    font-weight: var(--weight-regular);
    line-height: 0.8;
    color: var(--color-accent-teal);
    opacity: 0.07;
    position: absolute;
    right: var(--space-card);
    bottom: -0.05em;
    pointer-events: none;
  }

  .project:first-child .project-number {
    font-size: clamp(8rem, 18vw, 14rem);
  }

  .project:nth-child(2) .project-number {
    color: var(--color-accent-amber);
  }

  .project:nth-child(3) .project-number {
    color: var(--color-accent-rust);
  }

  .project-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent-teal);
    flex-shrink: 0;
  }

  .status-dot.building {
    background: var(--color-accent-amber);
  }

  .status-dot.exploring {
    background: var(--color-text-muted);
    opacity: 0.5;
  }

  .project-status {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .project-name {
    font-family: var(--font-display);
    font-size: var(--text-md);
    font-weight: var(--weight-regular);
    line-height: 1.3;
    color: var(--color-text);
    margin: 0 0 0.65rem;
    position: relative;
    z-index: 1;
    transition: transform var(--duration-fast) var(--ease-spring);
  }

  .project:hover .project-name { transform: translateX(4px); }

  .project:first-child .project-name {
    font-size: var(--text-xl);
  }

  .project-desc {
    font-family: var(--font-body);
    font-size: var(--text-base);
    line-height: 1.65;
    color: var(--color-text-muted);
    margin-top: auto;
    position: relative;
    z-index: 1;
  }

  .project:first-child .project-desc {
    max-width: 480px;
  }


  @media (max-width: 768px) {
    .projects {
      grid-template-columns: 1fr;
    }

    .project:first-child {
      grid-row: auto;
    }

    .project:first-child .project-number {
      font-size: clamp(5rem, 12vw, 8rem);
    }

    .project:first-child .project-name {
      font-size: var(--text-md);
    }
  }
</style>

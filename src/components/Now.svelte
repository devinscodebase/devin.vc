<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let section;

  onMount(() => {
    const tag = section.querySelector('.section-tag');
    const heading = section.querySelector('.section-heading');
    const cards = section.querySelectorAll('.project');

    inView(section, () => {
      // Section tag
      animate(tag, { opacity: [0, 1], y: [10, 0] }, {
        duration: 0.5,
        easing: [0.25, 1, 0.5, 1],
      });

      // Heading
      animate(heading, { opacity: [0, 1], y: [30, 0] }, {
        duration: 0.8,
        delay: 0.1,
        easing: [0.25, 1, 0.5, 1],
      });

      // Cards stagger in
      animate(cards, { opacity: [0, 1], y: [45, 0] }, {
        duration: 0.8,
        delay: stagger(0.15, { start: 0.25 }),
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.2 });

    // Cursor-following spotlight on cards
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
    <div class="section-tag" style="opacity: 0;"><span class="tag-number">03</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Now</span></div>
    <h2 class="section-heading" style="opacity: 0;">What I'm Working On</h2>

    <div class="projects">
      <article class="project" style="opacity: 0;">
        <div class="project-top">
          <span class="project-number">01</span>
          <div class="project-header">
            <span class="status-dot" aria-hidden="true"></span>
            <span class="project-status">Active</span>
          </div>
        </div>
        <h3 class="project-name">COO, Andreou Enterprises</h3>
        <p class="project-desc">Running marketing and operations across the Andreou brand portfolio and Bitmern Mining. Leading a team of 9 as second-in-command in the Web3 and crypto space.</p>
      </article>

      <article class="project" style="opacity: 0;">
        <div class="project-top">
          <span class="project-number">02</span>
          <div class="project-header">
            <span class="status-dot building" aria-hidden="true"></span>
            <span class="project-status">Building</span>
          </div>
        </div>
        <h3 class="project-name">Something Secret</h3>
        <p class="project-desc">A work management platform for small teams. Consolidates chats, tasks, CRM, marketing, G-Suite, and more into one place — delivering everything your team needs at a fraction of the cost of running them all separately.</p>
      </article>

      <article class="project" style="opacity: 0;">
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

  .section-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 400;
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: -0.02em;
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
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
    transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

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
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
    box-shadow: var(--shadow-md);
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
    font-family: 'Instrument Serif', serif;
    font-size: clamp(5rem, 12vw, 8rem);
    font-weight: 400;
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
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .project-name {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.3rem, 2.2vw, 1.5rem);
    font-weight: 400;
    line-height: 1.3;
    color: var(--color-text);
    margin: 0 0 0.65rem;
    position: relative;
    z-index: 1;
  }

  .project:first-child .project-name {
    font-size: clamp(1.6rem, 2.8vw, 2rem);
  }

  .project-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.92rem, 1.2vw, 1rem);
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
      font-size: clamp(1.3rem, 2.2vw, 1.5rem);
    }
  }
</style>

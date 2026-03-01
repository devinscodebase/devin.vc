<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let section;

  onMount(() => {
    const heading = section.querySelector('.section-heading');
    const cards = section.querySelectorAll('.project');
    const footer = section.querySelector('.now-footer');

    inView(section, () => {
      // Heading
      animate(heading, { opacity: [0, 1], y: [30, 0] }, {
        duration: 0.8,
        easing: [0.25, 1, 0.5, 1],
      });

      // Cards stagger in
      animate(cards, { opacity: [0, 1], y: [45, 0] }, {
        duration: 0.8,
        delay: stagger(0.15, { start: 0.2 }),
        easing: [0.25, 1, 0.5, 1],
      });

      // Footer
      animate(footer, { opacity: [0, 1], y: [15, 0] }, {
        duration: 0.6,
        delay: 0.8,
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.2 });
  });
</script>

<section class="now" bind:this={section}>
  <div class="now-inner">
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

    <div class="now-footer" style="opacity: 0;">
      <span class="label">03 / Now</span>
      <div class="rule" aria-hidden="true"></div>
    </div>
  </div>
</section>

<style>
  .now {
    position: relative;
    padding: clamp(8rem, 20vh, 14rem) clamp(1.5rem, 5vw, 3.5rem);
    background: var(--color-bg);
  }

  .now-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  .section-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 400;
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: -0.02em;
    margin: 0 0 clamp(3rem, 6vw, 5rem);
  }

  .projects {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(1.5rem, 3vw, 2.5rem);
  }

  .project {
    padding: clamp(1.5rem, 3vw, 2rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-sm);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project:hover {
    transform: translateY(-4px);
    border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
    box-shadow: var(--shadow-lg);
  }

  .project-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
  }

  .project-number {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 400;
    line-height: 1;
    color: var(--color-text);
    opacity: 0.12;
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
    background: var(--color-accent);
    flex-shrink: 0;
  }

  .status-dot.building {
    background: var(--color-text-muted);
  }

  .status-dot.exploring {
    background: var(--color-text-muted);
    opacity: 0.5;
  }

  .project-status {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .project-name {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.15rem, 2vw, 1.35rem);
    font-weight: 400;
    line-height: 1.3;
    color: var(--color-text);
    margin: 0 0 0.65rem;
  }

  .project-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.8rem, 1.1vw, 0.88rem);
    line-height: 1.65;
    color: var(--color-text-muted);
    margin-top: auto;
  }

  .now-footer {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: clamp(4rem, 8vw, 6rem);
  }

  .label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .rule {
    flex: 1;
    height: 1px;
    background: var(--color-text-muted);
    opacity: 0.2;
  }

  @media (max-width: 768px) {
    .projects {
      grid-template-columns: 1fr;
    }
  }
</style>

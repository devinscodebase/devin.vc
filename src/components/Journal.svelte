<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let section;

  onMount(() => {
    const header = section.querySelector('.journal-header');
    const featured = section.querySelector('.post.featured');
    const accentBar = section.querySelector('.post-accent');
    const stackPosts = section.querySelectorAll('.post-stack .post');
    const footer = section.querySelector('.journal-footer');

    inView(section, () => {
      // Header slides in
      animate(header, { opacity: [0, 1], y: [25, 0] }, {
        duration: 0.8,
        easing: [0.25, 1, 0.5, 1],
      });

      // Featured post
      animate(featured, { opacity: [0, 1], y: [40, 0] }, {
        duration: 0.8,
        delay: 0.2,
        easing: [0.25, 1, 0.5, 1],
      });

      // Accent bar sweeps in
      animate(accentBar, { scaleX: [0, 1] }, {
        duration: 0.6,
        delay: 0.7,
        easing: [0.25, 1, 0.5, 1],
      });

      // Stack posts stagger
      animate(stackPosts, { opacity: [0, 1], y: [35, 0] }, {
        duration: 0.7,
        delay: stagger(0.15, { start: 0.35 }),
        easing: [0.25, 1, 0.5, 1],
      });

      // Footer
      animate(footer, { opacity: [0, 1], y: [15, 0] }, {
        duration: 0.6,
        delay: 0.8,
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.15 });
  });
</script>

<section class="journal" bind:this={section}>
  <div class="journal-inner">
    <div class="journal-header" style="opacity: 0;">
      <h2 class="section-heading">Latest Thinking</h2>
      <a href="/journal" class="view-all">
        View all
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 7h12M8 2l5 5-5 5" />
        </svg>
      </a>
    </div>

    <div class="posts">
      <a href="/journal/on-craft" class="post featured" style="opacity: 0;">
        <div class="post-accent" aria-hidden="true" style="transform: scaleX(0); transform-origin: left;"></div>
        <span class="post-tag">Essay</span>
        <h3 class="post-title">On Craft</h3>
        <p class="post-excerpt">Why the best marketing doesn't feel like marketing, and what that means for how we build brands today.</p>
        <span class="post-date">Feb 2026</span>
      </a>

      <div class="post-stack">
        <a href="/journal/building-in-public" class="post" style="opacity: 0;">
          <span class="post-tag">Process</span>
          <h3 class="post-title">Building in Public</h3>
          <p class="post-excerpt">Notes on designing a solo practice from scratch — the decisions, the trade-offs, and what I'd do differently.</p>
          <span class="post-date">Jan 2026</span>
        </a>

        <a href="/journal/the-operator-mindset" class="post" style="opacity: 0;">
          <span class="post-tag">Leadership</span>
          <h3 class="post-title">The Operator Mindset</h3>
          <p class="post-excerpt">Most companies hire for vision and hope execution follows. The best ones do it the other way around.</p>
          <span class="post-date">Dec 2025</span>
        </a>
      </div>
    </div>

    <div class="journal-footer" style="opacity: 0;">
      <span class="label">04 / Journal</span>
      <div class="rule" aria-hidden="true"></div>
    </div>
  </div>
</section>

<style>
  .journal {
    position: relative;
    padding: clamp(8rem, 20vh, 14rem) clamp(1.5rem, 5vw, 3.5rem);
    background: var(--color-bg);
  }

  .journal-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  .journal-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: clamp(3rem, 6vw, 5rem);
  }

  .section-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 400;
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: -0.02em;
    margin: 0;
  }

  .view-all {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .view-all:hover {
    color: var(--color-accent);
  }

  .view-all svg {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .view-all:hover svg {
    transform: translateX(3px);
  }

  .posts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(1.5rem, 3vw, 2.5rem);
  }

  .post-stack {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2.5rem);
  }

  .post {
    display: flex;
    flex-direction: column;
    padding: clamp(1.5rem, 3vw, 2rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    text-decoration: none;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .post:hover {
    transform: translateY(-3px);
    border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
  }

  .post.featured {
    justify-content: flex-end;
    position: relative;
    overflow: hidden;
  }

  .post-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-accent);
  }

  .post-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.58rem;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-bottom: auto;
  }

  .post-title {
    font-family: 'Instrument Serif', serif;
    font-weight: 400;
    line-height: 1.2;
    color: var(--color-text);
    margin: 0 0 0.5rem;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .post:hover .post-title {
    color: var(--color-accent);
  }

  .post.featured .post-title {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    letter-spacing: -0.015em;
  }

  .post-stack .post-title {
    font-size: clamp(1.1rem, 1.8vw, 1.3rem);
  }

  .post-excerpt {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.82rem, 1.1vw, 0.9rem);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin-bottom: 0;
  }

  .post.featured .post-excerpt {
    max-width: 380px;
  }

  .post-date {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-top: clamp(1rem, 2vw, 1.5rem);
  }

  .journal-footer {
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

  @media (max-width: 640px) {
    .posts {
      grid-template-columns: 1fr;
    }
  }
</style>

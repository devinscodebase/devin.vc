<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let { testimonials = [] } = $props();

  const accents = ['teal', 'amber', 'teal', 'amber'];

  let section;

  onMount(() => {
    if (window.__vtNav) {
      section.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
      return;
    }

    const tag = section.querySelector('.section-tag');
    const cards = section.querySelectorAll('.card');

    const stop = inView(section, () => {
      animate(tag, { opacity: [0, 1], y: [8, 0] }, {
        duration: 0.35,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(cards, { opacity: [0, 1], y: [15, 0] }, {
        duration: 0.4,
        delay: stagger(0.1, { start: 0.08 }),
        easing: [0.25, 1, 0.5, 1],
      });

      stop();
    }, { amount: 0.15 });

    return () => stop();
  });
</script>

<section class="proof" bind:this={section}>
  <div class="proof-inner">
    <div class="section-tag" style="opacity: 0;"><span class="tag-number">06</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Kind Words</span></div>

    <div class="grid">
      {#each testimonials.slice(0, 4) as t, i}
        <blockquote class="card testimonial" class:accent-amber={accents[i] === 'amber'} style="opacity: 0;">
          <div class="accent-bar" class:amber={accents[i] === 'amber'} aria-hidden="true"></div>
          <span class="quote-mark" class:amber={accents[i] === 'amber'} aria-hidden="true">&ldquo;</span>
          <p class="quote-text">{t.quote}</p>
          <footer class="attribution">
            <span class="attr-name">{t.name}</span>
            {#if t.role || t.company}
              <span class="attr-rule" class:amber={accents[i] === 'amber'} aria-hidden="true"></span>
              <span class="attr-detail">{t.role}{#if t.role && t.company}, {/if}{t.company}</span>
            {/if}
          </footer>
        </blockquote>
      {/each}

      <div class="card cta-card" style="opacity: 0;">
        <div class="accent-bar gold" aria-hidden="true"></div>
        <div class="cta-content">
          <p class="cta-text">You could be here.</p>
          <a href="/contact" class="cta-link">
            Let's work together
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 7H13M8 2L13 7l-5 5" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .proof {
    position: relative;
    padding: var(--space-section) var(--space-page-x);
    background: var(--color-bg);
  }

  .proof-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  /* ---- Section tag ---- */
  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: clamp(3rem, 6vw, 4.5rem);
  }

  .tag-number {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1rem, 1.4vw, 1.15rem);
    line-height: 1;
    color: var(--color-accent-amber);
  }

  .tag-dash {
    width: 24px;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent-amber), transparent);
  }

  .tag-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  /* ---- Grid: 2×2 testimonials + full-span CTA ---- */
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  /* ---- Shared card base ---- */
  .card {
    position: relative;
    padding: clamp(1.5rem, 3vw, 2.25rem);
    padding-top: clamp(1.75rem, 3.5vw, 2.5rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  /* ---- Accent bar ---- */
  .accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-accent-teal), color-mix(in oklab, var(--color-accent-teal) 20%, transparent));
  }

  .accent-bar.amber {
    background: linear-gradient(90deg, var(--color-accent-amber), color-mix(in oklab, var(--color-accent-amber) 20%, transparent));
  }

  .accent-bar.gold {
    background: linear-gradient(90deg, var(--color-accent), color-mix(in oklab, var(--color-accent) 20%, transparent));
  }

  /* ---- Testimonial card ---- */
  .testimonial {
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .quote-mark {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.5rem, 4vw, 3.5rem);
    line-height: 0.7;
    color: var(--color-accent-teal);
    opacity: 0.15;
    display: block;
    margin-bottom: 0.5rem;
    user-select: none;
  }

  .quote-mark.amber {
    color: var(--color-accent-amber);
  }

  .quote-text {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(0.92rem, 1.2vw, 1.05rem);
    line-height: 1.6;
    color: var(--color-text);
    margin: 0 0 auto;
    padding-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  .attribution {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .attr-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text);
  }

  .attr-rule {
    width: 20px;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent-teal), transparent);
    flex-shrink: 0;
  }

  .attr-rule.amber {
    background: linear-gradient(90deg, var(--color-accent-amber), transparent);
  }

  .attr-detail {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  /* ---- CTA card ---- */
  .cta-card {
    grid-column: 1 / -1;
    border-style: dashed;
    border-color: color-mix(in oklab, var(--color-accent) 25%, transparent);
  }

  .cta-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .cta-text {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1.5rem, 2.5vw, 2rem);
    line-height: 1.3;
    color: var(--color-text);
    margin: 0;
  }

  .cta-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-accent);
    text-decoration: none;
    white-space: nowrap;
    flex-shrink: 0;
    transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cta-link:hover {
    color: var(--color-text);
  }

  .cta-link svg {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cta-link:hover svg {
    transform: translateX(3px);
  }

  /* ---- Mobile ---- */
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .cta-content {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let { testimonials = [] } = $props();

  let section;

  onMount(() => {
    const tag = section.querySelector('.section-tag');
    const quotes = section.querySelectorAll('.testimonial');

    inView(section, () => {
      animate(tag, { opacity: [0, 1], y: [8, 0] }, {
        duration: 0.35,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(quotes, { opacity: [0, 1], y: [15, 0] }, {
        duration: 0.4,
        delay: stagger(0.12, { start: 0.08 }),
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.15 });
  });
</script>

<section class="proof" bind:this={section}>
  <div class="proof-inner">
    <div class="section-tag" style="opacity: 0;"><span class="tag-number">04</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Proof</span></div>
    {#if testimonials.length > 0}
      <div class="testimonials">
        {#each testimonials as t, i}
          <blockquote class="testimonial" class:right={i % 2 === 1} style="opacity: 0;">
            <div class="quote-accent" aria-hidden="true"></div>
            <span class="quote-mark" aria-hidden="true">&ldquo;</span>
            <p class="quote-text">{t.quote}</p>
            <footer class="attribution">
              <span class="attr-name">{t.name}</span>
              {#if t.role || t.company}
                <span class="attr-rule" aria-hidden="true"></span>
                <span class="attr-detail">{t.role}{#if t.role && t.company}, {/if}{t.company}</span>
              {/if}
            </footer>
          </blockquote>
        {/each}
      </div>
    {/if}
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

  /* ---- Alternating offset layout ---- */
  .testimonials {
    display: flex;
    flex-direction: column;
    gap: clamp(3rem, 6vw, 5rem);
  }

  .testimonial {
    position: relative;
    margin: 0;
    max-width: 55%;
    padding: clamp(1.5rem, 3vw, 2.25rem);
    padding-top: clamp(1.75rem, 3.5vw, 2.5rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    align-self: flex-start;
  }

  .testimonial.right {
    align-self: flex-end;
  }

  /* ---- Accent bar ---- */
  .quote-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-accent-teal), color-mix(in oklab, var(--color-accent-teal) 20%, transparent));
  }

  .testimonial.right .quote-accent {
    background: linear-gradient(270deg, var(--color-accent-amber), color-mix(in oklab, var(--color-accent-amber) 20%, transparent));
  }

  /* ---- Quote mark ---- */
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

  .testimonial.right .quote-mark {
    color: var(--color-accent-amber);
    text-align: right;
  }

  /* ---- Quote text ---- */
  .quote-text {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1.1rem, 1.6vw, 1.25rem);
    line-height: 1.6;
    color: var(--color-text);
    margin: 0 0 clamp(1.25rem, 2.5vw, 1.75rem);
  }

  /* ---- Attribution ---- */
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

  .testimonial.right .attr-rule {
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

  @media (max-width: 768px) {
    .testimonial,
    .testimonial.right {
      max-width: 100%;
      align-self: stretch;
    }
  }
</style>

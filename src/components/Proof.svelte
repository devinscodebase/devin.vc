<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let { testimonials = [] } = $props();

  let section;

  onMount(() => {
    const tag = section.querySelector('.section-tag');
    const cards = section.querySelectorAll('.testimonial');

    inView(section, () => {
      animate(tag, { opacity: [0, 1], y: [10, 0] }, {
        duration: 0.5,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(cards, { opacity: [0, 1], y: [35, 0] }, {
        duration: 0.7,
        delay: stagger(0.15, { start: 0.15 }),
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.2 });
  });
</script>

<section class="proof" bind:this={section}>
  <div class="proof-inner">
    <div class="section-tag" style="opacity: 0;"><span class="tag-number">04</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Proof</span></div>
    {#if testimonials.length > 0}
      <div class="testimonials">
        {#each testimonials as t}
          <blockquote class="testimonial" style="opacity: 0;">
            <span class="quote-mark" aria-hidden="true">&ldquo;</span>
            <p class="quote-text">{t.quote}</p>
            <cite class="attribution">
              {t.name}{#if t.role || t.company}&ensp;&mdash;&ensp;{t.role}{#if t.role && t.company},&nbsp;{/if}{t.company}{/if}
            </cite>
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
    margin-bottom: clamp(1.5rem, 3vw, 2rem);
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

  .testimonials {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-element);
    align-items: start;
  }

  .testimonial:nth-child(2) {
    margin-top: clamp(1.5rem, 3vw, 2.5rem);
  }

  .testimonial:nth-child(3) {
    margin-top: clamp(3rem, 6vw, 5rem);
  }

  .testimonial {
    padding: var(--space-card);
    border-top: 2px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    margin: 0;
    display: flex;
    flex-direction: column;
    transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .testimonial:nth-child(1) { border-color: color-mix(in oklab, var(--color-accent-teal) 25%, transparent); }
  .testimonial:nth-child(2) { border-color: color-mix(in oklab, var(--color-accent-amber) 25%, transparent); }
  .testimonial:nth-child(3) { border-color: color-mix(in oklab, var(--color-accent-rust) 25%, transparent); }

  .testimonial:hover {
    box-shadow: var(--shadow-sm);
  }

  .testimonial:nth-child(1):hover { border-color: var(--color-accent-teal); }
  .testimonial:nth-child(2):hover { border-color: var(--color-accent-amber); }
  .testimonial:nth-child(3):hover { border-color: var(--color-accent-rust); }

  .quote-mark {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.5rem, 4vw, 3.2rem);
    line-height: 1;
    color: var(--color-accent-teal);
    opacity: 0.25;
    margin-bottom: 0.5rem;
    user-select: none;
  }

  .quote-text {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1.08rem, 1.5vw, 1.2rem);
    line-height: 1.55;
    color: var(--color-text);
    margin: 0 0 auto;
    padding-bottom: clamp(1.25rem, 2vw, 1.75rem);
  }

  .attribution {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 400;
    font-style: normal;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }


  @media (max-width: 768px) {
    .testimonials {
      grid-template-columns: 1fr;
    }
  }
</style>

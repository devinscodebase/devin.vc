<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let { testimonials = [] } = $props();

  let section;

  onMount(() => {
    const cards = section.querySelectorAll('.testimonial');
    const footer = section.querySelector('.proof-footer');

    inView(section, () => {
      animate(cards, { opacity: [0, 1], y: [35, 0] }, {
        duration: 0.7,
        delay: stagger(0.15, { start: 0.15 }),
        easing: [0.25, 1, 0.5, 1],
      });

      animate(footer, { opacity: [0, 1], y: [15, 0] }, {
        duration: 0.6,
        delay: 0.7,
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.2 });
  });
</script>

<section class="proof" bind:this={section}>
  <div class="proof-inner">
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

    <div class="proof-footer" style="opacity: 0;">
      <span class="label">04 / Proof</span>
      <div class="rule" aria-hidden="true"></div>
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

  .testimonials {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-element);
  }

  .testimonial {
    padding: var(--space-card);
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    margin: 0;
    display: flex;
    flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .testimonial:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .quote-mark {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.5rem, 4vw, 3.2rem);
    line-height: 1;
    color: var(--color-accent);
    opacity: 0.2;
    margin-bottom: 0.5rem;
    user-select: none;
  }

  .quote-text {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1rem, 1.4vw, 1.15rem);
    line-height: 1.55;
    color: var(--color-text);
    margin: 0 0 auto;
    padding-bottom: clamp(1.25rem, 2vw, 1.75rem);
  }

  .attribution {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    font-style: normal;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .proof-footer {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: var(--space-block-lg);
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
    .testimonials {
      grid-template-columns: 1fr;
    }
  }
</style>

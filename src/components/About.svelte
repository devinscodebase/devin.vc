<script>
  import { onMount } from 'svelte';
  import { animate, inView } from 'motion';

  let section;

  onMount(() => {
    const quote = section.querySelector('.about-quote');
    const border = section.querySelector('.about-border');
    const footer = section.querySelector('.about-footer');

    inView(section, () => {
      animate(quote, { opacity: [0, 1], y: [50, 0] }, {
        duration: 1,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(border, { scaleY: [0, 1] }, {
        duration: 0.8,
        delay: 0.3,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(footer, { opacity: [0, 1], y: [20, 0] }, {
        duration: 0.7,
        delay: 0.6,
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.25 });
  });
</script>

<section class="about" bind:this={section}>
  <div class="about-inner">
    <div class="about-quote-wrap">
      <div class="about-border" aria-hidden="true"></div>
      <div class="about-quote" style="opacity: 0;">
        <p class="about-copy">
          <span class="accent">A decade of building what matters.</span> Marketing that moves people. Operations that scale. Design that earns trust. GTM strategies that actually go to market. I work across disciplines because <span class="accent">the best results live at the intersections.</span>
        </p>
      </div>
    </div>

    <div class="about-footer" style="opacity: 0;">
      <span class="label">01 / About</span>
      <div class="rule" aria-hidden="true"></div>
    </div>
  </div>
</section>

<style>
  .about {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    align-items: center;
    background: var(--color-bg);
    padding: clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 3.5rem);
  }

  .about-inner {
    max-width: 960px;
    margin: 0 auto;
    width: 100%;
  }

  .about-quote-wrap {
    position: relative;
    padding-left: clamp(1.5rem, 4vw, 3rem);
  }

  .about-border {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--color-accent);
    transform-origin: top;
  }

  .about-copy {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.8rem, 3.8vw, 3rem);
    line-height: 1.45;
    color: var(--color-text-muted);
    letter-spacing: -0.015em;
  }

  .accent {
    color: var(--color-text);
  }

  .about-footer {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: clamp(3rem, 6vw, 5rem);
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
</style>

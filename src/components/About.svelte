<script>
  import { onMount } from 'svelte';
  import { animate, inView } from 'motion';

  let section;

  onMount(() => {
    if (window.__vtNav) {
      section.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
      return;
    }

    const footer = section.querySelector('.about-footer');
    const quote = section.querySelector('.about-quote');
    const border = section.querySelector('.about-border');

    const stop = inView(section, () => {
      animate(footer, { opacity: [0, 1], y: [10, 0] }, {
        duration: 0.5,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(quote, { opacity: [0, 1], y: [50, 0] }, {
        duration: 1,
        delay: 0.1,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(border, { scaleY: [0, 1] }, {
        duration: 0.8,
        delay: 0.3,
        easing: [0.25, 1, 0.5, 1],
      });

      stop();
    }, { amount: 0.25 });

    return () => stop();
  });
</script>

<section class="about" bind:this={section}>
  <div class="about-inner">
    <div class="about-quote-wrap">
      <div class="about-border" aria-hidden="true"></div>
      <div class="about-quote" style="opacity: 0;">
        <p class="about-copy">
          <span class="accent">A decade of building what matters.</span> <span class="discipline teal">Marketing</span> that moves people. <span class="discipline amber">Operations</span> that scale. <span class="discipline rust">Design</span> that earns trust. <span class="discipline gold">GTM</span> strategies that actually go to market. I work across disciplines because <span class="accent">the best results live at the intersections.</span>
        </p>
      </div>
    </div>

    <div class="about-footer" style="opacity: 0;">
      <div class="section-tag">
        <span class="tag-number">01</span>
        <span class="tag-dash" aria-hidden="true"></span>
        <span class="tag-label">About</span>
      </div>
      <a href="/about" class="about-link">
        Read my story
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 7H13M8 2L13 7l-5 5" />
        </svg>
      </a>
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
    background: linear-gradient(180deg, var(--color-accent-teal), var(--color-accent), var(--color-accent-amber), var(--color-accent-rust));
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

  .discipline {
    transition: opacity 0.3s;
  }

  .discipline.teal { color: var(--color-accent-teal); }
  .discipline.amber { color: var(--color-accent-amber); }
  .discipline.rust { color: var(--color-accent-rust); }
  .discipline.gold { color: var(--color-accent); }

  .about-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: clamp(3rem, 6vw, 5rem);
    flex-wrap: wrap;
    gap: 1rem;
  }

  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
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

  .about-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .about-link:hover {
    color: var(--color-accent);
  }

  .about-link svg {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .about-link:hover svg {
    transform: translateX(3px);
  }

  @media (max-width: 640px) {
    .about {
      min-height: auto;
    }

    .about-copy {
      font-size: clamp(1.4rem, 5vw, 1.8rem);
    }
  }
</style>

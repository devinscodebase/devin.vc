<script>
  /* Entrance fades handled by the global .reveal utility. */
</script>

<section class="about">
  <div class="about-inner">
    <div class="about-quote-wrap">
      <div class="about-border" aria-hidden="true"></div>
      <div class="about-quote reveal">
        <p class="about-copy">
          <span class="accent">A decade of building what matters.</span> <span class="discipline teal">Marketing</span> that moves people. <span class="discipline amber">Operations</span> that scale. <span class="discipline rust">Design</span> that earns trust. <span class="discipline gold">GTM</span> strategies that actually go to market. I work across disciplines because <span class="accent">the best results live at the intersections.</span>
        </p>
      </div>
    </div>

    <div class="about-footer reveal" style="--reveal-i: 1">
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
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    line-height: 1.45;
    color: var(--color-text-muted);
    letter-spacing: var(--tracking-tight);
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

  .about-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .about-link:hover {
    color: var(--color-accent);
  }

  .about-link svg {
    transition: transform var(--duration-fast) var(--ease-out-expo);
  }

  .about-link:hover svg {
    transform: translateX(3px);
  }

  @media (max-width: 640px) {
    .about {
      min-height: auto;
    }

    .about-copy {
      font-size: var(--text-xl);
    }
  }
</style>

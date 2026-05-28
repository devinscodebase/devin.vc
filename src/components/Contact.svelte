<script>
  /*
    Entrance fades handled by the global .reveal utility.
    Email CTA hover scale is now a pure CSS transition.
  */
</script>

<section class="contact">
  <div class="contact-inner">
    <div class="section-tag reveal" style="--reveal-i: 0"><span class="tag-number">09</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Contact</span></div>
    <h2 class="cta-heading reveal" style="--reveal-i: 1">Let's build<br />something together.</h2>

    <a href="/contact" class="email reveal" style="--reveal-i: 2">Get in touch</a>

    <p class="cta-body reveal" style="--reveal-i: 4">I'm always open to conversations about GTM strategy, design, operations, or interesting problems worth solving.</p>

    <div class="links reveal" style="--reveal-i: 5">
      <a href="https://www.linkedin.com/in/devalexander/" target="_blank" rel="noopener" class="social-link">LinkedIn</a>
      <span class="link-dot" aria-hidden="true">&middot;</span>
      <a href="https://x.com/devinhelps" target="_blank" rel="noopener" class="social-link">X / Twitter</a>
    </div>

  </div>
</section>

<style>
  .contact {
    position: relative;
    padding: var(--space-section) var(--space-page-x);
    background: var(--color-bg);
    text-align: center;
  }

  .contact-inner {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .cta-heading {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    font-weight: var(--weight-regular);
    line-height: 1.05;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text);
    margin: 0 0 var(--space-element);
  }

  .email {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent);
    text-decoration: none;
    padding: 0.85rem 2.25rem;
    border: 1px solid color-mix(in oklab, var(--color-accent) 40%, transparent);
    position: relative;
    overflow: hidden;
    z-index: 0;
    transition: color var(--duration-fast) var(--ease-out-expo),
                border-color var(--duration-fast) var(--ease-out-expo),
                transform var(--duration-fast) var(--ease-spring);
  }

  .email:hover { transform: scale(1.04); }
  .email:active { transform: scale(0.98); }

  .email::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color-accent-teal);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--duration-normal) var(--ease-out-expo);
    z-index: -1;
  }

  .email:hover {
    color: var(--color-bg);
    border-color: var(--color-accent-teal);
  }

  .email:hover::after {
    transform: scaleX(1);
  }

  .cta-body {
    font-family: var(--font-body);
    font-size: var(--text-base);
    line-height: 1.65;
    color: var(--color-text-muted);
    max-width: 420px;
    margin-top: clamp(2rem, 4vw, 3rem);
  }

  .links {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: var(--space-card);
  }

  .social-link {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-wide);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .social-link:hover {
    color: var(--color-accent);
  }

  .link-dot {
    color: color-mix(in oklab, var(--color-text-muted) 40%, transparent);
  }

  @media (max-width: 640px) {
    .links {
      gap: 0.5rem;
    }
  }

  .section-tag {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  .tag-number {
    font-family: var(--font-display);
    font-size: var(--text-md);
    line-height: 1;
    color: var(--color-accent-rust);
  }

  .tag-dash {
    width: 24px;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent-rust), transparent);
  }

  .tag-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }
</style>

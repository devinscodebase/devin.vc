<script>
  import { onMount } from 'svelte';
  import { animate, inView } from 'motion';

  let section;

  onMount(() => {
    const heading = section.querySelector('.cta-heading');
    const email = section.querySelector('.email');
    const body = section.querySelector('.cta-body');
    const links = section.querySelector('.links');
    const footer = section.querySelector('.contact-footer');

    inView(section, () => {
      // Heading scales up and fades in
      animate(heading, {
        opacity: [0, 1],
        y: [25, 0],
        scale: [0.96, 1],
      }, {
        duration: 1,
        easing: [0.25, 1, 0.5, 1],
      });

      // Email button
      animate(email, { opacity: [0, 1], y: [20, 0] }, {
        duration: 0.7,
        delay: 0.3,
        easing: [0.25, 1, 0.5, 1],
      });

      // Body text
      animate(body, { opacity: [0, 1], y: [15, 0] }, {
        duration: 0.7,
        delay: 0.5,
        easing: [0.25, 1, 0.5, 1],
      });

      // Social links
      animate(links, { opacity: [0, 1] }, {
        duration: 0.6,
        delay: 0.65,
        easing: [0.25, 1, 0.5, 1],
      });

      // Footer
      animate(footer, { opacity: [0, 1], y: [10, 0] }, {
        duration: 0.6,
        delay: 0.8,
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.25 });
  });
</script>

<section class="contact" bind:this={section}>
  <div class="contact-inner">
    <h2 class="cta-heading" style="opacity: 0;">Let's build<br />something together.</h2>

    <a href="mailto:hello@devin.vc" class="email" style="opacity: 0;">Get in touch</a>

    <p class="cta-body" style="opacity: 0;">I'm always open to conversations about GTM strategy, design, operations, or interesting problems worth solving.</p>

    <div class="links" style="opacity: 0;">
      <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-link">LinkedIn</a>
      <span class="link-dot" aria-hidden="true">&middot;</span>
      <a href="https://twitter.com" target="_blank" rel="noopener" class="social-link">X / Twitter</a>
    </div>

    <div class="contact-footer" style="opacity: 0;">
      <div class="rule" aria-hidden="true"></div>
      <span class="label">06 / Contact</span>
      <div class="rule" aria-hidden="true"></div>
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
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.8rem, 7vw, 5rem);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--color-text);
    margin: 0 0 var(--space-element);
  }

  .email {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.85rem, 1.5vw, 1.1rem);
    font-weight: 400;
    letter-spacing: 0.12em;
    color: var(--color-accent-amber);
    text-decoration: none;
    padding: 0.8rem 2rem;
    border: 1px solid color-mix(in oklab, var(--color-accent-amber) 40%, transparent);
    transition: background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .email:hover {
    background: var(--color-accent-amber);
    color: var(--color-bg);
  }

  .cta-body {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.92rem, 1.3vw, 1.02rem);
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
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .social-link:hover {
    color: var(--color-accent);
  }

  .link-dot {
    color: color-mix(in oklab, var(--color-text-muted) 40%, transparent);
  }

  .contact-footer {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: var(--space-block-lg);
    width: 100%;
  }

  .label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
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

<script>
  import { onMount } from 'svelte';
  import { animate, inView } from 'motion';

  let section;

  onMount(() => {
    if (window.__vtNav) {
      section.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
      return;
    }

    const tag = section.querySelector('.section-tag');
    const heading = section.querySelector('.cta-heading');
    const email = section.querySelector('.email');
    const body = section.querySelector('.cta-body');
    const links = section.querySelector('.links');

    const stop = inView(section, () => {
      // Section tag
      animate(tag, { opacity: [0, 1], y: [8, 0] }, {
        duration: 0.35,
        easing: [0.25, 1, 0.5, 1],
      });

      // Heading scales up and fades in
      animate(heading, {
        opacity: [0, 1],
        y: [12, 0],
        scale: [0.97, 1],
      }, {
        duration: 0.45,
        easing: [0.25, 1, 0.5, 1],
      });

      // Email button
      animate(email, { opacity: [0, 1], y: [12, 0] }, {
        duration: 0.4,
        delay: 0.15,
        easing: [0.25, 1, 0.5, 1],
      });

      // Body text
      animate(body, { opacity: [0, 1], y: [10, 0] }, {
        duration: 0.4,
        delay: 0.25,
        easing: [0.25, 1, 0.5, 1],
      });

      // Social links
      animate(links, { opacity: [0, 1] }, {
        duration: 0.35,
        delay: 0.32,
        easing: [0.25, 1, 0.5, 1],
      });

      // Spring hover on email CTA
      email.addEventListener('mouseenter', () => {
        animate(email, { scale: 1.04 }, { duration: 0.15, easing: [0.34, 1.56, 0.64, 1] });
      });
      email.addEventListener('mouseleave', () => {
        animate(email, { scale: 1 }, { duration: 0.25, easing: [0.16, 1, 0.3, 1] });
      });

      stop();
    }, { amount: 0.25 });

    return () => stop();
  });
</script>

<section class="contact" bind:this={section}>
  <div class="contact-inner">
    <div class="section-tag" style="opacity: 0;"><span class="tag-number">08</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Contact</span></div>
    <h2 class="cta-heading" style="opacity: 0;">Let's build<br />something together.</h2>

    <a href="/contact" class="email" style="opacity: 0;">Get in touch</a>

    <p class="cta-body" style="opacity: 0;">I'm always open to conversations about GTM strategy, design, operations, or interesting problems worth solving.</p>

    <div class="links" style="opacity: 0;">
      <a href="https://www.linkedin.com/in/devalexander/" target="_blank" rel="noopener" class="social-link">LinkedIn</a>
      <span class="link-dot" aria-hidden="true">&middot;</span>
      <a href="https://x.com/devinmarkets" target="_blank" rel="noopener" class="social-link">X / Twitter</a>
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
    font-size: var(--text-3xl);
    font-weight: var(--weight-regular);
    line-height: 1.05;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text);
    margin: 0 0 var(--space-element);
  }

  .email {
    font-family: 'DM Sans', sans-serif;
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
    transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .email::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color-accent-teal);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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
    font-family: 'DM Sans', sans-serif;
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
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-wide);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
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
    font-family: 'Instrument Serif', serif;
    font-style: italic;
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
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }
</style>

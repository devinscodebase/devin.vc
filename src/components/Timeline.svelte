<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let section;

  onMount(() => {
    if (window.__vtNav) {
      section.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
      return;
    }

    const tag = section.querySelector('.section-tag');
    const entries = section.querySelectorAll('.entry');
    const stops = [];

    // Section tag reveal
    const stopTag = inView(tag, () => {
      animate(tag, { opacity: 1, y: 0 }, {
        duration: 0.5,
        easing: [0.25, 1, 0.5, 1],
      });
      stopTag();
    }, { amount: 0.5 });
    stops.push(stopTag);

    // Each entry reveals individually as it scrolls into view
    entries.forEach((entry) => {
      const yearBig = entry.querySelector('.year-big');
      const content = entry.querySelector('.entry-content');
      const dot = entry.querySelector('.line-dot');
      const bar = entry.querySelector('.line-bar');

      const stopEntry = inView(entry, () => {
        // Year number slides in from left
        animate(yearBig, { opacity: 1, x: 0 }, {
          duration: 0.8,
          easing: [0.25, 1, 0.5, 1],
        });

        // Content slides up
        animate(content, { opacity: 1, y: 0 }, {
          duration: 0.8,
          delay: 0.15,
          easing: [0.25, 1, 0.5, 1],
        });

        // Dot pops in with spring
        if (dot) {
          animate(dot, { scale: [0, 1.3, 1] }, {
            duration: 0.5,
            delay: 0.3,
            easing: [0.34, 1.56, 0.64, 1],
          });
        }

        // Bar grows down
        if (bar) {
          animate(bar, { scaleY: 1 }, {
            duration: 0.6,
            delay: 0.5,
            easing: [0.25, 1, 0.5, 1],
          });
        }

        stopEntry();
      }, { amount: 0.2 });
      stops.push(stopEntry);
    });

    return () => stops.forEach(s => s());
  });
</script>

<section class="timeline" bind:this={section}>
  <div class="timeline-inner">
    <div class="section-tag" style="opacity: 0; transform: translateY(10px);">
      <span class="tag-number">02</span>
      <span class="tag-dash" aria-hidden="true"></span>
      <span class="tag-label">Career</span>
    </div>

    <ol class="entries">
      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2026</span>
          <span class="year-range">Present</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">CMO</h3>
          <span class="company">Jensen Business Advisory</span>
          <p class="detail">Leading marketing and growth for David Lee Jensen's advisory firm and The 728 Network — an exclusive mastermind for entrepreneurs scaling past $1M. Building the go-to-market engine across consulting, community, and course products that help growth-stage founders align people, process, and profits.</p>
        </div>
      </li>

      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2025</span>
          <span class="year-range">2026</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">COO</h3>
          <span class="company">Andreou Enterprises</span>
          <p class="detail">Joined as CMO of Bitmern Mining, promoted within a month to COO. Led a team of 9, ran marketing across the brand portfolio, and served as second-in-command. Proof that you don't need to be a niche expert to excel — you need to work hard, stay customer-focused, and never assume you know it all.</p>
        </div>
      </li>

      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2024</span>
          <span class="year-range">2025</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">Freelance Marketing Consultant</h3>
          <span class="company">Independent</span>
          <p class="detail">Relocated to South Africa and built bespoke growth systems across industries. Discovered that every business is fundamentally different — abandoned the cookie-cutter funnel approach and started treating each client like a custom suit.</p>
        </div>
      </li>

      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2022</span>
          <span class="year-range">2024</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">Head of Marketing</h3>
          <span class="company">B2B Business Experts → Revenx</span>
          <p class="detail">Took a leap on a two-person startup and helped scale it from $30K/month to $300K/month in revenue. Named and designed the rebrand to Revenx as we pivoted to insurance marketing. Led the website rebuild, built a customer training platform, and grew the team to 6. Mastered data analysis, process documentation, and optimization — streamlining every system to its absolute limit.</p>
        </div>
      </li>

      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2021</span>
          <span class="year-range">2022</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">VP Marketing & Operations</h3>
          <span class="company">ContentOne (Richter)</span>
          <p class="detail">Led promotion and production for a B2B SMB subsidiary. Built automation workflows across Dropbox, DocuSign, Monday.com, and Zapier — transforming scattered processes into streamlined production systems that dramatically increased efficiency.</p>
        </div>
      </li>

      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2019</span>
          <span class="year-range">2021</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">VP of Marketing</h3>
          <span class="company">Richter</span>
          <p class="detail">Pitched myself for the role and got it. Richter had 40+ Fortune 500 clients on their roster. Launched thought leadership forums, podcasts, and more — some of the most challenging, rewarding work touching nearly every part of the marketing lifecycle.</p>
        </div>
      </li>

      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2019</span>
          <span class="year-range">2019</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">VP</h3>
          <span class="company">The Customer Factory</span>
          <p class="detail">Promoted to lead the company's own marketing to chiropractors. Built lead magnets attracting hundreds of doctors weekly, cultivated referral relationships, and activated consulting partners. Drove the highest new business and growth in company history.</p>
        </div>
      </li>

      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2018</span>
          <span class="year-range">2019</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">Creative Director</h3>
          <span class="company">The Customer Factory</span>
          <p class="detail">Chiropractic marketing for 100+ practices. Moved to Atlanta and learned that marketing isn't just "if this, then that" — there are far more variables in the equation for strategic customer acquisition.</p>
        </div>
      </li>

      <li class="entry">
        <div class="entry-year">
          <span class="year-big" style="opacity: 0; transform: translateX(-30px);">2016</span>
          <span class="year-range">2018</span>
        </div>
        <div class="entry-line" aria-hidden="true">
          <span class="line-dot" style="transform: scale(0);"></span>
          <span class="line-bar" style="transform: scaleY(0);"></span>
        </div>
        <div class="entry-content" style="opacity: 0; transform: translateY(30px);">
          <h3 class="role">Junior Advertiser</h3>
          <span class="company">Flood Media</span>
          <p class="detail">Where it all began. Learned the fundamentals of Google Ads and digital advertising, then worked remotely from England. Discovered the systematic "if this, then that" logic of advertising — a foundation that still guides my thinking today.</p>
        </div>
      </li>
    </ol>
  </div>
</section>

<style>
  .timeline {
    position: relative;
    padding: clamp(8rem, 20vh, 14rem) clamp(1.5rem, 5vw, 3.5rem);
    background: var(--color-bg);
  }

  .timeline-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: clamp(4rem, 8vw, 6rem);
  }

  .tag-number {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: var(--text-md);
    line-height: 1;
    color: var(--color-accent);
  }

  .tag-dash {
    width: 24px;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent), transparent);
  }

  .tag-label {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .entries {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .entry {
    display: grid;
    grid-template-columns: clamp(80px, 13vw, 140px) 20px 1fr;
    gap: clamp(1rem, 3vw, 2.5rem);
    padding: clamp(2.5rem, 5vw, 3.5rem) 0;
    align-items: start;
  }

  .entry + .entry {
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
  }

  .entry-year {
    display: flex;
    flex-direction: column;
    gap: 0;
    text-align: right;
    padding-top: 0.1rem;
  }

  .year-big {
    font-family: 'Instrument Serif', serif;
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    line-height: 1;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text);
  }

  .year-range {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-top: 0.4rem;
  }

  .entry-line {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 0.65rem;
    height: 100%;
  }

  .line-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent-teal);
    flex-shrink: 0;
  }

  .line-bar {
    width: 1px;
    flex: 1;
    background: color-mix(in oklab, var(--color-accent-teal) 25%, transparent);
    margin-top: 0.5rem;
    transform-origin: top;
  }

  .entry:last-child .line-bar {
    display: none;
  }

  .entry-content {
    display: flex;
    flex-direction: column;
    padding-top: 0.3rem;
  }

  .role {
    font-family: 'Instrument Serif', serif;
    font-size: var(--text-xl);
    font-weight: var(--weight-regular);
    line-height: 1.25;
    color: var(--color-text);
    margin: 0;
  }

  .company {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent);
    margin-top: 0.5rem;
  }

  .detail {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-base);
    line-height: 1.65;
    color: var(--color-text-muted);
    max-width: 480px;
    margin-top: 0.75rem;
  }

  @media (max-width: 640px) {
    .entry {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .entry-year {
      flex-direction: row;
      align-items: baseline;
      gap: 0.75rem;
      text-align: left;
    }

    .year-big {
      font-size: var(--text-xl);
    }

    .entry-line {
      display: none;
    }
  }
</style>

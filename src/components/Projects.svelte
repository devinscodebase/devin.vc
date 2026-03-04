<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let { projects = [] } = $props();
  let section;

  onMount(() => {
    const rows = section.querySelectorAll('.project-row');

    // Spring hover on rows (always active)
    rows.forEach(row => {
      const arrow = row.querySelector('.row-arrow');
      if (arrow) {
        row.addEventListener('mouseenter', () => {
          animate(arrow, { x: 3, opacity: 1 }, { duration: 0.15, easing: [0.34, 1.56, 0.64, 1] });
        });
        row.addEventListener('mouseleave', () => {
          animate(arrow, { x: 0, opacity: 0 }, { duration: 0.25, easing: [0.16, 1, 0.3, 1] });
        });
      }
    });

    if (window.__vtNav) {
      section.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
      return;
    }

    const tag = section.querySelector('.section-tag');
    const heading = section.querySelector('.section-heading');
    const footer = section.querySelector('.section-footer');

    const stop = inView(section, () => {
      animate(tag, { opacity: [0, 1], y: [8, 0] }, {
        duration: 0.35,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(heading, { opacity: [0, 1], y: [12, 0] }, {
        duration: 0.4,
        delay: 0.05,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(rows, { opacity: [0, 1], y: [10, 0] }, {
        duration: 0.35,
        delay: stagger(0.05, { start: 0.1 }),
        easing: [0.25, 1, 0.5, 1],
      });

      if (footer) {
        animate(footer, { opacity: [0, 1] }, {
          duration: 0.4,
          delay: 0.4,
          easing: [0.25, 1, 0.5, 1],
        });
      }

      stop();
    }, { amount: 0.15 });

    return () => stop();
  });
</script>

<section class="projects-section" bind:this={section}>
  <div class="projects-inner">
    <div class="section-tag" style="opacity: 0;"><span class="tag-number">05</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Projects</span></div>
    <h2 class="section-heading" style="opacity: 0;">Selected Work</h2>

    <div class="project-list">
      {#each projects as project, i (project.name)}
        <a href={project.url} target="_blank" rel="noopener" class="project-row project-row--{project.accent}" style="opacity: 0;">
          <div class="row-left">
            <span class="row-index">{String(i + 1).padStart(2, '0')}</span>
            <div class="row-info">
              <span class="row-name">{project.name}</span>
              <span class="row-category">{project.category}</span>
            </div>
          </div>
          <div class="row-right">
            {#if project.screenshotUrl}
              <div class="row-thumb">
                <img
                  src="{project.screenshotUrl}?w=120&h=75&fit=crop&crop=top&auto=format"
                  alt="{project.name}"
                  width="120"
                  height="75"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            {/if}
            <div class="row-tags">
              {#each project.tags as tag (tag)}
                <span class="row-tag">{tag}</span>
              {/each}
            </div>
            <svg class="row-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 10L10 4M10 4H5.5M10 4V8.5" />
            </svg>
          </div>
        </a>
      {/each}
    </div>

    <div class="section-footer" style="opacity: 0;">
      <a href="/projects" class="view-all">
        View all projects
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 7H13M8 2L13 7l-5 5" />
        </svg>
      </a>
    </div>
  </div>
</section>

<style>
  .projects-section {
    position: relative;
    padding: var(--space-section) var(--space-page-x);
    background: var(--color-bg);
  }

  .projects-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
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

  .section-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 400;
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: -0.02em;
    margin: 0 0 var(--space-block);
  }

  /* ---- Project list ---- */
  .project-list {
    display: flex;
    flex-direction: column;
  }

  .project-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: clamp(1rem, 2vw, 1.35rem) 0;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    text-decoration: none;
    transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-row:last-child {
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
  }

  .project-row:hover {
    border-color: color-mix(in oklab, var(--color-text-muted) 25%, transparent);
  }

  /* ---- Left side: index + name/category ---- */
  .row-left {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 2vw, 1.5rem);
    min-width: 0;
  }

  .row-index {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1rem, 1.5vw, 1.15rem);
    line-height: 1;
    color: var(--color-text-muted);
    opacity: 0.25;
    flex-shrink: 0;
  }

  .project-row--teal .row-index { color: var(--color-accent-teal); opacity: 0.4; }
  .project-row--amber .row-index { color: var(--color-accent-amber); opacity: 0.4; }
  .project-row--rust .row-index { color: var(--color-accent-rust); opacity: 0.4; }

  .row-info {
    display: flex;
    align-items: baseline;
    gap: clamp(0.5rem, 1.5vw, 1rem);
    min-width: 0;
  }

  .row-name {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.15rem, 2vw, 1.5rem);
    font-weight: 400;
    line-height: 1.2;
    color: var(--color-text);
    letter-spacing: -0.01em;
    white-space: nowrap;
    transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-row:hover .row-name {
    color: var(--color-accent);
  }

  .row-category {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .project-row--teal:hover .row-category { color: var(--color-accent-teal); }
  .project-row--amber:hover .row-category { color: var(--color-accent-amber); }
  .project-row--rust:hover .row-category { color: var(--color-accent-rust); }

  /* ---- Right side: thumb + tags + arrow ---- */
  .row-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .row-thumb {
    width: 80px;
    height: 50px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    opacity: 0.7;
    transition: opacity var(--duration-fast) var(--ease-out-expo);
    flex-shrink: 0;
  }

  .project-row:hover .row-thumb {
    opacity: 1;
  }

  .row-thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }

  .row-tags {
    display: flex;
    gap: 0.4rem;
  }

  .row-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.52rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    padding: 0.2rem 0.5rem;
  }

  .row-arrow {
    color: var(--color-accent);
    opacity: 0;
    flex-shrink: 0;
    transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-row:hover .row-arrow {
    opacity: 1;
  }

  /* ---- Section footer ---- */
  .section-footer {
    margin-top: clamp(1.5rem, 3vw, 2rem);
    display: flex;
    justify-content: flex-end;
  }

  .view-all {
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

  .view-all:hover {
    color: var(--color-accent);
  }

  .view-all svg {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .view-all:hover svg {
    transform: translateX(3px);
  }

  /* ---- Mobile ---- */
  @media (max-width: 768px) {
    .project-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.65rem;
    }

    .row-right {
      padding-left: calc(clamp(1rem, 2vw, 1.5rem) + 1.15rem);
    }

    .row-tags {
      flex-wrap: wrap;
    }

    .row-thumb {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .row-tags {
      display: none;
    }
  }
</style>

<script>
  import { onMount } from 'svelte';
  import { animate, inView, stagger } from 'motion';

  let { posts = [] } = $props();

  let section;
  let email = $state('');
  let status = $state('idle');
  let errorMsg = $state('');

  async function subscribe(e) {
    e.preventDefault();
    status = 'submitting';
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }
      status = 'success';
    } catch (err) {
      errorMsg = err.message;
      status = 'error';
    }
  }

  // Separate featured post and stack posts
  const featuredPost = $derived(posts.find(p => p.featured) || posts[0]);
  const stackPosts = $derived(posts.filter(p => p !== featuredPost));

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function capitalizeTag(tag) {
    if (!tag) return '';
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }

  // Spring hover — lift card + shift title
  function postEnter(e) {
    const card = e.currentTarget;
    const title = card.querySelector('.post-title');
    animate(card, { y: -4 }, { duration: 0.15, easing: [0.34, 1.56, 0.64, 1] });
    if (title) animate(title, { x: 4 }, { duration: 0.15, easing: [0.34, 1.56, 0.64, 1] });
  }

  function postLeave(e) {
    const card = e.currentTarget;
    const title = card.querySelector('.post-title');
    animate(card, { y: 0 }, { duration: 0.25, easing: [0.16, 1, 0.3, 1] });
    if (title) animate(title, { x: 0 }, { duration: 0.25, easing: [0.16, 1, 0.3, 1] });
  }

  onMount(() => {
    const tag = section.querySelector('.section-tag');
    const header = section.querySelector('.journal-header');
    const featured = section.querySelector('.post.featured');
    const accentBar = section.querySelector('.post-accent');
    const stackEls = section.querySelectorAll('.post-stack .post');

    inView(section, () => {
      animate(tag, { opacity: [0, 1], y: [8, 0] }, {
        duration: 0.35,
        easing: [0.25, 1, 0.5, 1],
      });

      animate(header, { opacity: [0, 1], y: [12, 0] }, {
        duration: 0.4,
        delay: 0.05,
        easing: [0.25, 1, 0.5, 1],
      });

      if (featured) {
        animate(featured, { opacity: [0, 1], y: [15, 0] }, {
          duration: 0.4,
          delay: 0.1,
          easing: [0.25, 1, 0.5, 1],
        });
      }

      if (accentBar) {
        animate(accentBar, { scaleX: [0, 1] }, {
          duration: 0.35,
          delay: 0.35,
          easing: [0.25, 1, 0.5, 1],
        });
      }

      if (stackEls.length) {
        animate(stackEls, { opacity: [0, 1], y: [15, 0] }, {
          duration: 0.4,
          delay: stagger(0.06, { start: 0.15 }),
          easing: [0.25, 1, 0.5, 1],
        });
      }

      const newsletter = section.querySelector('.newsletter');
      if (newsletter) {
        animate(newsletter, { opacity: [0, 1], y: [12, 0] }, {
          duration: 0.4,
          delay: 0.3,
          easing: [0.25, 1, 0.5, 1],
        });
      }

    }, { amount: 0.15 });

    // Cursor-following spotlight on post cards
    const postCards = section.querySelectorAll('.post');
    postCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
      });
    });
  });
</script>

<section class="journal" bind:this={section}>
  <div class="journal-inner">
    <div class="section-tag" style="opacity: 0;"><span class="tag-number">06</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Journal</span></div>
    <div class="journal-header" style="opacity: 0;">
      <h2 class="section-heading">Latest Thinking</h2>
      <a href="/journal" class="view-all">
        View all
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 7h12M8 2l5 5-5 5" />
        </svg>
      </a>
    </div>

    {#if posts.length > 0}
      <div class="posts">
        {#if featuredPost}
          <a href={`/journal/${featuredPost.slug}`} class="post featured" style="opacity: 0;" onmouseenter={postEnter} onmouseleave={postLeave}>
            <div class="post-accent" aria-hidden="true" style="transform: scaleX(0); transform-origin: left;"></div>
            <span class="post-tag">{capitalizeTag(featuredPost.tag)}</span>
            <h3 class="post-title">{featuredPost.title}</h3>
            <p class="post-excerpt">{featuredPost.description}</p>
            <span class="post-date">{formatDate(featuredPost.date)}</span>
          </a>
        {/if}

        {#if stackPosts.length > 0}
          <div class="post-stack">
            {#each stackPosts as post}
              <a href={`/journal/${post.slug}`} class="post" style="opacity: 0;" onmouseenter={postEnter} onmouseleave={postLeave}>
                <span class="post-tag">{capitalizeTag(post.tag)}</span>
                <h3 class="post-title">{post.title}</h3>
                <p class="post-excerpt">{post.description}</p>
                <span class="post-date">{formatDate(post.date)}</span>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <div class="newsletter" style="opacity: 0;">
      <div class="newsletter-card">
        {#if status === 'success'}
          <div class="newsletter-success-wrap">
            <svg class="success-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            <p class="newsletter-success">You're in — check your inbox.</p>
          </div>
        {:else}
          <div class="newsletter-content">
            <span class="newsletter-tag">Newsletter</span>
            <h3 class="newsletter-heading">Get essays like these in your inbox</h3>
          </div>
          <div class="newsletter-action">
            <p class="newsletter-pitch">Occasional essays on building, leading, and craft. No spam, no noise — just honest writing about what I'm learning.</p>
            <form class="newsletter-form" onsubmit={subscribe}>
              <div class="newsletter-input-wrap">
                <input
                  type="email"
                  bind:value={email}
                  placeholder="your@email.com"
                  required
                  class="newsletter-input"
                  disabled={status === 'submitting'}
                  aria-label="Email address for newsletter"
                />
                <div class="input-line"></div>
              </div>
              <button type="submit" class="newsletter-btn" disabled={status === 'submitting'}>
                {#if status === 'submitting'}
                  <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                {:else}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9h11M10 4.5L14.5 9 10 13.5"/></svg>
                {/if}
              </button>
            </form>
            {#if status === 'error'}
              <p class="newsletter-error">{errorMsg}</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

  </div>
</section>

<style>
  .journal {
    position: relative;
    padding: var(--space-section) var(--space-page-x);
    background: var(--color-bg);
  }

  .journal-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
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

  .journal-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-block);
  }

  .section-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 400;
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: -0.02em;
    margin: 0;
  }

  .view-all {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
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

  .posts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-element);
  }

  .post-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-element);
  }

  .post {
    display: flex;
    flex-direction: column;
    padding: var(--space-card);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    border-top: 2px solid color-mix(in oklab, var(--color-accent-teal) 20%, transparent);
    text-decoration: none;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Cursor-following spotlight */
  .post::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      350px circle at var(--glow-x, 50%) var(--glow-y, 50%),
      color-mix(in oklab, var(--color-accent-teal) 6%, transparent),
      transparent 40%
    );
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .post:hover::before {
    opacity: 1;
  }

  .post:hover {
    border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
    border-top-color: var(--color-accent-teal);
  }

  .post.featured {
    justify-content: flex-end;
    position: relative;
    overflow: hidden;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
  }

  .post-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-accent-teal), var(--color-accent-amber));
    z-index: 1;
  }

  .post-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.63rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-accent-teal);
    margin-bottom: auto;
    position: relative;
    z-index: 1;
  }

  .post-title {
    font-family: 'Instrument Serif', serif;
    font-weight: 400;
    line-height: 1.2;
    color: var(--color-text);
    margin: 0 0 0.75rem;
    transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    z-index: 1;
  }

  .post:hover .post-title,
  .post:focus-visible .post-title {
    color: var(--color-accent-amber);
  }

  .post.featured .post-title {
    font-size: clamp(1.75rem, 3.2vw, 2.4rem);
    letter-spacing: -0.015em;
  }

  .post-stack .post-title {
    font-size: clamp(1.2rem, 2vw, 1.4rem);
  }

  .post-excerpt {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.92rem, 1.2vw, 1rem);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin-bottom: 0;
    position: relative;
    z-index: 1;
  }

  .post.featured .post-excerpt {
    max-width: 380px;
  }

  .post-date {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-top: clamp(1rem, 2vw, 1.5rem);
    position: relative;
    z-index: 1;
  }


  /* ---- Newsletter card ---- */
  .newsletter {
    margin-top: var(--space-block-lg);
  }

  .newsletter-card {
    display: grid;
    grid-template-columns: 5fr 6fr;
    gap: clamp(2rem, 4vw, 3rem);
    align-items: center;
    padding: clamp(2rem, 4vw, 3rem);
    border-top: 2px solid transparent;
    border-image: linear-gradient(90deg, var(--color-accent-teal), var(--color-accent-amber)) 1;
    background: color-mix(in oklab, var(--color-text-muted) 3%, transparent);
  }

  .newsletter-content {
    display: flex;
    flex-direction: column;
  }

  .newsletter-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--color-accent-teal);
    margin-bottom: 0.75rem;
  }

  .newsletter-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.5rem, 2.8vw, 2rem);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.015em;
    color: var(--color-text);
    margin: 0;
  }

  .newsletter-action {
    display: flex;
    flex-direction: column;
  }

  .newsletter-pitch {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.85rem, 1.1vw, 0.92rem);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin: 0 0 1.25rem;
  }

  .newsletter-form {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
  }

  .newsletter-input-wrap {
    flex: 1;
    position: relative;
  }

  .newsletter-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 30%, transparent);
    padding: 0.5rem 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    color: var(--color-text);
    outline: none;
    transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .input-line {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent-teal), var(--color-accent-amber));
    transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .newsletter-input:focus ~ .input-line {
    width: 100%;
  }

  .newsletter-input::placeholder {
    color: var(--color-text-muted);
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .newsletter-input:focus::placeholder {
    opacity: 0.3;
  }

  .newsletter-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    background: var(--color-accent);
    border: none;
    border-radius: 50%;
    color: var(--color-bg);
    cursor: pointer;
    transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .newsletter-btn:hover {
    background: var(--color-accent-teal);
    transform: translateX(3px);
  }

  .newsletter-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .newsletter-btn svg {
    width: 16px;
    height: 16px;
  }

  .newsletter-success-wrap {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .success-icon {
    color: var(--color-accent-teal);
    flex-shrink: 0;
  }

  .newsletter-success {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1.1rem, 1.6vw, 1.25rem);
    color: var(--color-text);
    margin: 0;
  }

  .loading-dots {
    display: inline-flex;
    gap: 2px;
  }

  .loading-dots span {
    animation: dot-pulse 1.4s infinite;
    opacity: 0;
    font-size: 0.9rem;
  }

  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dot-pulse {
    0%, 80%, 100% { opacity: 0; }
    40% { opacity: 1; }
  }

  .newsletter-error {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: var(--color-error);
    margin-top: 0.75rem;
  }

  @media (max-width: 640px) {
    .newsletter-card {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  @media (max-width: 640px) {
    .posts {
      grid-template-columns: 1fr;
    }
  }
</style>

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

  onMount(() => {
    const header = section.querySelector('.journal-header');
    const featured = section.querySelector('.post.featured');
    const accentBar = section.querySelector('.post-accent');
    const stackEls = section.querySelectorAll('.post-stack .post');
    const footer = section.querySelector('.journal-footer');

    inView(section, () => {
      animate(header, { opacity: [0, 1], y: [25, 0] }, {
        duration: 0.8,
        easing: [0.25, 1, 0.5, 1],
      });

      if (featured) {
        animate(featured, { opacity: [0, 1], y: [40, 0] }, {
          duration: 0.8,
          delay: 0.2,
          easing: [0.25, 1, 0.5, 1],
        });
      }

      if (accentBar) {
        animate(accentBar, { scaleX: [0, 1] }, {
          duration: 0.6,
          delay: 0.7,
          easing: [0.25, 1, 0.5, 1],
        });
      }

      if (stackEls.length) {
        animate(stackEls, { opacity: [0, 1], y: [35, 0] }, {
          duration: 0.7,
          delay: stagger(0.15, { start: 0.35 }),
          easing: [0.25, 1, 0.5, 1],
        });
      }

      const newsletter = section.querySelector('.newsletter');
      if (newsletter) {
        animate(newsletter, { opacity: [0, 1], y: [20, 0] }, {
          duration: 0.7,
          delay: 0.6,
          easing: [0.25, 1, 0.5, 1],
        });
      }

      animate(footer, { opacity: [0, 1], y: [15, 0] }, {
        duration: 0.6,
        delay: 0.8,
        easing: [0.25, 1, 0.5, 1],
      });
    }, { amount: 0.15 });
  });
</script>

<section class="journal" bind:this={section}>
  <div class="journal-inner">
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
          <a href={`/journal/${featuredPost.slug}`} class="post featured" style="opacity: 0;">
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
              <a href={`/journal/${post.slug}`} class="post" style="opacity: 0;">
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
      <div class="newsletter-rule" aria-hidden="true"></div>
      {#if status === 'success'}
        <p class="newsletter-success">You're in — check your inbox.</p>
      {:else}
        <h3 class="newsletter-heading">Get essays like these in your inbox</h3>
        <p class="newsletter-pitch">Occasional essays on building, leading, and craft. No spam.</p>
        <form class="newsletter-form" onsubmit={subscribe}>
          <input
            type="email"
            bind:value={email}
            placeholder="your@email.com"
            required
            class="newsletter-input"
            disabled={status === 'submitting'}
            aria-label="Email address for newsletter"
          />
          <button type="submit" class="newsletter-btn" disabled={status === 'submitting'}>
            {#if status === 'submitting'}
              <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
            {:else}
              Subscribe
            {/if}
          </button>
        </form>
        {#if status === 'error'}
          <p class="newsletter-error">{errorMsg}</p>
        {/if}
      {/if}
    </div>

    <div class="journal-footer" style="opacity: 0;">
      <span class="label">05 / Journal</span>
      <div class="rule" aria-hidden="true"></div>
    </div>
  </div>
</section>

<style>
  .journal {
    position: relative;
    padding: clamp(8rem, 20vh, 14rem) clamp(1.5rem, 5vw, 3.5rem);
    background: var(--color-bg);
  }

  .journal-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  .journal-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: clamp(3rem, 6vw, 5rem);
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
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .view-all:hover {
    color: var(--color-accent);
  }

  .view-all svg {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .view-all:hover svg {
    transform: translateX(3px);
  }

  .posts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(1.5rem, 3vw, 2.5rem);
  }

  .post-stack {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2.5rem);
  }

  .post {
    display: flex;
    flex-direction: column;
    padding: clamp(1.5rem, 3vw, 2rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    text-decoration: none;
    box-shadow: var(--shadow-sm);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .post:hover {
    transform: translateY(-3px);
    border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
    box-shadow: var(--shadow-lg);
  }

  .post.featured {
    justify-content: flex-end;
    position: relative;
    overflow: hidden;
  }

  .post-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-accent);
  }

  .post-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.58rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-bottom: auto;
  }

  .post-title {
    font-family: 'Instrument Serif', serif;
    font-weight: 400;
    line-height: 1.2;
    color: var(--color-text);
    margin: 0 0 0.5rem;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .post:hover .post-title {
    color: var(--color-accent);
  }

  .post.featured .post-title {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    letter-spacing: -0.015em;
  }

  .post-stack .post-title {
    font-size: clamp(1.1rem, 1.8vw, 1.3rem);
  }

  .post-excerpt {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.82rem, 1.1vw, 0.9rem);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin-bottom: 0;
  }

  .post.featured .post-excerpt {
    max-width: 380px;
  }

  .post-date {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-top: clamp(1rem, 2vw, 1.5rem);
  }

  .journal-footer {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: clamp(4rem, 8vw, 6rem);
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

  .newsletter {
    margin-top: clamp(3rem, 6vw, 5rem);
    text-align: center;
  }

  .newsletter-rule {
    height: 1px;
    background: color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    margin-bottom: clamp(2.5rem, 5vw, 4rem);
  }

  .newsletter-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.1rem, 2vw, 1.35rem);
    font-weight: 400;
    line-height: 1.2;
    color: var(--color-text);
    margin: 0 0 0.5rem;
  }

  .newsletter-pitch {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.8rem, 1.1vw, 0.88rem);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin: 0 0 1.5rem;
  }

  .newsletter-form {
    display: flex;
    gap: 0;
    max-width: 400px;
    margin: 0 auto;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .newsletter-form:focus-within {
    border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 12%, transparent);
  }

  .newsletter-input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 0.75rem 1rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    color: var(--color-text);
    outline: none;
  }

  .newsletter-input::placeholder {
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .newsletter-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    background: var(--color-accent);
    color: var(--color-bg);
    padding: 0.75rem 1.5rem;
    border: none;
    cursor: pointer;
    transition: filter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .newsletter-btn:hover {
    filter: brightness(1.1);
  }

  .newsletter-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .newsletter-success {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    color: var(--color-accent);
    font-weight: 400;
    margin: 0;
  }

  .loading-dots {
    display: inline-flex;
    gap: 2px;
  }

  .loading-dots span {
    animation: dot-pulse 1.4s infinite;
    opacity: 0;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

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

  @media (max-width: 480px) {
    .newsletter-form {
      flex-direction: column;
      border: none;
    }

    .newsletter-input {
      border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    }

    .newsletter-btn {
      padding: 0.85rem 1.5rem;
    }
  }

  @media (max-width: 640px) {
    .posts {
      grid-template-columns: 1fr;
    }
  }
</style>

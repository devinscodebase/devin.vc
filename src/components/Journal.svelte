<script>
  import { onMount } from 'svelte';

  /*
    Entrance fades handled by the global .reveal utility. Component owns
    only the cursor-following spotlight on post cards — pure DOM event,
    no motion lib needed. Hover lift + title shift are CSS transitions
    (moved into the style block).
  */

  let { posts = [] } = $props();
  let section;

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
    <div class="section-tag reveal" style="--reveal-i: 0"><span class="tag-number">08</span><span class="tag-dash" aria-hidden="true"></span><span class="tag-label">Journal</span></div>
    <div class="journal-header reveal" style="--reveal-i: 1">
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
          <a href={`/journal/${featuredPost.slug}`} class="post featured reveal" style="--reveal-i: 2">
            <div class="post-accent" aria-hidden="true"></div>
            <span class="post-tag">{capitalizeTag(featuredPost.tag)}</span>
            <h3 class="post-title">{featuredPost.title}</h3>
            <p class="post-excerpt">{featuredPost.description}</p>
            <span class="post-date">{formatDate(featuredPost.date)}</span>
          </a>
        {/if}

        {#if stackPosts.length > 0}
          <div class="post-stack">
            {#each stackPosts as post, i}
              <a href={`/journal/${post.slug}`} class="post reveal" style="--reveal-i: {i + 3}">
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

  .journal-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-block);
  }

  .section-heading {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    margin: 0;
  }

  .view-all {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .view-all:hover {
    color: var(--color-accent);
  }

  .view-all svg {
    transition: transform var(--duration-fast) var(--ease-out-expo);
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
    transition:
      border-color var(--duration-fast) var(--ease-out-expo),
      transform var(--duration-fast) var(--ease-spring);
  }

  .post:hover { transform: translateY(-4px); }

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
    transition: opacity var(--duration-fast) var(--ease-out-expo);
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
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent-teal);
    margin-bottom: auto;
    position: relative;
    z-index: 1;
  }

  .post-title {
    font-family: var(--font-display);
    font-weight: var(--weight-regular);
    line-height: 1.2;
    color: var(--color-text);
    margin: 0 0 0.75rem;
    transition:
      color var(--duration-fast) var(--ease-out-expo),
      transform var(--duration-fast) var(--ease-spring);
    position: relative;
    z-index: 1;
  }

  .post:hover .post-title,
  .post:focus-visible .post-title {
    color: var(--color-accent-amber);
    transform: translateX(4px);
  }

  .post.featured .post-title {
    font-size: var(--text-2xl);
    letter-spacing: var(--tracking-tight);
  }

  .post-stack .post-title {
    font-size: var(--text-md);
  }

  .post-excerpt {
    font-family: var(--font-body);
    font-size: var(--text-base);
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
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-top: clamp(1rem, 2vw, 1.5rem);
    position: relative;
    z-index: 1;
  }


  @media (max-width: 640px) {
    .posts {
      grid-template-columns: 1fr;
    }
  }
</style>

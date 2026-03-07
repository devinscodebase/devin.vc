<script>
  import { onMount } from 'svelte';

  let track;
  let progress = 0;
  let percent = 0;
  let hovering = false;
  let visible = false;
  let menuOpen = false;
  let hideTimer;

  onMount(() => {
    // Watch for menu open (Nav sets body overflow to hidden)
    const observer = new MutationObserver(() => {
      menuOpen = document.body.style.overflow === 'hidden';
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progress = docHeight > 0 ? scrollTop / docHeight : 0;
      percent = Math.round(progress * 100);

      visible = true;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { visible = false; }, 3000);
    }

    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      observer.disconnect();
      clearTimeout(hideTimer);
    };
  });

  function handleClick(e) {
    const rect = track.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: ratio * docHeight, behavior: 'smooth' });
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="scrollbar"
  bind:this={track}
  onclick={handleClick}
  onmouseenter={() => hovering = true}
  onmouseleave={() => hovering = false}
  class:hovering
  class:visible
  class:hidden={menuOpen}
>
  <div class="fill-line" style="transform: scaleY({progress});" aria-hidden="true"></div>
  <div class="thumb-wrap" style="top: calc({progress * 100}% - {progress * 24}px);">
    <div class="thumb" aria-hidden="true"></div>
    <span class="percent">{percent}</span>
  </div>
</div>

<style>
  .scrollbar {
    position: fixed;
    right: 16px;
    top: 48px;
    bottom: 48px;
    width: 32px;
    z-index: 45;
    cursor: pointer;
    display: flex;
    justify-content: flex-end;
    opacity: 0;
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .scrollbar.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .scrollbar.hovering {
    opacity: 1;
    pointer-events: auto;
  }

  .scrollbar.hidden {
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* Hide on touch devices / small screens */
  @media (pointer: coarse), (max-width: 768px) {
    .scrollbar {
      display: none;
    }
  }

  .fill-line {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--color-accent-teal);
    transform-origin: top;
    opacity: 0.3;
    transition: opacity 0.3s;
  }

  .scrollbar.hovering .fill-line {
    opacity: 0.5;
  }

  .thumb-wrap {
    position: absolute;
    right: -3px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-direction: row-reverse;
  }

  .thumb {
    width: 7px;
    height: 24px;
    border-radius: 4px;
    background: var(--color-accent-teal);
    opacity: 0.85;
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .scrollbar.hovering .thumb {
    opacity: 1;
    transform: scaleY(1.2);
  }

  .percent {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-regular);
    letter-spacing: var(--tracking-wide);
    color: var(--color-text-muted);
    opacity: 0;
    transform: translateX(4px);
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    min-width: 1.4em;
    text-align: right;
  }

  .scrollbar.hovering .percent {
    opacity: 0.7;
    transform: translateX(0);
  }
</style>

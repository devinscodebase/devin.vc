<script>
  import { onMount } from 'svelte';

  let open = $state(false);
  let theme = $state('dark');
  let scrolled = $state(false);
  let currentPath = $state('/');

  onMount(() => {
    theme = document.documentElement.getAttribute('data-theme') || 'dark';
    currentPath = window.location.pathname;

    function onScroll() {
      scrolled = window.scrollY > 80;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Listen for Astro page transitions
    document.addEventListener('astro:after-swap', () => {
      currentPath = window.location.pathname;
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  });

  function toggleMenu() {
    open = !open;
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  $effect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  });
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && open) open = false; }} />

<header class="navbar" class:open class:scrolled>
  <a href="/" class="logo">Devin</a>

  <div class="nav-actions">
    <button
      class="theme-toggle"
      onclick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <!-- sun (shown in dark mode) -->
      <svg class="icon icon-sun" class:active={theme === 'dark'} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="9" cy="9" r="3.5" />
        <line x1="9" y1="1.5" x2="9" y2="3" />
        <line x1="9" y1="15" x2="9" y2="16.5" />
        <line x1="1.5" y1="9" x2="3" y2="9" />
        <line x1="15" y1="9" x2="16.5" y2="9" />
        <line x1="3.7" y1="3.7" x2="4.75" y2="4.75" />
        <line x1="13.25" y1="13.25" x2="14.3" y2="14.3" />
        <line x1="3.7" y1="14.3" x2="4.75" y2="13.25" />
        <line x1="13.25" y1="4.75" x2="14.3" y2="3.7" />
      </svg>
      <!-- moon (shown in light mode) -->
      <svg class="icon icon-moon" class:active={theme === 'light'} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15.5 9.87A7 7 0 1 1 8.13 2.5 5.5 5.5 0 0 0 15.5 9.87Z" />
      </svg>
    </button>

    <button
      class="burger"
      onclick={toggleMenu}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
    >
      <div class="burger-lines" class:open>
        <span></span>
        <span></span>
      </div>
    </button>
  </div>
</header>

<div class="overlay" class:open>
  <div class="grain-overlay" aria-hidden="true"></div>

  <nav class="overlay-nav">
    <a href="/work" class="nav-link" class:active={currentPath.startsWith('/work')} onclick={() => open = false}>
      <span class="nav-number">01</span>
      <span class="nav-label">Work</span>
    </a>
    <a href="/projects" class="nav-link" class:active={currentPath.startsWith('/projects')} onclick={() => open = false}>
      <span class="nav-number">02</span>
      <span class="nav-label">Projects</span>
    </a>
    <a href="/about" class="nav-link" class:active={currentPath.startsWith('/about')} onclick={() => open = false}>
      <span class="nav-number">03</span>
      <span class="nav-label">About</span>
    </a>
    <a href="/journal" class="nav-link" class:active={currentPath.startsWith('/journal')} onclick={() => open = false}>
      <span class="nav-number">04</span>
      <span class="nav-label">Journal</span>
    </a>
    <a href="/contact" class="nav-link" class:active={currentPath.startsWith('/contact')} onclick={() => open = false}>
      <span class="nav-number">05</span>
      <span class="nav-label">Contact</span>
    </a>
  </nav>

  <div class="overlay-footer">
    <span class="footer-domain">devin.vc</span>
    <span class="footer-tagline">Build your future with me</span>
  </div>
</div>

<style>
  /* ==============================
     NAVBAR
     ============================== */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.75rem clamp(1.5rem, 5vw, 3.5rem);
    pointer-events: none;
    opacity: 0;
    animation: nav-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
    background: transparent;
    border-bottom: 1px solid transparent;
    transition: background 0.4s, border-color 0.4s, backdrop-filter 0.4s, padding 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .navbar.scrolled {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    background: color-mix(in oklab, var(--color-bg) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    pointer-events: auto;
  }

  .navbar > * {
    pointer-events: auto;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  /* ---- logo ---- */
  .logo {
    font-family: 'Instrument Serif', serif;
    font-size: var(--text-md);
    color: var(--color-text);
    text-decoration: none;
    letter-spacing: var(--tracking-tight);
    position: relative;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .logo::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--color-accent);
    transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .logo:hover {
    color: var(--color-accent);
  }

  .logo:hover::after {
    width: 100%;
  }

  /* ---- theme toggle ---- */
  .theme-toggle {
    appearance: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 12px;
    margin: -12px;
    position: relative;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    transition: color 0.3s;
  }

  .theme-toggle:hover {
    color: var(--color-accent);
  }

  .icon {
    position: absolute;
    opacity: 0;
    transform: rotate(-90deg) scale(0.7);
    transition:
      opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .icon.active {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }

  /* ---- burger ---- */
  .burger {
    appearance: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 12px;
    margin: -12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s;
  }

  .burger:hover {
    opacity: 0.7;
  }

  .burger-lines {
    width: 28px;
    height: 14px;
    position: relative;
  }

  .burger-lines span {
    position: absolute;
    height: 1.5px;
    background: var(--color-text);
    right: 0;
    border-radius: 1px;
    transition:
      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
      width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      background-color 0.5s ease,
      opacity 0.3s;
  }

  .burger-lines span:first-child {
    width: 28px;
    top: 0;
  }

  .burger-lines span:last-child {
    width: 18px;
    bottom: 0;
  }

  .burger:hover .burger-lines:not(.open) span:last-child {
    width: 28px;
  }

  .burger-lines.open span:first-child {
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  .burger-lines.open span:last-child {
    bottom: 50%;
    width: 28px;
    transform: translateY(50%) rotate(-45deg);
  }

  /* ==============================
     OVERLAY
     ============================== */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: var(--color-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    clip-path: circle(0% at calc(100% - clamp(2rem, 5vw, 4rem)) 2.5rem);
    transition: clip-path 0.75s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .overlay.open {
    clip-path: circle(150% at calc(100% - clamp(2rem, 5vw, 4rem)) 2.5rem);
    pointer-events: auto;
  }

  /* ---- nav links ---- */
  .overlay-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.5rem, 4vh, 2.5rem);
    position: relative;
  }

  .nav-link {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    text-decoration: none;
    position: relative;
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  .overlay.open .nav-link {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      color 0.3s;
  }
  .overlay.open .nav-link:nth-child(1) { transition-delay: 0.2s, 0.2s, 0s; }
  .overlay.open .nav-link:nth-child(2) { transition-delay: 0.27s, 0.27s, 0s; }
  .overlay.open .nav-link:nth-child(3) { transition-delay: 0.34s, 0.34s, 0s; }
  .overlay.open .nav-link:nth-child(4) { transition-delay: 0.41s, 0.41s, 0s; }

  .nav-number {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    color: var(--color-accent-teal);
    opacity: 0.8;
    transition: opacity 0.3s;
    position: relative;
    top: -0.4em;
  }

  .nav-link:nth-child(2) .nav-number { color: var(--color-accent-amber); }
  .nav-link:nth-child(3) .nav-number { color: var(--color-accent-rust); }
  .nav-link:nth-child(4) .nav-number { color: var(--color-accent-amber); }

  .nav-label {
    font-family: 'Instrument Serif', serif;
    font-size: var(--text-3xl);
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    line-height: 1;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--color-accent);
    transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .nav-link:hover .nav-label {
    color: var(--color-accent);
  }

  .nav-link:hover .nav-number {
    opacity: 1;
  }

  .nav-link:hover::after {
    width: 100%;
  }

  .nav-link.active .nav-label {
    color: var(--color-accent);
  }

  .nav-link.active .nav-number {
    opacity: 1;
  }

  .nav-link.active::after {
    width: 100%;
  }

  /* ---- footer ---- */
  .overlay-footer {
    position: absolute;
    bottom: clamp(1.5rem, 4vh, 2.5rem);
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 clamp(1.5rem, 5vw, 3.5rem);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .overlay.open .overlay-footer {
    opacity: 1;
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s;
  }

  .footer-domain,
  .footer-tagline {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .footer-tagline {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    text-transform: none;
    letter-spacing: 0;
    font-size: var(--text-base);
  }

  /* ==============================
     KEYFRAMES
     ============================== */
  @keyframes nav-enter {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

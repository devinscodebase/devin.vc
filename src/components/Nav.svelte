<script>
  import { onMount } from 'svelte';

  let open = $state(false);
  let theme = $state('light');
  let scrolled = $state(false);
  let currentPath = $state('/');

  const tools = [
    { name: 'GTM Planner', href: '/tools/gtm-planner', accent: 'teal' },
    { name: 'Retention Calc', href: '/tools/retention-calculator', accent: 'amber' },
    { name: 'Scorecard', href: '/tools/marketing-scorecard', accent: 'rust' },
  ];

  onMount(() => {
    theme = document.documentElement.getAttribute('data-theme') || 'light';
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
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function closeMenu() {
    open = false;
    document.body.style.overflow = '';
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && open) closeMenu(); }} />

<header class="navbar" class:open class:scrolled>
  <a href="/" class="logo">
    <img src="/images/avatar.png" alt="" class="logo-avatar" width="28" height="28" />
    Devin Alexander
  </a>

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

  <div class="overlay-content">
    <nav class="overlay-nav">
      <a href="/work" class="nav-link accent-teal" class:active={currentPath.startsWith('/work')} onclick={closeMenu}>
        <span class="nav-label">Work</span>
      </a>
      <a href="/projects" class="nav-link accent-amber" class:active={currentPath.startsWith('/projects')} onclick={closeMenu}>
        <span class="nav-label">Projects</span>
      </a>
      <a href="/about" class="nav-link accent-rust" class:active={currentPath.startsWith('/about')} onclick={closeMenu}>
        <span class="nav-label">About</span>
      </a>
      <a href="/journal" class="nav-link accent-amber" class:active={currentPath.startsWith('/journal')} onclick={closeMenu}>
        <span class="nav-label">Journal</span>
      </a>
      <a href="/training" class="nav-link accent-rust" class:active={currentPath.startsWith('/training')} onclick={closeMenu}>
        <span class="nav-label">Training</span>
      </a>
      <a href="/contact" class="nav-link accent-teal" class:active={currentPath.startsWith('/contact')} onclick={closeMenu}>
        <span class="nav-label">Contact</span>
      </a>
    </nav>

    <div class="tools-section">
      <div class="tools-divider" aria-hidden="true"></div>
      <span class="tools-label">Free Tools</span>
      <div class="tools-row">
        {#each tools as tool}
          <a href={tool.href} class="tool-link accent-{tool.accent}" class:active={currentPath === tool.href} onclick={closeMenu}>
            <span class="tool-dot" aria-hidden="true"></span>
            {tool.name}
            <svg class="tool-arrow" width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 7h12M8 2l5 5-5 5" />
            </svg>
          </a>
        {/each}
      </div>
      <a href="/tools" class="tools-view-all" class:active={currentPath === '/tools'} onclick={closeMenu}>View all tools</a>
    </div>
  </div>

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
    animation: nav-enter 0.8s var(--ease-out-expo) 0.6s forwards;
    background: transparent;
    border-bottom: 1px solid transparent;
    transition: background 0.4s, border-color 0.4s, backdrop-filter 0.4s, padding var(--duration-normal) var(--ease-out-expo);
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
    font-family: var(--font-display);
    font-size: var(--text-md);
    color: var(--color-text);
    text-decoration: none;
    letter-spacing: var(--tracking-tight);
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    transition: color var(--duration-normal) var(--ease-out-expo);
  }

  .logo-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    opacity: 0.85;
    transition: opacity var(--duration-normal) var(--ease-out-expo),
                border-color var(--duration-normal) var(--ease-out-expo),
                box-shadow var(--duration-normal) var(--ease-out-expo);
  }

  .logo:hover .logo-avatar {
    opacity: 1;
    border-color: color-mix(in oklab, var(--color-accent) 25%, transparent);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 8%, transparent);
  }

  .logo::after {
    content: none;
  }

  .logo:hover {
    color: var(--color-accent);
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
      opacity var(--duration-normal) var(--ease-out-expo),
      transform var(--duration-normal) var(--ease-out-expo);
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
      transform var(--duration-slow) var(--ease-out-expo),
      width var(--duration-normal) var(--ease-out-expo),
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
    transition: clip-path 0.75s var(--ease-out-expo);
    pointer-events: none;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .overlay.open {
    clip-path: circle(150% at calc(100% - clamp(2rem, 5vw, 4rem)) 2.5rem);
    pointer-events: auto;
  }

  .overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: clamp(3.5rem, 8vh, 5rem) 1.5rem clamp(2rem, 5vh, 3rem);
    width: 100%;
    max-width: 640px;
  }

  /* ---- nav links ---- */
  .overlay-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1rem, 2.5vh, 1.75rem);
    position: relative;
    width: 100%;
  }

  .nav-link {
    --link-accent: var(--color-accent-teal);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    position: relative;
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  .nav-link.accent-teal { --link-accent: var(--color-accent-teal); }
  .nav-link.accent-amber { --link-accent: var(--color-accent-amber); }
  .nav-link.accent-rust { --link-accent: var(--color-accent-rust); }

  /* Accent dash — hidden by default, slides in on hover/active */
  .nav-link::before {
    content: '';
    width: 0;
    height: 1.5px;
    background: var(--link-accent);
    transition: width var(--duration-normal) var(--ease-out-expo);
    flex-shrink: 0;
  }

  .nav-link:hover::before,
  .nav-link.active::before {
    width: 28px;
  }

  .overlay.open .nav-link {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.6s var(--ease-out-expo),
      transform 0.6s var(--ease-out-expo),
      color 0.3s;
  }
  .overlay.open .nav-link:nth-child(1) { transition-delay: 0.2s, 0.2s, 0s; }
  .overlay.open .nav-link:nth-child(2) { transition-delay: 0.27s, 0.27s, 0s; }
  .overlay.open .nav-link:nth-child(3) { transition-delay: 0.34s, 0.34s, 0s; }
  .overlay.open .nav-link:nth-child(4) { transition-delay: 0.41s, 0.41s, 0s; }
  .overlay.open .nav-link:nth-child(5) { transition-delay: 0.48s, 0.48s, 0s; }

  .nav-label {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    line-height: 1.05;
    transition: color var(--duration-normal) var(--ease-out-expo);
  }

  /* Tight viewports: step down again so 6 items + tools fit comfortably */
  @media (max-height: 700px), (max-width: 480px) {
    .overlay-nav { gap: clamp(0.85rem, 2vh, 1.25rem); }
    .nav-label { font-size: var(--text-xl); }
  }

  .nav-link:hover .nav-label {
    color: var(--link-accent);
  }

  .nav-link.active .nav-label {
    color: var(--link-accent);
  }

  /* ---- tools section ---- */
  .tools-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: clamp(1.75rem, 4.5vh, 3rem);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .overlay.open .tools-section {
    opacity: 1;
    transition: opacity 0.6s var(--ease-out-expo) 0.5s;
  }

  .tools-divider {
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      color-mix(in oklab, var(--color-text-muted) 30%, transparent),
      transparent
    );
    margin-bottom: 1.25rem;
  }

  .tools-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 1rem;
  }

  .tools-row {
    display: flex;
    align-items: center;
    gap: clamp(1.25rem, 3vw, 2rem);
    flex-wrap: wrap;
    justify-content: center;
  }

  .tool-link {
    --tool-accent: var(--color-accent-teal);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--duration-normal) var(--ease-out-expo);
  }

  .tool-link.accent-teal { --tool-accent: var(--color-accent-teal); }
  .tool-link.accent-amber { --tool-accent: var(--color-accent-amber); }
  .tool-link.accent-rust { --tool-accent: var(--color-accent-rust); }

  .tool-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--tool-accent);
    opacity: 0.6;
    transition: opacity var(--duration-normal) var(--ease-out-expo),
                transform var(--duration-normal) var(--ease-out-expo);
  }

  .tool-arrow {
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity var(--duration-normal) var(--ease-out-expo),
                transform var(--duration-normal) var(--ease-out-expo);
  }

  .tool-link:hover {
    color: var(--tool-accent);
  }

  .tool-link:hover .tool-dot {
    opacity: 1;
    transform: scale(1.3);
  }

  .tool-link:hover .tool-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  .tool-link.active {
    color: var(--tool-accent);
  }

  .tool-link.active .tool-dot {
    opacity: 1;
  }

  .tools-view-all {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: color-mix(in oklab, var(--color-text-muted) 50%, transparent);
    text-decoration: none;
    margin-top: 0.85rem;
    transition: color var(--duration-normal) var(--ease-out-expo);
  }

  .tools-view-all:hover,
  .tools-view-all.active {
    color: var(--color-accent);
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
    transition: opacity 0.6s var(--ease-out-expo) 0.55s;
  }

  .footer-domain,
  .footer-tagline {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .footer-tagline {
    font-family: var(--font-display);
    text-transform: none;
    letter-spacing: 0;
    font-size: var(--text-base);
  }

  /* ---- mobile ---- */
  @media (max-width: 640px) {
    .tools-row {
      flex-direction: column;
      gap: 0.75rem;
    }
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

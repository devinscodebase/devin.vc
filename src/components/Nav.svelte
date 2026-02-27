<script>
  let open = $state(false);

  function toggle() {
    open = !open;
  }

  $effect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  });
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && open) open = false; }} />

<header class="navbar" class:open>
  <a href="/" class="logo">Devin</a>

  <button
    class="burger"
    onclick={toggle}
    aria-label={open ? 'Close menu' : 'Open menu'}
    aria-expanded={open}
  >
    <div class="burger-lines" class:open>
      <span></span>
      <span></span>
    </div>
  </button>
</header>

<div class="overlay" class:open>
  <div class="overlay-grain" aria-hidden="true"></div>

  <nav class="overlay-nav">
    <a href="/work" class="nav-link" onclick={() => open = false}>
      <span class="nav-number">01</span>
      <span class="nav-label">Work</span>
    </a>
    <a href="/about" class="nav-link" onclick={() => open = false}>
      <span class="nav-number">02</span>
      <span class="nav-label">About</span>
    </a>
    <a href="/journal" class="nav-link" onclick={() => open = false}>
      <span class="nav-number">03</span>
      <span class="nav-label">Journal</span>
    </a>
    <a href="/contact" class="nav-link" onclick={() => open = false}>
      <span class="nav-number">04</span>
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
    /* fade in on load */
    opacity: 0;
    animation: nav-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
  }

  .navbar > * {
    pointer-events: auto;
  }

  /* ---- logo ---- */
  .logo {
    font-family: 'Instrument Serif', serif;
    font-size: 1.35rem;
    color: #ede8df;
    text-decoration: none;
    letter-spacing: -0.02em;
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
    background: #c4a47c;
    transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .logo:hover {
    color: #c4a47c;
  }

  .logo:hover::after {
    width: 100%;
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
  }

  .burger-lines {
    width: 28px;
    height: 14px;
    position: relative;
  }

  .burger-lines span {
    position: absolute;
    height: 1.5px;
    background: #ede8df;
    right: 0;
    border-radius: 1px;
    transition:
      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
      width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
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

  /* burger hover — lines equalize */
  .burger:hover .burger-lines:not(.open) span:last-child {
    width: 28px;
  }

  /* burger open — X */
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
    background: #0c0c0a;
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

  /* grain inside overlay */
  .overlay-grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.035;
    mix-blend-mode: overlay;
    pointer-events: none;
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
    /* close: vanish fast */
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  /* open: staggered reveal */
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
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    color: #c4a47c;
    opacity: 0.6;
    transition: opacity 0.3s;
    position: relative;
    top: -0.4em;
  }

  .nav-label {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2.5rem, 7vw, 4.5rem);
    color: #ede8df;
    letter-spacing: -0.02em;
    line-height: 1;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* hover — gold shift + line reveal */
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: #c4a47c;
    transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .nav-link:hover .nav-label {
    color: #c4a47c;
  }

  .nav-link:hover .nav-number {
    opacity: 1;
  }

  .nav-link:hover::after {
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
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #8a8478;
  }

  .footer-tagline {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.9rem;
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

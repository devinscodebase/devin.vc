<script>
  import { onMount } from 'svelte';

  let kinetic;
  let hero;
  let cx = 0, cy = 0;
  let tx = 0, ty = 0;
  let rafId;
  let hasPointer = false;

  function onMove(e) {
    const rect = hero.getBoundingClientRect();
    tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function onLeave() {
    tx = 0;
    ty = 0;
  }

  function tick() {
    if (hasPointer && kinetic) {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      kinetic.style.setProperty('--mx', cx.toFixed(4));
      kinetic.style.setProperty('--my', cy.toFixed(4));
    }
    if (hero) {
      const p = Math.min(window.scrollY / (hero.offsetHeight * 0.65), 1);
      hero.style.setProperty('--scroll', p.toFixed(4));
    }
    rafId = requestAnimationFrame(tick);
  }

  onMount(() => {
    hasPointer = !matchMedia('(pointer: coarse)').matches;
    rafId = requestAnimationFrame(tick);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  });
</script>

<section class="hero" bind:this={hero} onmousemove={onMove} onmouseleave={onLeave}>
  <!-- kinetic typography field -->
  <div class="kinetic" bind:this={kinetic} aria-hidden="true">
    <div class="kinetic-row r1 heavy"><span>MARKETING · OPERATIONS · DESIGN · GTM · MARKETING · OPERATIONS · DESIGN · GTM ·&nbsp;</span><span>MARKETING · OPERATIONS · DESIGN · GTM · MARKETING · OPERATIONS · DESIGN · GTM ·&nbsp;</span></div>
    <div class="kinetic-row r2 serif glow"><span>DESIGN · OPERATIONS · MARKETING · GTM · DESIGN · OPERATIONS · MARKETING · GTM ·&nbsp;</span><span>DESIGN · OPERATIONS · MARKETING · GTM · DESIGN · OPERATIONS · MARKETING · GTM ·&nbsp;</span></div>
    <div class="kinetic-row r3"><span>GTM · DESIGN · OPERATIONS · MARKETING · GTM · DESIGN · OPERATIONS · MARKETING ·&nbsp;</span><span>GTM · DESIGN · OPERATIONS · MARKETING · GTM · DESIGN · OPERATIONS · MARKETING ·&nbsp;</span></div>
    <div class="kinetic-row r4 serif"><span>OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM ·&nbsp;</span><span>OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM ·&nbsp;</span></div>
    <div class="kinetic-row r5 heavy"><span>MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN ·&nbsp;</span><span>MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN ·&nbsp;</span></div>
    <div class="kinetic-row r6 serif glow"><span>DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS ·&nbsp;</span><span>DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS ·&nbsp;</span></div>
    <div class="kinetic-row r7"><span>GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN ·&nbsp;</span><span>GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN ·&nbsp;</span></div>
    <div class="kinetic-row r8 serif"><span>OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM ·&nbsp;</span><span>OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM ·&nbsp;</span></div>
    <div class="kinetic-row r9 heavy"><span>MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS ·&nbsp;</span><span>MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS ·&nbsp;</span></div>
    <div class="kinetic-row r10 serif glow"><span>DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING ·&nbsp;</span><span>DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING ·&nbsp;</span></div>
  </div>

  <!-- vignette (light mode depth) -->
  <div class="vignette" aria-hidden="true"></div>

  <div class="grain" aria-hidden="true"></div>

  <div class="content">
    <h1 class="name">
      <span class="name-line name-line-1">Devin</span>
      <span class="name-line name-line-2">Alexander</span>
    </h1>

    <div class="divider" aria-hidden="true"></div>

    <p class="tagline">Build your future with me</p>

    <p class="descriptors">
      <span>Marketing</span>
      <span class="dot" aria-hidden="true">&middot;</span>
      <span>Operations</span>
      <span class="dot" aria-hidden="true">&middot;</span>
      <span>Design & Dev</span>
      <span class="dot" aria-hidden="true">&middot;</span>
      <span>GTM</span>
    </p>
  </div>

  <div class="scroll-fade" aria-hidden="true">
    <div class="scroll-indicator">
      <div class="scroll-line"></div>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--hero-bg);
  }

  /* warm vignette — adds depth in light mode, invisible in dark */
  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 70% 60% at 50% 50%,
      transparent 30%,
      var(--hero-vignette) 100%
    );
    pointer-events: none;
  }

  /* ---- kinetic typography ---- */
  .kinetic {
    position: absolute;
    inset: -60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(2rem, 4.5vh, 3.5rem);
    transform: rotate(-12deg);
    pointer-events: none;
    user-select: none;
  }

  .kinetic-row {
    display: flex;
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 300;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-kinetic);
    opacity: 0.03;
    will-change: transform;
    translate: calc(var(--mx, 0) * 8px) calc(var(--my, 0) * 8px);
  }

  .kinetic-row span {
    display: inline-block;
    flex-shrink: 0;
    padding-right: 0.3em;
  }

  /* typographic variants */
  .kinetic-row.serif {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(3rem, 5.5vw, 5rem);
    letter-spacing: 0.04em;
    opacity: 0.045;
    translate: calc(var(--mx, 0) * 18px) calc(var(--my, 0) * 18px);
  }

  .kinetic-row.heavy {
    font-weight: 500;
    opacity: 0.04;
    translate: calc(var(--mx, 0) * 12px) calc(var(--my, 0) * 12px);
  }

  .kinetic-row.glow {
    opacity: 0.05;
    translate: calc(var(--mx, 0) * 25px) calc(var(--my, 0) * 25px);
  }

  .r1  { animation: drift-left  80s linear infinite; }
  .r2  { animation: drift-right 90s linear infinite; }
  .r3  { animation: drift-left  70s linear infinite; }
  .r4  { animation: drift-right 85s linear infinite; }
  .r5  { animation: drift-left  75s linear infinite; }
  .r6  { animation: drift-right 95s linear infinite; }
  .r7  { animation: drift-left  88s linear infinite; }
  .r8  { animation: drift-right 72s linear infinite; }
  .r9  { animation: drift-left  82s linear infinite; }
  .r10 { animation: drift-right 78s linear infinite; }

  @keyframes drift-left {
    from { transform: translate3d(0, 0, 0); }
    to   { transform: translate3d(-50%, 0, 0); }
  }

  @keyframes drift-right {
    from { transform: translate3d(-50%, 0, 0); }
    to   { transform: translate3d(0, 0, 0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .kinetic-row {
      animation-play-state: paused !important;
    }
  }

  /* ---- film-grain ---- */
  .grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: var(--grain-opacity);
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  /* ---- scroll parallax exit ---- */
  .kinetic {
    opacity: calc(1 - var(--scroll, 0) * 0.6);
  }

  /* ---- content ---- */
  .content {
    position: relative;
    text-align: center;
    padding: 2rem;
    opacity: calc(1 - var(--scroll, 0));
    translate: 0 calc(var(--scroll, 0) * -60px);
  }

  .name {
    font-family: 'Instrument Serif', serif;
    line-height: 0.95;
    letter-spacing: -0.025em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    /* no filter — kept lightweight for instant theme switch */
  }

  .name-line {
    display: block;
    opacity: 0;
    padding: 0.05em 0.15em;
    animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    background: linear-gradient(180deg, var(--color-name-start) 0%, var(--color-name-end) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .name-line-1 {
    font-size: clamp(4rem, 12vw, 9rem);
    animation-delay: 0.15s;
  }

  .name-line-2 {
    font-size: clamp(4rem, 12vw, 9rem);
    animation-delay: 0.3s;
  }

  .divider {
    width: 0;
    height: 1px;
    margin: clamp(1.5rem, 3vw, 2.5rem) auto;
    background: var(--color-accent);
    animation: expand 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.55s;
  }

  .tagline {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    color: var(--color-text);
    opacity: 0;
    animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.65s;
    margin-bottom: clamp(1rem, 2vw, 1.5rem);
  }

  .descriptors {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.65rem, 1.1vw, 0.8rem);
    font-weight: 400;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.6em;
    opacity: 0;
    animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.75s;
  }

  .dot {
    color: var(--color-accent);
    font-size: 1.1em;
    line-height: 1;
  }

  .scroll-fade {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    translate: -50% 0;
    opacity: calc(1 - var(--scroll, 0) * 5);
  }

  .scroll-indicator {
    opacity: 0;
    animation: reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 1.4s;
  }

  .scroll-line {
    width: 1px;
    height: 40px;
    background: linear-gradient(180deg, var(--color-text-muted) 0%, transparent 100%);
    animation: pulse-height 2.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    animation-delay: 2s;
  }

  @keyframes reveal {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes expand {
    from { width: 0; }
    to { width: 72px; }
  }

  @keyframes pulse-height {
    0%, 100% { opacity: 0.4; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(1.2); }
  }
</style>

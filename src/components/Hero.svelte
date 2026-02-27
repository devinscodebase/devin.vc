<section class="hero">
  <!-- kinetic typography field -->
  <div class="kinetic" aria-hidden="true">
    <div class="kinetic-row r1"><span>MARKETING · OPERATIONS · DESIGN · GTM · MARKETING · OPERATIONS · DESIGN · GTM · MARKETING · OPERATIONS · DESIGN · GTM ·&nbsp;</span><span>MARKETING · OPERATIONS · DESIGN · GTM · MARKETING · OPERATIONS · DESIGN · GTM · MARKETING · OPERATIONS · DESIGN · GTM ·&nbsp;</span></div>
    <div class="kinetic-row r2"><span>GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS ·&nbsp;</span><span>GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS ·&nbsp;</span></div>
    <div class="kinetic-row r3"><span>DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING ·&nbsp;</span><span>DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING ·&nbsp;</span></div>
    <div class="kinetic-row r4"><span>OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM ·&nbsp;</span><span>OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM ·&nbsp;</span></div>
    <div class="kinetic-row r5"><span>MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN ·&nbsp;</span><span>MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN ·&nbsp;</span></div>
    <div class="kinetic-row r6"><span>DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS ·&nbsp;</span><span>DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS · DESIGN · MARKETING · GTM · OPERATIONS ·&nbsp;</span></div>
    <div class="kinetic-row r7"><span>GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN ·&nbsp;</span><span>GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN ·&nbsp;</span></div>
    <div class="kinetic-row r8"><span>OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM ·&nbsp;</span><span>OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM ·&nbsp;</span></div>
    <div class="kinetic-row r9"><span>MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS ·&nbsp;</span><span>MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS · MARKETING · DESIGN · GTM · OPERATIONS ·&nbsp;</span></div>
    <div class="kinetic-row r10"><span>DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING ·&nbsp;</span><span>DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING · DESIGN · OPERATIONS · GTM · MARKETING ·&nbsp;</span></div>
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

  <div class="scroll-indicator" aria-hidden="true">
    <div class="scroll-line"></div>
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
    transition: background-color 0.5s ease;
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
    transition: background 0.5s ease;
  }

  /* ---- kinetic typography ---- */
  .kinetic {
    position: absolute;
    inset: -60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(2.5rem, 5vh, 4rem);
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
    opacity: 0.035;
    will-change: transform;
    transition: color 0.5s ease;
  }

  .kinetic-row span {
    display: inline-block;
    padding-right: 0.3em;
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
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  @keyframes drift-right {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
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
    mix-blend-mode: var(--grain-blend);
    pointer-events: none;
    transition: opacity 0.5s ease;
  }

  /* ---- content ---- */
  .content {
    position: relative;
    text-align: center;
    padding: 2rem;
  }

  .name {
    font-family: 'Instrument Serif', serif;
    line-height: 0.95;
    letter-spacing: -0.025em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    filter: drop-shadow(var(--name-shadow));
    transition: filter 0.5s ease;
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
    transition: color 0.5s ease;
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
    transition: color 0.5s ease;
  }

  .dot {
    color: var(--color-accent);
    font-size: 1.1em;
    line-height: 1;
    transition: color 0.5s ease;
  }

  .scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    translate: -50% 0;
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

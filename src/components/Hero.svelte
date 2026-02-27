<section class="hero">
  <!-- ambient glow behind name -->
  <div class="glow" aria-hidden="true"></div>

  <!-- grain texture overlay -->
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

  <!-- scroll indicator -->
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
    background: radial-gradient(
      ellipse 80% 60% at 50% 50%,
      #13120f 0%,
      #0c0c0a 100%
    );
  }

  /* ---- ambient warm glow ---- */
  .glow {
    position: absolute;
    width: min(700px, 90vw);
    aspect-ratio: 3 / 2;
    top: 50%;
    left: 50%;
    translate: -50% -55%;
    background: radial-gradient(
      ellipse,
      oklch(0.55 0.06 65 / 0.07) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  /* ---- film-grain ---- */
  .grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.035;
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  /* ---- content container ---- */
  .content {
    position: relative;
    text-align: center;
    padding: 2rem;
  }

  /* ---- name ---- */
  .name {
    font-family: 'Instrument Serif', serif;
    line-height: 0.95;
    letter-spacing: -0.025em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .name-line {
    display: block;
    opacity: 0;
    padding: 0.05em 0.15em;
    animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    background: linear-gradient(180deg, #f0ebe2 0%, #d6c9ae 100%);
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

  /* ---- divider ---- */
  .divider {
    width: 0;
    height: 1px;
    margin: clamp(1.5rem, 3vw, 2.5rem) auto;
    background: #c4a47c;
    animation: expand 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.55s;
  }

  /* ---- tagline ---- */
  .tagline {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    color: #ede8df;
    opacity: 0;
    animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: 0.65s;
    margin-bottom: clamp(1rem, 2vw, 1.5rem);
  }

  /* ---- descriptors ---- */
  .descriptors {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.65rem, 1.1vw, 0.8rem);
    font-weight: 400;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #8a8478;
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
    color: #c4a47c;
    font-size: 1.1em;
    line-height: 1;
  }

  /* ---- scroll indicator ---- */
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
    background: linear-gradient(180deg, #8a8478 0%, transparent 100%);
    animation: pulse-height 2.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    animation-delay: 2s;
  }

  /* ---- keyframes ---- */
  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes expand {
    from { width: 0; }
    to { width: 72px; }
  }

  @keyframes pulse-height {
    0%, 100% {
      opacity: 0.4;
      transform: scaleY(1);
    }
    50% {
      opacity: 1;
      transform: scaleY(1.2);
    }
  }
</style>

<script>
  let scrollY = $state(0);
  let innerHeight = $state(800);

  let progress = $derived(Math.min(1, scrollY / (innerHeight * 0.7)));
  let fadeOut = $derived(1 - progress);
  let drift = $derived(scrollY * 0.15);
</script>

<svelte:window bind:scrollY bind:innerHeight />

<section class="relative min-h-screen flex items-end overflow-hidden">
  <!-- Dark background that fades to reveal warm sand body -->
  <div class="absolute inset-0 transition-none" style="opacity: {fadeOut.toFixed(3)}">
    <div class="absolute inset-0 bg-rich-black"></div>
    <!-- Warm atmospheric glow -->
    <div class="hero-glow" style="transform: translateY({(drift * 0.5).toFixed(1)}px)"></div>
  </div>

  <!-- Content with parallax drift -->
  <div
    class="relative z-10 w-full max-w-5xl px-8 sm:px-16 md:px-24 pb-20 md:pb-28"
    style="opacity: {fadeOut.toFixed(3)}; transform: translateY(-{drift.toFixed(1)}px)"
  >
    <h1 class="font-display hero-name text-sand">
      DEVIN
    </h1>
    <p class="font-sans text-sand/40 text-lg sm:text-xl font-light mt-5 max-w-sm tracking-wide leading-relaxed">
      builder of things, teller of stories
    </p>
  </div>

  <!-- Scroll indicator -->
  <div
    class="absolute bottom-8 left-1/2 scroll-hint"
    style="opacity: {(fadeOut * 0.5).toFixed(3)}"
  >
    <div class="w-px h-16 bg-gradient-to-b from-transparent via-sand/15 to-sand/30"></div>
  </div>
</section>

<style>
  .hero-name {
    font-size: clamp(5rem, 18vw, 14rem);
    line-height: 0.85;
    letter-spacing: -0.02em;
    animation: breathe 8s ease-in-out infinite;
  }

  .hero-glow {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 15% 85%, oklch(28% 0.06 55 / 0.5), transparent),
      radial-gradient(ellipse 50% 40% at 75% 15%, oklch(20% 0.03 220 / 0.25), transparent);
  }

  @keyframes breathe {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.87; }
  }

  .scroll-hint {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
  }
</style>

<script>
  let scrollY = $state(0);
  let windowHeight = $state(1);
  let docHeight = $state(1);

  $effect(() => {
    docHeight = document.documentElement.scrollHeight;
  });

  function getBackground(progress) {
    const stops = [
      { at: 0,    l: 16.90, c: 0.0314, h: 222.67 },
      { at: 0.15, l: 44.85, c: 0.0810, h: 218.76 },
      { at: 0.30, l: 60.24, c: 0.1010, h: 197.43 },
      { at: 0.50, l: 88.40, c: 0.0677, h: 91.52 },
      { at: 0.70, l: 81.57, c: 0.0701, h: 171.49 },
      { at: 1,    l: 16.90, c: 0.0314, h: 222.67 },
    ];

    let lower = stops[0], upper = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (progress >= stops[i].at && progress <= stops[i + 1].at) {
        lower = stops[i];
        upper = stops[i + 1];
        break;
      }
    }

    const range = upper.at - lower.at;
    const t = range === 0 ? 0 : (progress - lower.at) / range;

    const l = lower.l + (upper.l - lower.l) * t;
    const c = lower.c + (upper.c - lower.c) * t;
    const h = lower.h + (upper.h - lower.h) * t;

    return `oklch(${l.toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)})`;
  }

  let bg = $derived(getBackground(docHeight > windowHeight ? scrollY / (docHeight - windowHeight) : 0));
</script>

<svelte:window bind:scrollY bind:innerHeight={windowHeight} />

<div class="fixed inset-0 z-0 transition-none" style="background-color: {bg}"></div>

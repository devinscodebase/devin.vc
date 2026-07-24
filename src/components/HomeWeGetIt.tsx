// ────────────────────────────────────────────────────────────────
// HomeWeGetIt.tsx — "#we-get-it" (scroll-scrubbed statement story).
// Hydrated island (client:visible in index.astro), so it must NOT
// use the data-reveal scroll system.
//
// The section is 300vh tall; a full-viewport stage pins sticky
// inside it and scroll progress through the section drives the
// three beats directly (no timers, no AnimatePresence):
//   1. "WE GET IT" — the marker sweeps the highlight in from the
//      left (right inset 100→0%), then the stroke continues out to
//      the right (left inset 0→100%) as you keep scrolling.
//   2. "You need revenue. Right now." — fades up through a window
//      of progress, then fades away.
//   3. The agency line fades up and holds to the end, so the
//      section unpins resting on it. Scrolling back up rewinds the
//      story; that is inherent to scrubbing and intended.
//
// prefers-reduced-motion: no tall section, no pinning, the final
// line renders statically in a normal-height section.
//
// Screen readers get the full copy at once in a visually hidden
// heading; the animated stage is aria-hidden.
// ────────────────────────────────────────────────────────────────
import { useRef } from 'react';
import {
  cubicBezier,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

import iconSecurityStar from '../icons/freehand/security-collaboration-star.svg?raw';
import iconCashBag from '../icons/freehand/cash-payment-bag-1.svg?raw';
import iconSmileyDecode from '../icons/freehand/smiley-decode.svg?raw';

export default function HomeWeGetIt() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // ── Humanized timing, three decisions ──────────────────────────
  // 1. The whole timeline rides a spring, not the raw scrollbar:
  //    the ink trails the finger by a beat and coasts to rest when
  //    scrolling stops (layered inertia applied to the timeline).
  //    Tight spring, so it reads as mass, never as float.
  // 2. Every window is eased. The sweep uses the marker's own
  //    --ease-drag (quick touch as the pen lands, steady drag that
  //    eases off): a hand never moves at constant velocity, and
  //    pure linear reads as a progress bar. Fades arrive on expo
  //    out and leave on smooth in-out; exits are shorter than
  //    entrances because departures are quicker than arrivals.
  // 3. Blank beats between phrases (0.40–0.44, 0.68–0.72), the
  //    pause between sentences, and each y settles a hair after
  //    its opacity, so the consequence trails the thing.
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const easeDrag = cubicBezier(0.19, 0.36, 0.72, 0.92);
  const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);
  const easeInOutSmooth = cubicBezier(0.65, 0, 0.35, 1);

  // Windows are sized in scroll distance, not just progress: at
  // 450vh the section scrubs across ~3.5 viewport-heights, so a
  // hold of 0.16-0.20 is ~600-900px of scroll where the line sits
  // still, and transitions get ~200-300px. Holds must dominate
  // transitions or the words glide by at normal scroll speed.

  // Beat 1: sweep in (right edge 100→0), hold, stroke out (left edge 0→100).
  const sweepIn = useTransform(progress, [0.04, 0.13], [100, 0], { ease: easeDrag });
  const sweepOut = useTransform(progress, [0.32, 0.38], [0, 100], { ease: easeInOutSmooth });
  const clipPath = useMotionTemplate`inset(-0.25em ${sweepIn}% -0.25em ${sweepOut}%)`;

  // Beat 2: fade up, long hold, then away.
  const revenueOpacity = useTransform(
    progress,
    [0.42, 0.48, 0.64, 0.69],
    [0, 1, 1, 0],
    { ease: [easeOutExpo, easeInOutSmooth, easeInOutSmooth] },
  );
  const revenueY = useTransform(
    progress,
    [0.42, 0.5, 0.64, 0.69],
    ['0.35em', '0em', '0em', '-0.25em'],
    { ease: [easeOutExpo, easeInOutSmooth, easeInOutSmooth] },
  );

  // Beat 3: fade up and rest for the final fifth of the section.
  const agencyOpacity = useTransform(progress, [0.73, 0.8], [0, 1], { ease: easeOutExpo });
  const agencyY = useTransform(progress, [0.73, 0.82], ['0.35em', '0em'], { ease: easeOutExpo });

  // Belt-and-braces: a beat at zero opacity (or fully clipped) also
  // goes visibility:hidden, so a renderer that mishandles opacity or
  // clip layers can never paint two beats stacked.
  const sweepVisibility = useTransform(() => {
    // Read both before combining: || would short-circuit past the
    // second .get() on first run and it would never be tracked as
    // a dependency.
    const inEdge = sweepIn.get();
    const outEdge = sweepOut.get();
    return inEdge >= 99.9 || outEdge >= 99.9 ? 'hidden' : 'visible';
  });
  const revenueVisibility = useTransform(() => (revenueOpacity.get() < 0.01 ? 'hidden' : 'visible'));
  const agencyVisibility = useTransform(() => (agencyOpacity.get() < 0.01 ? 'hidden' : 'visible'));

  if (reducedMotion) {
    return (
      <section className="section_layout" id="we-get-it">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <h2 className="sr-only">
                We get it. You need revenue. Right now. Your agency should
                make you money, not cost you with nothing to show for it.
              </h2>
              <div className="flex items-center justify-center text-center" aria-hidden="true">
                <p className="text-h2 font-display" style={{ textWrap: 'balance' }}>
                  Your agency should make you money, not cost you with nothing
                  to show for it.{' '}
                  <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSmileyDecode }} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="section_layout" id="we-get-it" style={{ height: '450vh' }}>
      <h2 className="sr-only">
        We get it. You need revenue. Right now. Your agency should make you
        money, not cost you with nothing to show for it.
      </h2>
      <div style={{ position: 'sticky', top: 0, height: '100vh' }} aria-hidden="true">
        <div className="padding-global" style={{ height: '100%' }}>
          <div className="container-large" style={{ height: '100%' }}>
            <div
              className="text-center"
              style={{ display: 'grid', placeItems: 'center', height: '100%' }}
            >
              <motion.p
                className="text-h1 font-display"
                style={{ gridArea: '1 / 1', clipPath, visibility: sweepVisibility }}
              >
                <span className="highlight">
                  WE GET IT{' '}
                  <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSecurityStar }} />
                  <span className="grain-overlay" aria-hidden="true"></span>
                </span>
              </motion.p>
              <motion.p
                className="text-h2 font-display"
                style={{ gridArea: '1 / 1', opacity: revenueOpacity, y: revenueY, visibility: revenueVisibility }}
              >
                You need revenue. Right now.{' '}
                <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconCashBag }} />
              </motion.p>
              <motion.p
                className="text-h2 font-display"
                style={{ gridArea: '1 / 1', opacity: agencyOpacity, y: agencyY, textWrap: 'balance', visibility: agencyVisibility }}
              >
                Your agency should make you money, not cost you with nothing
                to show for it.{' '}
                <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSmileyDecode }} />
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

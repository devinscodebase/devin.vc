// ────────────────────────────────────────────────────────────────
// HomeProblem.tsx — "The problem" tape section (#problem).
// Server-rendered static component: no hooks, no state, no
// client: directive — REQUIRED, because this section uses the
// data-reveal scroll system, and data-reveal must never sit inside
// a hydrated island. Site.astro's IntersectionObserver adds
// is-revealed + motion-slide-in to the tape wrappers with the
// 0 / 120 / 240 / 360ms stagger; the kicker takes the default
// motion-fade-up.
//
// The soft hyphen in IMPRES-SIONS. (the source page's &shy;) is
// authored as the \u00AD escape inside a string-literal expression
// so it survives to the DOM — it lets the tape break mid-word at
// narrow widths.
// ────────────────────────────────────────────────────────────────
import iconMonetizationUserCash from '../icons/freehand/monetization-user-cash.svg?raw';
import iconCashPaymentBills from '../icons/freehand/cash-payment-bills.svg?raw';
import iconAppWindowEyeView from '../icons/freehand/app-window-eye-view.svg?raw';
import iconSmileyInTrouble from '../icons/freehand/smiley-in-trouble.svg?raw';

export default function HomeProblem() {
  return (
    <section className="section_layout" id="problem">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <h2 className="label is-kicker problem_kicker" data-reveal="">The problem</h2>
            <div className="tape-group">
              <div data-reveal="" data-reveal-motion="motion-slide-in" data-reveal-delay="0">
                <p className="tape text-h2">YOU HIRED THE “EXPERTS.” <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconMonetizationUserCash }} /><span className="grain-overlay" aria-hidden="true"></span></p>
              </div>
              <div data-reveal="" data-reveal-motion="motion-slide-in" data-reveal-delay="120">
                <p className="tape is-reverse text-h2">YOU PAID EVERY MONTH. <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconCashPaymentBills }} /><span className="grain-overlay" aria-hidden="true"></span></p>
              </div>
              <div data-reveal="" data-reveal-motion="motion-slide-in" data-reveal-delay="240">
                <p className="tape text-h2">{'THEY GOT YOU “IMPRES\u00ADSIONS.”'} <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconAppWindowEyeView }} /><span className="grain-overlay" aria-hidden="true"></span></p>
              </div>
              <div data-reveal="" data-reveal-motion="motion-slide-in" data-reveal-delay="360">
                <p className="tape is-reverse text-h2">BUT $0 IN REVENUE GAINS. <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSmileyInTrouble }} /><span className="grain-overlay" aria-hidden="true"></span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

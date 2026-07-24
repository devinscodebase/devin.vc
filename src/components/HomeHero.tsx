// ────────────────────────────────────────────────────────────────
// HomeHero.tsx — the home page hero (#top). Server-rendered static
// component: no hooks, no state, no client: directive — Astro
// renders it to plain HTML and ships zero JS for it.
//
// Motion here is the EAGER load-time stagger, NOT the data-reveal
// scroll system: bare motion-fade-up classes animate as soon as
// the html.js gate opens, offset by --m-delay style objects
// (0 / 90ms / 180ms). The hero is above the fold, so it must never
// wait on the IntersectionObserver — no data-reveal anywhere in
// this component.
// ────────────────────────────────────────────────────────────────
import type { CSSProperties } from 'react';

import iconMoney from '../icons/freehand/money.svg?raw';
import iconArrowRight from '../icons/freehand/arrow-right.svg?raw';

export default function HomeHero() {
  return (
    <section className="section_layout" id="top">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className="section_head">
              <h1 className="text-h1 motion-fade-up">
                The last agency you’ll ever need.
              </h1>
              <p className="section_lead text-body-lg text-ink-muted max-w-measure-sm motion-fade-up" style={{ '--m-delay': '90ms' } as CSSProperties}>
                Everything you get is human-made, designed to sell, and
                priced up front. If you’ve paid for marketing that
                couldn’t get the job done, you’re in the right place.
              </p>
              <div className="button-group motion-fade-up" style={{ '--m-delay': '180ms' } as CSSProperties}>
                <a className="button is-hero" href="/quote">
                  <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconMoney }} /> Get an instant quote
                </a>
                <a className="button is-hero is-secondary" href="#services">
                  How we work <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconArrowRight }} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

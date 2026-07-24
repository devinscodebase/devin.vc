// ────────────────────────────────────────────────────────────────
// LegalShell.tsx — the shared static shell for /privacy and /terms.
// Server-rendered component: no hooks, no state, no client:
// directive — which is why the data-reveal attributes are correct
// here (they are forbidden only inside hydrated islands). Both
// legal pages share this exact structure and reveal cadence today:
// kicker at 0, h1 at 90, lead at 180, then the whole section_body
// reveals as ONE unit at 270, all default motion. The content
// components (PrivacyContent, TermsContent) carry only copy.
// ────────────────────────────────────────────────────────────────
import type { ReactNode } from 'react';

interface Props {
  id: 'privacy' | 'terms';
  kicker: string;
  title: string;
  lead: ReactNode;
  children: ReactNode;
}

export default function LegalShell({ id, kicker, title, lead, children }: Props) {
  return (
    <section className="section_layout" id={id}>
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className="section_head">
              <p className="label is-kicker" data-reveal="">{kicker}</p>
              <h1 className="text-h2" data-reveal="" data-reveal-delay="90">{title}</h1>
              <p className="section_lead text-body-md text-ink-muted max-w-measure-md" data-reveal="" data-reveal-delay="180">
                {lead}
              </p>
            </div>

            <div className="section_body max-w-measure-lg rich_text" data-reveal="" data-reveal-delay="270">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

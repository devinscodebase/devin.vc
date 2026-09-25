import type { ReactNode } from 'react';

interface Props {
  id: 'privacy' | 'cookies' | 'terms';
  title: string;
  lead: ReactNode;
  children: ReactNode;
}

export default function LegalShell({ id, title, lead, children }: Props) {
  return (
    <section className="section_layout" id={id}>
      <div className="padding-global">
        <div className="container-small">
          <div className="padding-section-medium">
            <div className="section_head">
              <h1 className="text-h2" data-reveal="">{title}</h1>
              <p className="section_lead text-body-md text-ink-muted" data-reveal="" data-reveal-delay="90">
                {lead}
              </p>
            </div>

            <div className="section_body legal_doc" data-reveal="" data-reveal-delay="180">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

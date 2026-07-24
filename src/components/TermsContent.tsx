// ────────────────────────────────────────────────────────────────
// TermsContent.tsx — the /terms page body, rendered through
// LegalShell. Server-rendered static component: no hooks, no
// state, no client: directive. Page rationale, preserved from the
// .astro page this copy was moved from verbatim:
//
// /terms — plain-language terms of service. Payment/ownership/
// cancellation language matches what's already shipped elsewhere
// on the site verbatim (the /quote result screen's terms line, the
// "Do I own my accounts?" and "Am I locked into a contract?" FAQ
// answers on the home page) so nothing here contradicts a promise
// already made on a page a visitor may have already read. First
// draft in Devin's own voice, not reviewed by a lawyer.
// ────────────────────────────────────────────────────────────────
import LegalShell from './LegalShell';

const updated = 'July 2026';

export default function TermsContent() {
  return (
    <LegalShell
      id="terms"
      kicker="Terms"
      title="The terms behind working together."
      lead={
        <>
          Last updated {updated}. The same plain terms quoted on the
          instant quote page, written out in full here.
        </>
      }
    >
      <h2 className="text-h4">What's being sold</h2>
      <p className="text-body text-ink-muted">
        Website design, funnel building, email marketing, digital
        advertising, and brand design, as described on this site and
        priced through the{' '}
        <a className="text-link" href="/quote">instant quote</a> tool.
        Work outside that scope is quoted separately before it starts.
      </p>

      <h2 className="text-h4">Quotes and pricing</h2>
      <p className="text-body text-ink-muted">
        A number from the instant quote tool is good for 30 days. It's
        built from the services and business details you give it, so a
        different selection gives a different number. Custom scope
        gets a custom number, agreed before work starts.
      </p>

      <h2 className="text-h4">Payment</h2>
      <p className="text-body text-ink-muted">
        Project work (website design, funnel building, brand design) is
        half down to start, half at delivery. Ongoing work (email
        marketing, digital advertising) is billed monthly, in advance.
        No long contract either way.
      </p>

      <h2 className="text-h4">Cancellation</h2>
      <p className="text-body text-ink-muted">
        Ongoing monthly work can be cancelled anytime with 30 days'
        notice. Project work already in progress is billed for the
        portion completed if it's cancelled partway through.
      </p>

      <h2 className="text-h4">What you own</h2>
      <p className="text-body text-ink-muted">
        Everything delivered is yours: the domain, the accounts, the
        analytics, the code, the creative files. If you leave,
        everything goes with you, the same day you ask for it.
      </p>

      <h2 className="text-h4">What I don't promise</h2>
      <p className="text-body text-ink-muted">
        I don't guarantee a specific result, revenue number, or
        ranking, because nobody honestly can. I do promise the work
        described on this site gets made by hand, on the timeline we
        agree to, and that a miss gets explained and fixed rather than
        blamed on something else.
      </p>

      <h2 className="text-h4">Changes to these terms</h2>
      <p className="text-body text-ink-muted">
        If these terms change, this page changes with them, and the
        date at the top updates. Work already underway is covered by
        the terms in place when it started.
      </p>

      <h2 className="text-h4">Questions</h2>
      <p className="text-body text-ink-muted">
        Email <a className="text-link" href="mailto:me@devin.vc">me@devin.vc</a>.
        Real answer, from me, not a form.
      </p>
    </LegalShell>
  );
}

// ────────────────────────────────────────────────────────────────
// PrivacyContent.tsx — the /privacy page body, rendered through
// LegalShell. Server-rendered static component: no hooks, no
// state, no client: directive. Page rationale, preserved from the
// .astro page this copy was moved from verbatim:
//
// /privacy — plain-language privacy policy. Describes what this
// site actually does, verified against the live codebase before
// writing a word of it (grep for cookies, third-party calls,
// analytics) rather than a generic template: no analytics is
// currently wired on this site (removed with the pre-rebrand
// consent banner, never reinstated), no theme-preference cookie
// exists, Sanity isn't fetched by any live page. The only things
// that actually touch a visitor's data today are the /quote form,
// the booking flow, and Cloudflare Turnstile's bot check. This is
// a first draft in Devin's own voice, not reviewed by a lawyer —
// flagged to him directly, not stated on the page itself.
// ────────────────────────────────────────────────────────────────
import LegalShell from './LegalShell';

const updated = 'July 2026';

export default function PrivacyContent() {
  return (
    <LegalShell
      id="privacy"
      kicker="Privacy"
      title="What this site collects, and what it doesn't."
      lead={
        <>
          Last updated {updated}. Written the same way the rest of this
          site is: plainly, and only saying things you can check.
        </>
      }
    >
      <h2 className="text-h4">The short version</h2>
      <p className="text-body text-ink-muted">
        Browsing this site collects nothing beyond standard web server
        logs. If you fill out the instant quote form or book a call,
        you give me your name, email, and the details of that form,
        and I use them to answer you and do the work.
      </p>

      <h2 className="text-h4">What's collected, and when</h2>
      <ul className="list text-body">
        <li>
          <strong>Just browsing.</strong> No cookies, no tracking
          pixels, no analytics script. Cloudflare, who hosts this site,
          keeps standard server logs (IP address, page requested,
          timestamp) the way any web host does. I don't have a
          separate analytics tool layered on top.
        </li>
        <li>
          <strong>The instant quote form.</strong> Your name, email,
          industry, revenue range, the services you selected, and
          anything you type in "what do you sell." This is stored so
          I can follow up with your number and answer your questions.
        </li>
        <li>
          <strong>Booking a call.</strong> Your name, email, phone
          number if you give one, and the time you picked. Sent to
          Cal.com to schedule the call and to me so I know it's
          happening.
        </li>
        <li>
          <strong>The "I'm not a robot" check.</strong> The quote form
          uses Cloudflare Turnstile to block spam submissions. It runs
          a check in your browser; Cloudflare's own privacy policy
          covers that interaction, not mine.
        </li>
      </ul>

      <h2 className="text-h4">Who it's shared with</h2>
      <p className="text-body text-ink-muted">
        The people whose infrastructure this site runs on, and nobody
        else. I don't sell your information or hand it to advertisers.
      </p>
      <ul className="list text-body">
        <li><strong>Resend</strong> — sends the emails your submission triggers.</li>
        <li><strong>Turso</strong> — stores form submissions in a database.</li>
        <li><strong>Cloudflare</strong> — hosts the site and runs the bot check above.</li>
        <li><strong>Cal.com</strong> — runs the call-booking calendar.</li>
      </ul>
      <p className="text-body text-ink-muted">
        If you submit the quote form, your email may also be added to
        a list I use to follow up about the project you asked about.
        You can ask to be removed at any time, see below.
      </p>

      <h2 className="text-h4">How long it's kept</h2>
      <p className="text-body text-ink-muted">
        Quote and booking submissions are kept as long as needed to
        respond to you and for basic business records, then deleted.
        If you'd like yours deleted sooner, email me and I'll do it.
      </p>

      <h2 className="text-h4">Your options</h2>
      <p className="text-body text-ink-muted">
        Email <a className="text-link" href="mailto:me@devin.vc">me@devin.vc</a>{' '}
        to see what I have on file for you, correct it, or have it
        deleted. I'll handle it myself, there's no support queue.
      </p>

      <h2 className="text-h4">Changes to this page</h2>
      <p className="text-body text-ink-muted">
        If what this site collects changes, this page changes with it,
        and the date at the top updates.
      </p>
    </LegalShell>
  );
}

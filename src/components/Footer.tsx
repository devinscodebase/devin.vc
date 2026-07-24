// ────────────────────────────────────────────────────────────────
// Footer.tsx — the site footer. Server-rendered static component:
// no hooks, no state, no client: directive. The primary nav comes
// from the shared src/config/nav.ts list; the Privacy and Terms
// links are footer-only and stay hardcoded here, after the shared
// items (per the nav.ts header comment).
// ────────────────────────────────────────────────────────────────
import { navItems } from '../config/nav';
import iconLogoMeteor from '../icons/freehand/logo-meteor.svg?raw';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="padding-global">
        <div className="container-large">
          <div className="footer_inner">
            <a className="logo" href="/">
              <span className="logo_mark" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconLogoMeteor }} />Devin Alexander
            </a>
            <nav className="footer_nav" aria-label="Footer">
              {navItems.map((item) => (
                <a key={item.href} className="nav_link" href={item.href}>{item.label}</a>
              ))}
              <a className="nav_link" href="/privacy">Privacy</a>
              <a className="nav_link" href="/terms">Terms</a>
            </nav>
            <a className="button is-small" href="/quote">Get an instant quote</a>
            <p className="footer_line label text-ink-muted">© 2026 Devin Alexander. All work human-made.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

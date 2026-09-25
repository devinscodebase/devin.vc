import { navItems } from '../config/nav';
import type { Avatar } from '../lib/avatar';

export default function Footer({ avatar }: { avatar: Avatar }) {
  return (
    <footer className="footer">
      <div className="padding-global">
        <div className="container-large">
          <div className="footer_inner">
            <a className="logo" href="/">
              <img className="logo_avatar" src={avatar.src} srcSet={avatar.srcSet} alt="" width={36} height={36} />Devin Alexander
            </a>
            <nav className="footer_nav" aria-label="Footer">
              {navItems.map((item) => (
                <a key={item.href} className="nav_link" href={item.href}>{item.label}</a>
              ))}
              <a className="nav_link" href="/privacy">Privacy</a>
              <a className="nav_link" href="/cookies">Cookies</a>
              <a className="nav_link" href="/terms">Terms</a>
            </nav>
            <a className="button is-small" href="/#waitlist">Join the waitlist</a>
            <p className="footer_line label text-ink-muted">© 2026 Devin Alexander. All work human-made.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────────
// Navbar.tsx — the site header. Server-rendered static component:
// no hooks, no state, no client: directive — Astro renders it to
// plain HTML and ships zero JS for it. The id="navbar" is
// load-bearing: Site.astro's inline bootstrap script toggles
// .is-stuck on it as the page leaves the top.
//
// The burger button is NOT rendered here — it arrives as
// {children}. Site.astro passes <MobileMenu client:idle /> as this
// component's child (client: directives only exist in .astro
// templates), and the island's <astro-island> wrapper is
// display:contents, so the burger still sits inside the
// .navbar_actions flex cell where .navbar_burger's display rules
// and the is-composed collapse expect it.
// ────────────────────────────────────────────────────────────────
import type { ReactNode } from 'react';

import { navItems } from '../config/nav';
import iconLogoMeteor from '../icons/freehand/logo-meteor.svg?raw';
import iconMoney from '../icons/freehand/money.svg?raw';

interface Props {
  children?: ReactNode;
}

export default function Navbar({ children }: Props) {
  return (
    <header className="navbar is-composed" id="navbar">
      <div className="padding-global">
        <div className="container-large">
          <div className="navbar_inner">
            <span className="grain-overlay" aria-hidden="true"></span>
            <a className="logo" href="/">
              <span className="logo_mark" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconLogoMeteor }} />Devin Alexander
            </a>
            <nav className="navbar_nav" aria-label="Primary">
              {navItems.map((item) => (
                <a key={item.href} className="nav_link" href={item.href}>{item.label}</a>
              ))}
            </nav>
            <div className="navbar_actions">
              <a className="button is-small navbar_cta" href="/quote">Instant quote <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconMoney }} /></a>
              {children}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import type { ReactNode } from 'react';

import { navItems } from '../config/nav';
import type { Avatar } from '../lib/avatar';

interface Props {
  avatar: Avatar;
  children?: ReactNode;
}

export default function Navbar({ avatar, children }: Props) {
  return (
    <header className="navbar is-composed" id="navbar">
      <div className="padding-global">
        <div className="container-large">
          <div className="navbar_inner">
            <span className="grain-overlay" aria-hidden="true"></span>
            <a className="logo" href="/">
              <img className="logo_avatar" src={avatar.src} srcSet={avatar.srcSet} alt="" width={36} height={36} />Devin Alexander
            </a>
            {navItems.length > 0 && (
              <nav className="navbar_nav" aria-label="Primary">
                {navItems.map((item) => (
                  <a key={item.href} className="nav_link" href={item.href}>{item.label}</a>
                ))}
              </nav>
            )}
            <div className="navbar_actions">
              {children}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

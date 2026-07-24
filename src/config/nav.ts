// ────────────────────────────────────────────────────────────────
// nav.ts — the one primary-nav list, shared by Navbar, MobileMenu,
// and Footer so the three components can never drift. The footer
// additionally renders Privacy/Terms links after these; those live
// in Footer.tsx, not here.
// ────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
];

// ────────────────────────────────────────────────────────────────
// MobileMenu.tsx — the one hydrated island owning the burger AND
// the full-page menu overlay. The burger renders in place (inside
// .navbar_actions, because Site.astro passes this island as
// Navbar's child); the overlay renders through
// createPortal(…, document.body) to keep its current top-level
// position — mounted un-portaled inside the sticky z-index:40
// navbar it would be trapped in the navbar's stacking context.
// Portals cannot SSR, so pre-hydration there is no overlay markup
// (accepted in the conversion plan — it is a hidden overlay).
//
// Behavior contract (matches the removed inline script exactly):
//   - .is-open is a CLASS toggle on .menu_overlay, never a
//     conditional mount — global.css keys the staggered .menu_item
//     entrance on it.
//   - open: body overflow locked, focus moves to the close button.
//   - close: overflow restored, focus returns to the burger.
//     Both also run on unmount via the effect cleanup.
//   - Escape closes while open; clicking any .menu_link closes.
// ────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

import { navItems } from '../config/nav';
import iconLogoMeteor from '../icons/freehand/logo-meteor.svg?raw';
import iconMenu from '../icons/freehand/menu.svg?raw';
import iconClose from '../icons/freehand/close.svg?raw';
import iconArrowRight from '../icons/freehand/arrow-right.svg?raw';

export default function MobileMenu() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Everything the open state owns: scroll lock, focus hand-off,
  // and the Escape listener. The cleanup runs on close AND on
  // unmount, so the body can never be left overflow-locked.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.body.style.overflow = '';
      burgerRef.current?.focus();
    };
  }, [open]);

  // Delegated close-on-navigate, same as the old inline script:
  // any click that lands on a .menu_link closes the overlay.
  const onOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.menu_link')) setOpen(false);
  };

  return (
    <>
      <button
        className="button is-secondary is-icon is-small navbar_burger"
        type="button"
        aria-label="Open the menu"
        aria-haspopup="dialog"
        ref={burgerRef}
        onClick={() => setOpen(true)}
      >
        <span className="icon" dangerouslySetInnerHTML={{ __html: iconMenu }} />
      </button>
      {mounted &&
        createPortal(
          <div
            className={open ? 'menu_overlay is-open' : 'menu_overlay'}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            onClick={onOverlayClick}
          >
            <div className="container-large">
              <div className="menu_head">
                <span className="logo"><span className="logo_mark" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconLogoMeteor }} />Devin Alexander</span>
                <button
                  className="button is-secondary is-icon"
                  type="button"
                  aria-label="Close the menu"
                  ref={closeRef}
                  onClick={() => setOpen(false)}
                >
                  <span className="icon" dangerouslySetInnerHTML={{ __html: iconClose }} />
                </button>
              </div>
              <ul className="menu_list">
                {navItems.map((item) => (
                  <li key={item.href} className="menu_item"><a className="menu_link" href={item.href}>{item.label}</a></li>
                ))}
              </ul>
              <div className="mt-xlarge">
                <a className="button" href="/quote">Get an instant quote <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconArrowRight }} /></a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

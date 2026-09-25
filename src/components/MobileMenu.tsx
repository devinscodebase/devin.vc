import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

import { navItems } from '../config/nav';
import type { Avatar } from '../lib/avatar';
import iconMenu from '../icons/freehand/menu.svg?raw';
import iconClose from '../icons/freehand/close.svg?raw';
import iconArrowRight from '../icons/freehand/arrow-right.svg?raw';

export default function MobileMenu({ avatar }: { avatar: Avatar }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                <span className="logo"><img className="logo_avatar" src={avatar.src} srcSet={avatar.srcSet} alt="" width={36} height={36} />Devin Alexander</span>
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
                <a className="button" href="/#waitlist">Join the waitlist <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconArrowRight }} /></a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

import { useEffect, useState } from 'react';

import iconThemeSun from '../icons/freehand/theme-sun.svg?raw';
import iconThemeMoon from '../icons/freehand/theme-moon.svg?raw';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'devin-vc-theme';

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = (event: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }
      if (stored === 'dark' || stored === 'light') return;
      const next: Theme = event.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      setTheme(next);
    };
    query.addEventListener('change', followSystem);
    return () => query.removeEventListener('change', followSystem);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;

    root.classList.add('is-theming');
    const release = () =>
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-theming')));
    const apply = () => {
      root.setAttribute('data-theme', next);
      setTheme(next);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduced) {
      document.startViewTransition(apply).finished.finally(release);
    } else {
      apply();
      release();
    }

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
    }
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
    >
      <span className="icon theme-toggle_moon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconThemeMoon }} />
      <span className="icon theme-toggle_sun" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconThemeSun }} />
    </button>
  );
}

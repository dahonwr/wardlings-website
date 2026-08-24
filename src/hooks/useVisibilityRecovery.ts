import { useEffect } from 'react';

/**
 * Lightweight Tab Visibility Handler.
 * Toggles a CSS helper class when the tab is backgrounded/active so that
 * continuous animations (like the gallery marquee) pause when hidden to save
 * GPU/CPU resources, and resume instantly upon returning without frozen frames
 * or forced layout reflows.
 */
export function useVisibilityRecovery(): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        document.body.classList.add('tab-hidden');
      } else {
        document.body.classList.remove('tab-hidden');
      }
    };

    if (document.visibilityState === 'hidden') {
      document.body.classList.add('tab-hidden');
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}

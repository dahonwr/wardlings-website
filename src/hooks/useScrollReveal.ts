import { useEffect } from 'react';

/**
 * Lightweight, zero-React-render Scroll Reveal System.
 *
 * Uses a single IntersectionObserver to watch elements with the `.reveal-on-scroll` class.
 * When an element enters the viewport:
 * 1. Adds `.is-revealed` class (triggering GPU-composited CSS opacity and translate3d transitions).
 * 2. Immediately unobserves the element (plays ONCE only, zero ongoing observation).
 *
 * Zero scroll listeners, zero per-frame React state updates, zero layout thrashing.
 */
export function useScrollReveal(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If IntersectionObserver is not supported or prefers reduced motion,
    // reveal everything immediately.
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.1
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
      elements.forEach((el) => observer.observe(el));
    };

    observeElements();

    // Catch any dynamically mounted elements without overhead
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

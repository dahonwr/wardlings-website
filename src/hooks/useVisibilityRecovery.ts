import { useEffect } from 'react';

// Belt-and-braces safety net, mounted once at the app root.
//
// The actual fix for the "animation freezes for several seconds after
// returning to the tab" bug was moving every looping/idle animation from
// Framer Motion `animate={...}` + `repeat: Infinity` to plain CSS
// `@keyframes` (see index.css) — CSS animation timelines are driven by the
// browser itself and keep advancing on wall-clock time even while the tab
// is hidden, so they're already in the right place the instant the tab is
// visible again, with nothing to "catch up".
//
// This hook exists as a defensive backstop for anything that isn't (yet)
// covered by that — e.g. a future decorative animation added the old way,
// or a third-party animation library that keeps its own internal clock.
// On visibilitychange -> visible, it forces a synchronous layout read
// (reflow) inside a double requestAnimationFrame, which is a well-known,
// harmless way to make the browser flush any animation/compositor state
// that was sitting stale from before the tab was backgrounded, instead of
// waiting for something else to eventually trigger that flush on its own.
export function useVisibilityRecovery(): void {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Reading offsetHeight forces a synchronous reflow, which is the
          // nudge — the returned value itself is unused.
          void document.body.offsetHeight;
        });
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}

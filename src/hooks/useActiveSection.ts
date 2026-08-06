import { useEffect, useState } from 'react';

// Tracks which section is currently most in-view using IntersectionObserver
// (cheap, compositor-driven) instead of a scroll listener doing getBoundingClientRect
// reads on every tick.
export function useActiveSection(sectionIds: string[], defaultId: string): string {
  const [activeId, setActiveId] = useState(defaultId);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.intersectionRatio);
        });

        let bestId = activeId;
        let bestRatio = 0;
        visibility.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestRatio > 0) {
          setActiveId(bestId);
        }
      },
      {
        // Treat the section as "active" once it occupies the vertical
        // center band of the viewport, accounting for the fixed navbar.
        rootMargin: '-100px 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join(',')]);

  return activeId;
}

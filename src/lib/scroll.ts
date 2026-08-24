// Clean, native-friendly scroll utilities used ONLY for explicit user-initiated clicks
// (navbar links, logo click, hero CTA buttons).
// Native browser scrolling (wheel, trackpad, touch swipe, keyboard, scrollbar)
// remains 100% native and is NEVER intercepted, prevented, or hijacked.

const NAV_OFFSET = 80;

export function scrollToY(targetY: number): void {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    window.scrollTo(0, targetY);
    return;
  }

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: 'smooth'
  });
}

export function scrollToId(id: string): void {
  if (typeof window === 'undefined') return;
  const section = document.getElementById(id);
  if (!section) return;

  const anchor = section.querySelector<HTMLElement>('[data-scroll-anchor]') ?? section;
  const targetY = anchor.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: 'smooth'
  });
}


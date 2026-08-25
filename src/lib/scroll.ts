// Responsive, native-friendly scroll utilities for user-initiated navigation
// (navbar links, logo click, hero CTA buttons, wallet checker transitions).
// Native browser scrolling (wheel, trackpad, touch swipe, keyboard, scrollbar)
// remains 100% native and is NEVER intercepted, prevented, or hijacked.

export function getHeaderHeight(): number {
  if (typeof document === 'undefined') return 72;
  const header = document.querySelector('header');
  if (header) {
    const rect = header.getBoundingClientRect();
    // Use the bottom coordinate if fixed/sticky at top, plus safety margin
    return Math.max(rect.bottom, rect.height) + 12;
  }
  return 72;
}

export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 800;
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  return window.innerHeight;
}

export function calculateCenteredScrollY(element: HTMLElement): number {
  const headerHeight = getHeaderHeight();
  const viewportHeight = getViewportHeight();
  const rect = element.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const elementHeight = rect.height;

  const availableSpace = viewportHeight - headerHeight;

  // If the element comfortably fits in the available space below header, center it
  if (elementHeight > 0 && elementHeight < availableSpace) {
    const centerOffset = (availableSpace - elementHeight) / 2;
    const targetY = absoluteTop - headerHeight - centerOffset;
    return Math.max(0, Math.round(targetY));
  } else {
    // If element is taller than available space, align top with comfortable header clearance
    const targetY = absoluteTop - headerHeight - 16;
    return Math.max(0, Math.round(targetY));
  }
}

export function scrollToY(targetY: number): void {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    window.scrollTo(0, Math.max(0, targetY));
    return;
  }

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: 'smooth'
  });
}

export function scrollToElement(element: HTMLElement | null): void {
  if (!element || typeof window === 'undefined') return;

  // Ensure any reveal-on-scroll animations are marked revealed so transforms don't distort coordinates
  if (element.classList.contains('reveal-on-scroll')) {
    element.classList.add('is-revealed');
  }
  element.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    el.classList.add('is-revealed');
  });

  const targetY = calculateCenteredScrollY(element);
  scrollToY(targetY);
}

export function scrollToId(id: string): void {
  if (typeof window === 'undefined') return;
  if (id === 'home' || id === 'top') {
    scrollToY(0);
    return;
  }

  const section = document.getElementById(id);
  if (!section) return;

  // Reveal elements in the target section immediately so transforms don't displace layout calculation
  section.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    el.classList.add('is-revealed');
  });

  const anchor = section.querySelector<HTMLElement>('[data-scroll-anchor]') ?? section;
  const targetY = calculateCenteredScrollY(anchor);
  scrollToY(targetY);
}



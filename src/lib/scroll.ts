// Responsive, native-friendly scroll utilities for user-initiated navigation
// (navbar links, logo click, hero CTA buttons, wallet checker transitions).
// Native browser scrolling (wheel, trackpad, touch swipe, keyboard, scrollbar)
// remains 100% native and is NEVER intercepted, prevented, or hijacked.

export function getHeaderHeight(): number {
  if (typeof document === 'undefined') return 72;
  // Prefer the persistent nav bar pill itself (marked with data-nav-bar).
  const navBar = document.querySelector('[data-nav-bar]');
  if (navBar) {
    const rect = navBar.getBoundingClientRect();
    if (rect.height > 0) {
      return Math.max(rect.bottom, rect.height + 12);
    }
  }
  const header = document.querySelector('header');
  if (header) {
    const rect = header.getBoundingClientRect();
    if (rect.height > 0) {
      return Math.max(rect.bottom, rect.height);
    }
  }
  return typeof window !== 'undefined' && window.innerWidth < 768 ? 64 : 76;
}

export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 800;
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  return window.innerHeight;
}

/**
 * Waits until an element's measured height and document position stabilize
 * before invoking the callback. Ensures we measure after DOM commits,
 * image dimension layout, and React/motion step transitions.
 */
export function waitForStableLayout(
  element: HTMLElement,
  callback: () => void
): void {
  if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
    callback();
    return;
  }

  const maxWait = 350;
  const requiredStableFrames = 3;
  const start = performance.now();
  let lastHeight = -1;
  let lastAbsoluteTop = -1;
  let stableFrames = 0;

  const check = () => {
    const rect = element.getBoundingClientRect();
    const currentScrollY = window.pageYOffset || window.scrollY || 0;
    const absoluteTop = rect.top + currentScrollY;
    const height = rect.height;

    // Check if height and absolute document position are stable (ignoring current viewport scroll offset)
    if (
      lastHeight > 0 &&
      Math.abs(height - lastHeight) < 1 &&
      Math.abs(absoluteTop - lastAbsoluteTop) < 1
    ) {
      stableFrames += 1;
    } else {
      stableFrames = 0;
      lastHeight = height;
      lastAbsoluteTop = absoluteTop;
    }

    if (stableFrames >= requiredStableFrames || performance.now() - start >= maxWait) {
      callback();
      return;
    }

    requestAnimationFrame(check);
  };

  requestAnimationFrame(check);
}

/**
 * Calculates the exact scroll destination Y coordinate for an element,
 * guaranteeing:
 * 1. The top of the element sits comfortably below the persistent sticky header (no overlap).
 * 2. If the element fits in the usable viewport below the header, it is visually centered.
 * 3. If the element is taller than the usable viewport, its top is aligned with a clean margin
 *    below the header so critical content (headings, inputs, graphics) is immediately visible
 *    without excessive blank space or top clipping.
 */
export function calculateTargetScrollY(element: HTMLElement): number {
  const headerHeight = getHeaderHeight();
  const viewportHeight = getViewportHeight();
  const usableHeight = Math.max(200, viewportHeight - headerHeight);

  const rect = element.getBoundingClientRect();
  const currentScrollY = window.pageYOffset || window.scrollY || 0;
  const absoluteTop = rect.top + currentScrollY;
  const elementHeight = rect.height;

  // Minimum breathing gap between the bottom of the sticky header and element top
  const minTopGap = typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 24;

  // If the element is taller than usable space or takes up most of it:
  // Align top cleanly below sticky header with minimum top gap
  if (elementHeight + minTopGap * 2 >= usableHeight) {
    const targetY = absoluteTop - headerHeight - minTopGap;
    return Math.max(0, Math.round(targetY));
  }

  // If element comfortably fits within the usable viewport:
  // Center it in the available space below the header, capped to avoid excessive empty space
  const idealCenterGap = (usableHeight - elementHeight) / 2;
  const maxTopGap = typeof window !== 'undefined' && window.innerWidth < 768 ? 48 : 72;
  const topGap = Math.min(Math.max(minTopGap, idealCenterGap), maxTopGap);

  const targetY = absoluteTop - headerHeight - topGap;
  return Math.max(0, Math.round(targetY));
}

export function scrollToY(targetY: number, onComplete?: () => void): void {
  if (typeof window === 'undefined') {
    onComplete?.();
    return;
  }

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const finalY = Math.max(0, Math.round(targetY));

  if (prefersReducedMotion) {
    window.scrollTo(0, finalY);
    onComplete?.();
    return;
  }

  window.scrollTo({
    top: finalY,
    behavior: 'smooth'
  });

  if (onComplete) {
    // Fire completion callback after natural smooth scroll duration (750ms)
    setTimeout(onComplete, 750);
  }
}

export function scrollToElement(
  element: HTMLElement | null,
  options?: { onComplete?: () => void }
): void {
  if (!element || typeof window === 'undefined') {
    options?.onComplete?.();
    return;
  }

  // Ensure any reveal-on-scroll elements in the target section are visible
  if (element.classList.contains('reveal-on-scroll')) {
    element.classList.add('is-revealed');
  }
  element.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    el.classList.add('is-revealed');
  });

  waitForStableLayout(element, () => {
    const targetY = calculateTargetScrollY(element);
    scrollToY(targetY, options?.onComplete);
  });
}

export function scrollToId(
  id: string,
  options?: { onComplete?: () => void }
): void {
  if (typeof window === 'undefined') {
    options?.onComplete?.();
    return;
  }

  if (id === 'home' || id === 'top' || !id) {
    scrollToY(0, options?.onComplete);
    return;
  }

  const section = document.getElementById(id);
  if (!section) {
    options?.onComplete?.();
    return;
  }

  // Reveal elements in the target section immediately
  section.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    el.classList.add('is-revealed');
  });

  const anchor = section.querySelector<HTMLElement>('[data-scroll-anchor]') ?? section;
  waitForStableLayout(anchor, () => {
    const targetY = calculateTargetScrollY(anchor);
    scrollToY(targetY, options?.onComplete);
  });
}





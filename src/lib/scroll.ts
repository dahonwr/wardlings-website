// Responsive, native-friendly scroll utilities for user-initiated navigation
// (navbar links, logo click, hero CTA buttons, wallet checker transitions).
// Native browser scrolling (wheel, trackpad, touch swipe, keyboard, scrollbar)
// remains 100% native and is NEVER intercepted, prevented, or hijacked.

export function getHeaderHeight(): number {
  if (typeof document === 'undefined') return 72;
  // Prefer the persistent nav bar pill itself (marked with data-nav-bar).
  // The <header> wrapper also contains the mobile dropdown menu, which is
  // only present while open/closing — measuring that instead would
  // overestimate the sticky header height right after a mobile nav tap
  // (the dropdown is still closing) and push destinations too far down.
  const navBar = document.querySelector('[data-nav-bar]');
  const header = navBar ?? document.querySelector('header');
  if (header) {
    const rect = header.getBoundingClientRect();
    // Use the bottom coordinate if fixed/sticky at top, plus safety margin
    return Math.max(rect.bottom, rect.height) + 12;
  }
  return 72;
}

/**
 * Waits until an element's measured height stops changing before invoking
 * the callback. Used before measuring scroll targets so we never compute a
 * position from mid-transition or not-yet-mounted layout (e.g. framer-motion
 * step swaps, images loading in, content that appears after a state change).
 *
 * Polls on animation frames (so it naturally tracks paint timing) and
 * resolves once the height holds steady for a few consecutive frames, or
 * after a max wait so navigation is never blocked indefinitely.
 */
function waitForStableLayout(element: HTMLElement, callback: () => void): void {
  if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
    callback();
    return;
  }

  const maxWait = 600;
  const requiredStableFrames = 3;
  const start = performance.now();
  let lastHeight = -1;
  let stableFrames = 0;

  const check = () => {
    const height = element.getBoundingClientRect().height;

    if (Math.abs(height - lastHeight) < 0.5) {
      stableFrames += 1;
    } else {
      stableFrames = 0;
      lastHeight = height;
    }

    if (stableFrames >= requiredStableFrames || performance.now() - start >= maxWait) {
      callback();
      return;
    }

    requestAnimationFrame(check);
  };

  requestAnimationFrame(check);
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

  // Wait for the target's layout to settle (mount, step transitions, image
  // loads, etc.) before measuring — never position from stale/mid-transition
  // layout, and never re-adjust after this single measurement.
  waitForStableLayout(element, () => {
    const targetY = calculateCenteredScrollY(element);
    scrollToY(targetY);
  });
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
  waitForStableLayout(anchor, () => {
    const targetY = calculateCenteredScrollY(anchor);
    scrollToY(targetY);
  });
}



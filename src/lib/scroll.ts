// Native-friendly smooth scroll used ONLY for nav-triggered clicks
// (logo click, nav links, CTA buttons). Wheel, trackpad, and touch scrolling
// remain 100% native and are never intercepted or prevented.

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let activeScrollFrame: number | null = null;

function handleKeyDown(e: KeyboardEvent): void {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
    cancelActiveScroll();
  }
}

function detachCancelListeners(): void {
  if (typeof window === 'undefined') return;
  window.removeEventListener('wheel', cancelActiveScroll);
  window.removeEventListener('touchstart', cancelActiveScroll);
  window.removeEventListener('keydown', handleKeyDown);
}

function attachCancelListeners(): void {
  if (typeof window === 'undefined') return;
  const passiveOpts: AddEventListenerOptions = { passive: true };
  window.addEventListener('wheel', cancelActiveScroll, passiveOpts);
  window.addEventListener('touchstart', cancelActiveScroll, passiveOpts);
  window.addEventListener('keydown', handleKeyDown, passiveOpts);
}

export function cancelActiveScroll(): void {
  if (activeScrollFrame !== null) {
    cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }
  detachCancelListeners();
}

export function scrollToY(targetY: number, duration = 650): void {
  cancelActiveScroll();

  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || Math.abs(distance) < 2) {
    window.scrollTo(0, targetY);
    return;
  }

  attachCancelListeners();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      activeScrollFrame = requestAnimationFrame(step);
    } else {
      activeScrollFrame = null;
      detachCancelListeners();
    }
  };

  activeScrollFrame = requestAnimationFrame(step);
}

// Fixed header height offset so scrolled-to sections aren't tucked under
// the floating navbar.
const NAV_OFFSET = 90;

export function scrollToId(id: string, duration = 650): void {
  const section = document.getElementById(id);
  if (!section) return;

  const anchor = section.querySelector<HTMLElement>('[data-scroll-anchor]') ?? section;
  const targetY = anchor.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  scrollToY(Math.max(targetY, 0), duration);
}

// Keeps a dynamically-resizing block (e.g. content that swaps from a short
// form to a much taller result) positioned sensibly in the viewport.
//
// Native scroll anchoring holds the *scroll position*, not the element's
// place in the viewport, steady when content above it changes size. When a
// block below the fold grows taller in place, the old scroll offset can
// land the viewport anywhere inside the new, taller content instead of at
// its top. This recalculates from the element's actual current position
// each time it's called, so it self-corrects regardless of scroll
// direction or how tall the content ends up being.
//
// Only scrolls if the element's heading/top edge isn't already sitting in
// a sensible spot just below the fixed header — so it won't fight the user
// or produce a jump when nothing meaningfully changed.
export function scrollElementIntoSmartView(el: HTMLElement | null, duration = 650): void {
  if (!el || typeof window === 'undefined') return;

  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const idealTop = NAV_OFFSET;

  // Tolerance band: if the element's top is already roughly under the
  // header (a little above is fine, a bit further down the fold is fine
  // too), leave the scroll position alone.
  const slackAbove = 16;
  const slackBelow = Math.max(viewportHeight * 0.3, 140);

  const alreadyWellPositioned =
    rect.top >= idealTop - slackAbove && rect.top <= idealTop + slackBelow;

  if (alreadyWellPositioned) return;

  const targetY = rect.top + window.scrollY - NAV_OFFSET;
  scrollToY(Math.max(targetY, 0), duration);
}

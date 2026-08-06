// Custom, dependency-free smooth scroll used for nav-triggered navigation
// (logo click, nav links, CTA buttons). Native `scrollIntoView` and CSS
// `scroll-behavior: smooth` give no control over duration/easing and, when
// combined, can fight each other mid-scroll. This runs a single
// requestAnimationFrame-driven tween instead, so wheel/trackpad scrolling
// (native, untouched) never competes with an in-flight nav scroll.

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let activeScrollFrame: number | null = null;

export function scrollToY(targetY: number, duration = 800): void {
  if (activeScrollFrame !== null) {
    cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || distance === 0) {
    window.scrollTo(0, targetY);
    return;
  }

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      activeScrollFrame = requestAnimationFrame(step);
    } else {
      activeScrollFrame = null;
    }
  };

  activeScrollFrame = requestAnimationFrame(step);
}

// Fixed header height offset so scrolled-to sections aren't tucked under
// the floating navbar.
const NAV_OFFSET = 90;

export function scrollToId(id: string, duration = 800): void {
  const section = document.getElementById(id);
  if (!section) return;
  // Some sections have large decorative top padding, and/or vertically
  // center their content against a taller sibling column — scrolling to
  // the section's own top edge in those cases just reveals that empty
  // space and pushes the real content (heading, and on the whitelist
  // card, its action buttons) below the fold, so the visitor has to
  // scroll again to see anything. If the section marks where its real
  // content starts with data-scroll-anchor, land there instead; only
  // fall back to the section's own top edge if it doesn't.
  const anchor = section.querySelector<HTMLElement>('[data-scroll-anchor]') ?? section;
  const targetY = anchor.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  scrollToY(Math.max(targetY, 0), duration);
}

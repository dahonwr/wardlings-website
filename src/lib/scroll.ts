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

// Authoritative full-page section scrolling engine
// Manages smooth, 1-gesture transitions between major sections,
// handling mouse wheel, trackpad momentum rejection, mobile touch swipes,
// keyboard navigation, and taller-than-viewport sections.

export const MAJOR_SECTION_IDS = ['home', 'about', 'collection', 'apply', 'footer'] as const;

export type MajorSectionId = (typeof MAJOR_SECTION_IDS)[number];

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let activeScrollFrame: number | null = null;
let isAnimating = false;
let unlockTimeoutId: ReturnType<typeof setTimeout> | null = null;
let lastWheelTime = 0;
let touchStartY = 0;
let touchStartX = 0;
let touchActive = false;

export function cancelActiveScroll(): void {
  if (activeScrollFrame !== null) {
    cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }
  if (unlockTimeoutId !== null) {
    clearTimeout(unlockTimeoutId);
    unlockTimeoutId = null;
  }
  isAnimating = false;
}

export function scrollToY(targetY: number, duration = 800, onComplete?: () => void): void {
  cancelActiveScroll();

  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || Math.abs(distance) < 2) {
    window.scrollTo(0, targetY);
    onComplete?.();
    return;
  }

  isAnimating = true;

  // Failsafe lock release so scrolling is NEVER stuck
  unlockTimeoutId = setTimeout(() => {
    isAnimating = false;
  }, duration + 150);

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      activeScrollFrame = requestAnimationFrame(step);
    } else {
      activeScrollFrame = null;
      if (unlockTimeoutId !== null) {
        clearTimeout(unlockTimeoutId);
        unlockTimeoutId = null;
      }
      setTimeout(() => {
        isAnimating = false;
        onComplete?.();
      }, 50);
    }
  };

  activeScrollFrame = requestAnimationFrame(step);
}

export function scrollToId(id: string, duration = 800, onComplete?: () => void): void {
  const section = document.getElementById(id);
  if (!section) return;

  const top = section.getBoundingClientRect().top + window.scrollY;
  scrollToY(Math.max(top, 0), duration, onComplete);
}

// Keeps a dynamically-resizing block (e.g. after checking wallet allocation)
// properly visible without jumping away or causing weird offsets.
export function scrollElementIntoSmartView(el: HTMLElement | null, duration = 800): void {
  if (!el || typeof window === 'undefined') return;

  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const idealTop = 90;

  const slackAbove = 20;
  const slackBelow = Math.max(viewportHeight * 0.3, 140);

  const alreadyWellPositioned =
    rect.top >= idealTop - slackAbove && rect.top <= idealTop + slackBelow;

  if (alreadyWellPositioned) return;

  const targetY = rect.top + window.scrollY - idealTop;
  scrollToY(Math.max(targetY, 0), duration);
}

interface SectionMetric {
  id: string;
  element: HTMLElement;
  top: number;
  height: number;
  bottom: number;
}

function getSectionMetrics() {
  const vh = window.innerHeight;
  const currentY = window.scrollY;

  const metrics: SectionMetric[] = [];

  for (const id of MAJOR_SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const top = rect.top + currentY;
    const height = Math.max(el.offsetHeight, vh);
    const bottom = top + height;
    metrics.push({ id, element: el, top, height, bottom });
  }

  if (metrics.length === 0) {
    return { metrics: [], activeIndex: -1, currentY, vh };
  }

  // Find active section based on current scroll position
  let activeIndex = 0;
  let maxVisibleHeight = -1;

  metrics.forEach((sec, idx) => {
    // Calculate overlap with viewport [currentY, currentY + vh]
    const visibleTop = Math.max(currentY, sec.top);
    const visibleBottom = Math.min(currentY + vh, sec.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    if (visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
      activeIndex = idx;
    }
  });

  return { metrics, activeIndex, currentY, vh };
}

function navigateNext(): void {
  const { metrics, activeIndex, currentY, vh } = getSectionMetrics();
  if (activeIndex === -1 || metrics.length === 0) return;

  const currentSection = metrics[activeIndex];

  // If section is taller than viewport + tolerance
  if (currentSection.height > vh + 40) {
    const maxScrollInThisSection = currentSection.bottom - vh;
    // If not yet reached the bottom of this tall section
    if (currentY < maxScrollInThisSection - 20) {
      const nextY = Math.min(currentY + vh * 0.75, maxScrollInThisSection);
      scrollToY(nextY, 700);
      return;
    }
  }

  // Go to next section
  if (activeIndex < metrics.length - 1) {
    const nextSection = metrics[activeIndex + 1];
    scrollToY(nextSection.top, 800);
  }
}

function navigatePrev(): void {
  const { metrics, activeIndex, currentY, vh } = getSectionMetrics();
  if (activeIndex === -1 || metrics.length === 0) return;

  const currentSection = metrics[activeIndex];

  // If section is taller than viewport + tolerance
  if (currentSection.height > vh + 40) {
    const minScrollInThisSection = currentSection.top;
    // If not yet at the top of this tall section
    if (currentY > minScrollInThisSection + 20) {
      const nextY = Math.max(currentY - vh * 0.75, minScrollInThisSection);
      scrollToY(nextY, 700);
      return;
    }
  }

  // Go to previous section
  if (activeIndex > 0) {
    const prevSection = metrics[activeIndex - 1];
    // If previous section is taller than viewport, scroll to its bottom
    if (prevSection.height > vh + 40) {
      scrollToY(prevSection.bottom - vh, 800);
    } else {
      scrollToY(prevSection.top, 800);
    }
  }
}

/**
 * Initializes full-page section scrolling.
 * Exactly ONE global controller attached once at app root.
 */
export function initFullPageSectionScroll(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onWheel = (e: WheelEvent) => {
    // If modal dialog is open or background scroll locked, allow modal internal scroll
    if (document.body.style.overflow === 'hidden' || document.querySelector('[role="dialog"]')) {
      return;
    }

    const now = performance.now();
    const deltaY = e.deltaY;
    const absDelta = Math.abs(deltaY);

    // Discard micro-noise
    if (absDelta < 6) return;

    const timeSinceLastWheel = now - lastWheelTime;
    lastWheelTime = now;

    // Prevent default partial jump
    e.preventDefault();

    // If currently animating transition, ignore further wheel events
    if (isAnimating) {
      return;
    }

    // Trackpad inertia filter: ignore decaying tails if firing rapidly under low delta
    if (absDelta < 18 && timeSinceLastWheel < 90) {
      return;
    }

    if (deltaY > 0) {
      navigateNext();
    } else {
      navigatePrev();
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    if (document.body.style.overflow === 'hidden' || document.querySelector('[role="dialog"]')) {
      touchActive = false;
      return;
    }
    if (e.touches.length !== 1) {
      touchActive = false;
      return;
    }
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchActive = true;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchActive || isAnimating) return;
    touchActive = false;

    if (e.changedTouches.length === 0) return;
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    const deltaX = touchStartX - e.changedTouches[0].clientX;
    const absDeltaY = Math.abs(deltaY);
    const absDeltaX = Math.abs(deltaX);

    // Require distinct vertical swipe of at least 40px
    if (absDeltaY >= 40 && absDeltaY > absDeltaX * 1.2) {
      if (deltaY > 0) {
        // Swiped UP -> Move to NEXT section
        navigateNext();
      } else {
        // Swiped DOWN -> Move to PREVIOUS section
        navigatePrev();
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
      return;
    }
    if (document.body.style.overflow === 'hidden' || document.querySelector('[role="dialog"]')) {
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      if (!isAnimating) navigateNext();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (!isAnimating) navigatePrev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToId('home', 800);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToId('footer', 800);
    }
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('keydown', onKeyDown);

  return () => {
    cancelActiveScroll();
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('keydown', onKeyDown);
  };
}

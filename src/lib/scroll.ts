// Responsive, native-friendly scroll utilities for user-initiated navigation
// (navbar links, logo click, hero CTA buttons).
// Native browser scrolling (wheel, trackpad, touch swipe, keyboard, scrollbar)
// remains 100% native and is NEVER intercepted, prevented, or hijacked.

export function getHeaderHeight(): number {
  if (typeof document === 'undefined') return 72;
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
    setTimeout(onComplete, 600);
  }
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

  const headerHeight = getHeaderHeight();
  const rect = section.getBoundingClientRect();
  const currentScrollY = window.pageYOffset || window.scrollY || 0;
  const topGap = typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 24;
  const targetY = Math.max(0, rect.top + currentScrollY - headerHeight - topGap);

  scrollToY(targetY, options?.onComplete);
}

export function scrollToElement(
  element: HTMLElement | null,
  options?: { onComplete?: () => void }
): void {
  if (!element || typeof window === 'undefined') {
    options?.onComplete?.();
    return;
  }

  const headerHeight = getHeaderHeight();
  const rect = element.getBoundingClientRect();
  const currentScrollY = window.pageYOffset || window.scrollY || 0;
  const topGap = typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 24;
  const targetY = Math.max(0, rect.top + currentScrollY - headerHeight - topGap);

  scrollToY(targetY, options?.onComplete);
}






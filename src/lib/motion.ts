// Shared scroll-reveal presets — playful "pop" motion instead of a plain
// linear fade/slide, to match the hand-drawn, bouncy visual language
// (cozy-card-hover already uses this same overshoot curve in index.css).
// Kept as Framer Motion `Variants` + `Transition` objects so every section
// animates in with the same cute, springy character.

import type { Variants, Transition } from 'motion/react';

// Smooth cubic-bezier curve for fast, stable 60 FPS transitions without spring overshoot
export const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Clean fade-up reveal (opacity + translateY only, no scale/rotation)
export const fadeUpPop: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 }
};

export const fadeUpPopTransition: Transition = {
  duration: 0.55,
  ease: SMOOTH_EASE
};

// Clean pop for interactive cards/dialogs without heavy spring bounce
export const popInPlayful: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  show: { opacity: 1, scale: 1, y: 0 }
};

export const popInPlayfulTransition: Transition = {
  duration: 0.25,
  ease: SMOOTH_EASE
};

export const staggerContainer = (staggerDelay = 0.08): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay
    }
  }
});

// Small badge reveal
export const badgePop: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

export const badgePopTransition: Transition = {
  duration: 0.4,
  ease: SMOOTH_EASE
};


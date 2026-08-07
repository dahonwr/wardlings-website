// Shared scroll-reveal presets — playful "pop" motion instead of a plain
// linear fade/slide, to match the hand-drawn, bouncy visual language
// (cozy-card-hover already uses this same overshoot curve in index.css).
// Kept as Framer Motion `Variants` + `Transition` objects so every section
// animates in with the same cute, springy character.

import type { Variants, Transition } from 'motion/react';

// Gentle back-ease with a little overshoot — settles past 100% then eases
// back, which reads as a soft "pop" rather than a mechanical slide-in.
export const POP_EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

// Text/content blocks: fades up with a light bounce. Subtle enough for
// headings and paragraphs (no distracting overshoot on things people read).
export const fadeUpPop: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 }
};

export const fadeUpPopTransition: Transition = {
  duration: 0.55,
  ease: POP_EASE
};

// Artwork/illustrations/cards: a bouncier scale+rotate "pop-in" — this is
// where the cute factor should read most, since it's the character art.
export const popInPlayful: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 30, rotate: -3 },
  show: { opacity: 1, scale: 1, y: 0, rotate: 0 }
};

export const popInPlayfulTransition: Transition = {
  duration: 0.7,
  ease: POP_EASE
};

// Wraps a set of children so they cascade in one after another instead of
// all appearing at once — the "cute cascading reveal" feel.
export const staggerContainer = (staggerDelay = 0.12): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay
    }
  }
});

// Small badges/pills: quick, snappy pop — reads like a little jump.
export const badgePop: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  show: { opacity: 1, scale: 1, y: 0 }
};

export const badgePopTransition: Transition = {
  duration: 0.45,
  ease: POP_EASE
};

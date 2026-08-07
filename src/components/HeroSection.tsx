import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass } from 'lucide-react';
import { fadeUpPop, fadeUpPopTransition, staggerContainer } from '../lib/motion';

interface HeroSectionProps {
  onOpenApply: () => void;
  onExploreClick: () => void;
}

const HERO_BACKGROUND_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Hero1.jpg';

const HeroSectionComponent: React.FC<HeroSectionProps> = ({
  onOpenApply,
  onExploreClick
}) => {
  return (
    <section
      id="home"
      // Height is tuned per device bucket so the tall illustration never
      // pushes content below the fold:
      //  - Mobile (base/sm):  ~100-110svh (svh avoids the iOS URL-bar jump)
      //  - Tablet (md):       ~70-80vh
      //  - Desktop (lg+):     unchanged — min-h-[90vh], exactly as before
      className="relative min-h-[100svh] max-h-[110svh] md:min-h-[75vh] md:max-h-none lg:min-h-[90vh] pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center overflow-hidden bg-[#FFFDF8]"
    >
      {/* Background Artwork Layer (z-index: 0)
          bg-cover = object-fit:cover equivalent (crops, never stretches).
          bg-position is the crop anchor per breakpoint (object-position
          equivalent), tuned so the main Wardling stays in frame:
            base (mobile portrait) -> center
            sm   (mobile landscape) -> right-bottom
            md   (tablet)          -> 85% center
            lg+  (desktop)         -> right-bottom (unchanged) */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center sm:bg-right-bottom md:bg-[85%_center] lg:bg-right-bottom pointer-events-none"
        style={{
          backgroundImage: `url("${HERO_BACKGROUND_URL}")`
        }}
      />

      {/* Semi-transparent White Gradient Overlay (z-index: 10) — lightened so
          more of the illustration reads through; left edge stays solid
          enough to keep the text legible. */}
      <div
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#FFFDF8]/70 via-[#FFFDF8]/30 sm:via-[#FFFDF8]/20 to-transparent"
      />

      {/* Hero Content (z-index: 20) */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20">
        {/* Content Column — badge/heading/tagline, paragraph, and buttons
            cascade in one after another on load instead of arriving as one
            flat block, for a cuter, more playful first impression. */}
        <motion.div
          variants={staggerContainer(0.14)}
          initial="hidden"
          animate="show"
          className="lg:col-span-8 flex flex-col items-start text-left space-y-5 sm:space-y-6"
        >
          <motion.div variants={fadeUpPop} transition={fadeUpPopTransition} className="space-y-2">
            <span className="font-patrick font-bold text-base sm:text-lg lg:text-xl text-[#2C241E] tracking-wide uppercase">
              Welcome to
            </span>
            <h1 className="font-dynapuff font-bold text-[42px] md:text-[56px] lg:text-[72px] leading-[1.05] tracking-tight text-[#4D7A39]">
              WARDLINGS
            </h1>
            <h2 className="font-dynapuff font-bold text-xl sm:text-2xl md:text-3xl text-[#241E1A] pt-1 sm:pt-2">
              Every forest has its keepers.
            </h2>
          </motion.div>

          <motion.p
            variants={fadeUpPop}
            transition={fadeUpPopTransition}
            className="font-nunito font-bold text-[16px] md:text-[17px] lg:text-[18px] text-[#241E1B] max-w-lg leading-relaxed"
          >
            A peaceful sanctuary where tiny forest spirits gather. Collect, protect, and grow alongside your Wardlings as you explore a magical world filled with wonder.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={fadeUpPop}
            transition={fadeUpPopTransition}
            className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 pt-2"
          >
            <motion.button
              onClick={onOpenApply}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ backgroundColor: '#5C8E47' }}
              className="w-full max-w-[340px] sm:w-auto font-dynapuff font-bold text-base sm:text-lg px-7 py-3.5 rounded-full text-white shadow-md hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200 shrink-0" />
              <span>Become a Keeper</span>
            </motion.button>

            <motion.button
              onClick={onExploreClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-[340px] sm:w-auto font-baloo font-bold text-base sm:text-lg px-6 py-3.5 rounded-full bg-white/90 text-[#34281F] border border-[#34281F]/15 shadow-sm hover:bg-white cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Compass className="w-5 h-5 text-[#4D7A39] shrink-0" />
              <span>Explore Collection</span>
            </motion.button>
          </motion.div>


        </motion.div>
      </div>
    </section>
  );
};

// Memoized: HeroSection's only props are two stable callback references
// from App (wrapped in useCallback), so this only ever needs to render once.
export const HeroSection = React.memo(HeroSectionComponent);

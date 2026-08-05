import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass } from 'lucide-react';

interface HeroSectionProps {
  onOpenApply: () => void;
  onExploreClick: () => void;
}

const HERO_BACKGROUND_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/hero%20background.jpg';

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenApply,
  onExploreClick
}) => {
  return (
    <section
      id="home"
      className="relative min-h-[85vh] md:min-h-[90vh] pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center overflow-hidden bg-[#FFFDF8]"
    >
      {/* Background Artwork Layer (z-index: 0) */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center sm:bg-right-bottom md:bg-[85%_center] lg:bg-right-bottom pointer-events-none"
        style={{
          backgroundImage: `url("${HERO_BACKGROUND_URL}")`
        }}
      />

      {/* Semi-transparent White Gradient Overlay (z-index: 10) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#FFFDF8] via-[#FFFDF8]/90 sm:via-[#FFFDF8]/75 to-[#FFFDF8]/20 sm:to-transparent"
      />

      {/* Hero Content (z-index: 20) */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20">
        {/* Content Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
          className="lg:col-span-8 flex flex-col items-start text-left space-y-5 sm:space-y-6"
        >
          <div className="space-y-2">
            <span className="font-patrick font-bold text-base sm:text-lg lg:text-xl text-[#2C241E] tracking-wide uppercase">
              Welcome to
            </span>
            <h1 className="font-dynapuff font-bold text-[42px] md:text-[56px] lg:text-[72px] leading-[1.05] tracking-tight text-[#4D7A39]">
              WARDLINGS
            </h1>
            <h2 className="font-dynapuff font-bold text-xl sm:text-2xl md:text-3xl text-[#241E1A] pt-1 sm:pt-2">
              Every forest has its keepers.
            </h2>
          </div>

          <p className="font-nunito font-bold text-[16px] md:text-[17px] lg:text-[18px] text-[#241E1B] max-w-lg leading-relaxed">
            A peaceful sanctuary where tiny forest spirits gather. Collect, protect, and grow alongside your Wardlings as you explore a magical world filled with wonder.
          </p>

          {/* Action Buttons */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 pt-2">
            <motion.button
              onClick={onOpenApply}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ backgroundColor: '#5C8E47' }}
              className="w-full max-w-[340px] sm:w-auto font-dynapuff font-bold text-base sm:text-lg px-7 py-3.5 rounded-full text-white shadow-md hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200 shrink-0" />
              <span>Become a Keeper</span>
            </motion.button>

            <motion.button
              onClick={onExploreClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full max-w-[340px] sm:w-auto font-baloo font-bold text-base sm:text-lg px-6 py-3.5 rounded-full bg-white/90 text-[#34281F] border border-[#34281F]/15 shadow-sm hover:bg-white cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Compass className="w-5 h-5 text-[#4D7A39] shrink-0" />
              <span>Explore Collection</span>
            </motion.button>
          </div>


        </motion.div>
      </div>
    </section>
  );
};

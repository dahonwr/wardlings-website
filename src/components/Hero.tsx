import React from 'react';
import { motion } from 'motion/react';

interface HeroProps {
  onJoinWhitelistClick: () => void;
  onExploreCollectionClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onJoinWhitelistClick,
  onExploreCollectionClick,
}) => {
  return (
    <section id="home" className="py-12 lg:py-20 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 lg:pr-4"
          >
            {/* Large Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2B241F] font-heading leading-[1.1]">
              Welcome to <br />
              <span className="text-[#5E7D3A]">Wardlings</span>
            </h1>

            {/* Paragraph */}
            <p className="text-lg sm:text-xl text-[#5C544B] leading-relaxed max-w-xl font-normal">
              A peaceful sanctuary where tiny spirits of nature come alive.
              Collect, protect, and grow alongside your Wardling companions on
              Ethereum.
            </p>

            {/* Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={onJoinWhitelistClick}
                className="bg-[#5E7D3A] hover:bg-[#4E6A2E] text-white px-8 py-4 rounded-full text-base font-bold shadow-xs transition-colors cursor-pointer text-center"
              >
                Join Whitelist
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={onExploreCollectionClick}
                className="bg-white hover:bg-[#FBF9F5] text-[#2B241F] hover:text-[#5E7D3A] border border-[#ECE7DF] px-8 py-4 rounded-full text-base font-bold shadow-2xs transition-colors cursor-pointer text-center"
              >
                Explore Collection
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column: Hero Illustration Image */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-6 flex justify-center lg:justify-end items-center"
          >
            <img
              src="https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Hero.png"
              alt="Wardlings Sanctuary Hero"
              className="w-full max-w-[600px] lg:max-w-[700px] h-auto object-contain pointer-events-none select-none"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};


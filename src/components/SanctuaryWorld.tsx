import React from 'react';
import { motion } from 'motion/react';

export const SanctuaryWorld: React.FC = () => {
  return (
    <section id="about" className="py-16 lg:py-24">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Copy & Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-4">
              {/* Small Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBF9F5] border border-[#ECE7DF] text-xs font-bold text-[#5E7D3A] tracking-wider uppercase">
                OUR WORLD
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2B241F] font-heading leading-tight">
                The Sanctuary is Waiting
              </h2>

              {/* Paragraphs */}
              <div className="space-y-3 text-base sm:text-lg text-[#5C544B] leading-relaxed">
                <p>
                  Every Wardling begins as a tiny spirit with its own personality.
                  Together they build a peaceful forest where every keeper belongs.
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#ECE7DF]">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#5E7D3A] font-heading">
                  4,444
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#5C544B]">
                  Wardlings
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#5E7D3A] font-heading">
                  150+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#5C544B]">
                  Unique Traits
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#2B241F] font-heading">
                  Ethereum
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#5C544B]">
                  Native Collection
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Sanctuary Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.42, delay: 0.08, ease: 'easeOut' }}
            className="lg:col-span-7 flex items-end justify-center lg:justify-end w-full h-full min-h-[420px] sm:min-h-[540px] lg:min-h-[640px]"
          >
            <img
              src="https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Keeper-sanctuary.png"
              alt="Keeper Sanctuary"
              loading="eager"
              decoding="async"
              className="w-full h-auto max-w-[950px] max-h-[750px] sm:max-h-[850px] lg:max-h-[950px] object-contain pointer-events-none select-none"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};


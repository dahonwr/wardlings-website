import React from 'react';
import { motion } from 'motion/react';

const SANCTUARY_IMAGE_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Keeper-sanctuary.png';

export const AboutSection: React.FC = () => {
  const stats = [
    {
      value: '4,444',
      label: 'Wardlings'
    },
    {
      value: 'Ethereum',
      label: 'Blockchain'
    }
  ];

  return (
    <section
      id="about"
      className="py-[72px] md:py-[96px] lg:py-[120px] px-4 sm:px-6 lg:px-12 relative z-10 w-full"
      style={{ backgroundColor: '#FFFDF8' }}
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column: Text & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
          className="md:col-span-6 flex flex-col items-start text-left"
        >
          {/* Small Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF7E8] text-[#4D7A39] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#4D7A39]/20 shadow-2xs mb-4 sm:mb-6">
            <span>🌿 OUR WORLD</span>
          </div>

          {/* Heading */}
          <h2 className="font-dynapuff font-bold text-[34px] md:text-[44px] lg:text-[56px] text-[#2F241D] tracking-tight leading-[1.12] mb-4 sm:mb-6">
            The Sanctuary Awaits
          </h2>

          {/* Body Paragraph */}
          <p className="font-nunito font-semibold text-[16px] md:text-[17px] lg:text-[18px] text-[#6A6158] leading-relaxed max-w-xl">
            Deep within the forest lies a peaceful sanctuary where tiny spirits protect nature, nurture magical plants, and welcome every new Keeper into their growing world.
          </p>

          {/* Thin Divider */}
          <div className="w-full my-6 sm:my-[36px] border-t border-[#E8E2D7]" />

          {/* Stats */}
          <div className="w-full flex flex-col sm:flex-row items-start justify-start gap-[20px] md:gap-[32px] lg:gap-[48px]">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-start min-w-0">
                <span className="font-dynapuff font-extrabold text-[#2F241D] tracking-tight text-[32px] sm:text-[36px] lg:text-[40px] leading-none">
                  {stat.value}
                </span>
                <span className="font-nunito font-semibold text-[#6A6158] text-[15px] sm:text-[16px] lg:text-[18px] mt-1.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Sanctuary Artwork */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
          className="md:col-span-6 flex items-center justify-center relative w-full pt-4 md:pt-0 overflow-visible"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.02 }}
            className="w-full max-w-[360px] sm:max-w-[460px] lg:max-w-[560px] flex items-center justify-center cursor-pointer transition-transform duration-300"
          >
            {/* Tablet-only: illustration scaled up ~35% (transform-based, so it
                doesn't affect layout, spacing, cropping, or stretching) */}
            <img
              src={SANCTUARY_IMAGE_URL}
              alt="The Sanctuary Awaits"
              className="w-full h-auto object-contain max-h-[420px] lg:max-h-[560px] mx-auto md:scale-[1.35] lg:scale-100 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

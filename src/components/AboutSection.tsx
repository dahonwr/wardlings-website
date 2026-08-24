import React from 'react';
import { motion } from 'motion/react';
import { fadeUpPop, fadeUpPopTransition, popInPlayful, popInPlayfulTransition, badgePop, badgePopTransition, staggerContainer } from '../lib/motion';

const SANCTUARY_IMAGE_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Sanctuary1.jpg';

const AboutSectionComponent: React.FC = () => {
  const stats = [
    {
      value: '4,444',
      label: 'Wardlings'
    },
    {
      value: 'Robinhood Chain',
      label: 'Blockchain'
    }
  ];

  return (
    <section
      id="about"
      className="py-[72px] md:py-[96px] lg:py-[120px] px-4 sm:px-6 lg:px-12 relative z-10 w-full"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column: Text & Stats.
            data-scroll-anchor: this column sits inside a grid with
            items-center, so it's vertically centered against the taller
            illustration on the right — its rendered top edge already
            sits well below the section's own padding. Marking it as the
            nav-scroll target (instead of the outer <section>) means
            clicking "Sanctuary" lands right on this heading rather than
            on a stretch of empty space above it.
            Each child below cascades in on its own (staggerChildren)
            instead of the whole block appearing at once — a cuter,
            more playful reveal than a single flat fade. */}
        <motion.div
          data-scroll-anchor
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '0px 0px -35% 0px' }}
          className="lg:col-span-6 flex flex-col items-start text-left relative z-20"
        >
          {/* Small Badge — quick snappy pop */}
          <motion.div
            variants={badgePop}
            transition={badgePopTransition}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF7E8] text-[#4D7A39] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#4D7A39]/20 shadow-2xs mb-4 sm:mb-6"
          >
            <span>🌿 OUR WORLD</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={fadeUpPop}
            transition={fadeUpPopTransition}
            className="font-dynapuff font-bold text-[34px] md:text-[44px] lg:text-[56px] text-[#2F241D] tracking-tight leading-[1.12] mb-4 sm:mb-6"
          >
            The Sanctuary Awaits
          </motion.h2>

          {/* Body Paragraph */}
          <motion.p
            variants={fadeUpPop}
            transition={fadeUpPopTransition}
            className="font-nunito font-semibold text-[16px] md:text-[17px] lg:text-[18px] text-[#6A6158] leading-relaxed max-w-xl"
          >
            Deep within the forest lies a peaceful sanctuary where tiny spirits protect nature, nurture magical plants, and welcome every new Keeper into their growing world.
          </motion.p>

          {/* Thin Divider */}
          <motion.div
            variants={fadeUpPop}
            transition={fadeUpPopTransition}
            className="w-full my-6 sm:my-[36px] border-t border-[#E8E2D7]"
          />

          {/* Stats — pop in one after another */}
          <motion.div
            variants={staggerContainer(0.1)}
            className="w-full flex flex-col sm:flex-row items-start justify-start gap-[20px] md:gap-[32px] lg:gap-[48px]"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={badgePop}
                transition={badgePopTransition}
                className="flex flex-col items-start min-w-0"
              >
                <span className="font-dynapuff font-extrabold text-[#2F241D] tracking-tight text-[26px] sm:text-[32px] lg:text-[38px] leading-tight">
                  {stat.value}
                </span>
                <span className="font-nunito font-semibold text-[#6A6158] text-[15px] sm:text-[16px] lg:text-[18px] mt-1.5">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Sanctuary Artwork — bouncier pop-in with a tiny
            settle-wobble (scale + slight rotate that eases past 0deg),
            since this is the character art and should read the most cute.
            `hidden lg:flex`: on tablet/mobile the illustration is removed
            from layout entirely (not just visually hidden) so it takes up
            zero space and the text column above naturally uses the full
            row width — desktop (lg+) is unaffected, same size/position as
            before. */}
        <motion.div
          variants={popInPlayful}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          transition={{ ...popInPlayfulTransition, delay: 0.15 }}
          className="hidden lg:flex lg:col-span-6 items-center justify-center relative z-0 w-full overflow-visible"
        >
          {/* Two nested layers on purpose: the outer layer owns the CSS
              breathing-float animation (animate-breathe-float, ~3px,
              GPU-composited) and the inner layer owns the Framer Motion
              hover-scale. Both animate `transform`, and a running CSS
              animation always wins the cascade over an inline style on the
              *same* element — nesting them keeps the two independent so
              the float never cancels the hover response. */}
          <div className="animate-breathe-float w-full max-w-[360px] sm:max-w-[460px] lg:max-w-[560px] flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full flex items-center justify-center cursor-pointer"
            >
              {/* md:scale-[1.35] is inert now that this block only renders
                  at lg+ (its own lg:scale-100 already overrides it there,
                  exactly as before) — left in place untouched since it
                  doesn't affect anything and this section's image styling
                  wasn't meant to change. */}
              <img
                src={SANCTUARY_IMAGE_URL}
                alt="The Sanctuary Awaits"
                loading="eager"
                decoding="async"
                className="w-full h-auto object-contain max-h-[420px] lg:max-h-[560px] mx-auto md:scale-[1.35] lg:scale-100 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export const AboutSection = React.memo(AboutSectionComponent);

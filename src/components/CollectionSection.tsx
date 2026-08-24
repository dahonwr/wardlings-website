import React from 'react';
import { motion } from 'motion/react';
import { fadeUpPop, fadeUpPopTransition, popInPlayfulTransition, staggerContainer } from '../lib/motion';

const AVATAR1_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Common.jpg';
const AVATAR2_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Uncommon.jpg';
const AVATAR3_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Epic.jpg';
const AVATAR4_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Legendary.jpg';

interface RarityCard {
  rarity: 'Common' | 'Uncommon' | 'Epic' | 'Legendary';
  image: string;
  badgeBg: string;
  badgeText: string;
}

const baseCards: RarityCard[] = [
  {
    rarity: 'Common',
    image: AVATAR1_URL,
    badgeBg: '#EEF7E8',
    badgeText: '#4D7A39'
  },
  {
    rarity: 'Uncommon',
    image: AVATAR2_URL,
    badgeBg: '#E6F0FA',
    badgeText: '#2B6CB0'
  },
  {
    rarity: 'Epic',
    image: AVATAR3_URL,
    badgeBg: '#F4E8FA',
    badgeText: '#805AD5'
  },
  {
    rarity: 'Legendary',
    image: AVATAR4_URL,
    badgeBg: '#FEF3E2',
    badgeText: '#DD6B20'
  }
];

// Duplicate items multiple times to create an infinite seamless track
const galleryItems = [...baseCards, ...baseCards, ...baseCards, ...baseCards];

const CollectionSectionComponent: React.FC = () => {
  return (
    <section id="collection" className="min-h-[100svh] py-16 md:py-20 relative z-10 w-full overflow-hidden select-none bg-[#FFFDF8] flex flex-col justify-center items-center">
      {/* Header. data-scroll-anchor: lands the "Collection" nav click
          right on this heading instead of on the section's 72-120px of
          top padding. Heading and subheading cascade in one after
          another for a cuter, less flat reveal. */}
      <motion.div
        data-scroll-anchor
        variants={staggerContainer(0.15)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -35% 0px' }}
        className="text-center max-w-xl mx-auto mb-10 md:mb-12 px-4 sm:px-6"
      >
        <motion.h2
          variants={fadeUpPop}
          transition={fadeUpPopTransition}
          className="font-dynapuff font-bold text-[34px] md:text-[44px] lg:text-[56px] text-[#2F241D] tracking-tight leading-[1.15]"
        >
          Gallery
        </motion.h2>
        <motion.p
          variants={fadeUpPop}
          transition={fadeUpPopTransition}
          className="font-nunito font-semibold text-[16px] md:text-[17px] lg:text-[18px] text-[#6A6158] mt-2 sm:mt-3"
        >
          Discover handcrafted Wardlings from across the Sanctuary.
        </motion.p>
      </motion.div>

      {/* Infinite Horizontal Carousel Track (Right to Left).
          The scroll itself is a pure CSS animation (.animate-marquee, see
          index.css) instead of a Framer Motion-driven loop, so it runs on
          the compositor thread with zero per-frame JS cost, and pauses
          cleanly on hover via `marquee-track:hover` — satisfying "pause
          auto-scroll while hovering" without tearing the animation down.
          The track itself now pops in with a little bounce/scale instead
          of a flat fade, to match the cascading header above it. */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ ...popInPlayfulTransition, delay: 0.15 }}
        className="marquee-track w-full overflow-hidden"
      >
        <div className="animate-marquee flex gap-6 w-max px-3">
          {galleryItems.map((card, idx) => (
            <div
              key={idx}
              className="group w-64 sm:w-72 shrink-0 p-4 rounded-3xl bg-[#FFFDF8] border-2 border-[#2F241D]/10 shadow-md hover:shadow-xl hover:-translate-y-2 flex flex-col items-center cursor-pointer transition-all duration-300 ease-out"
            >
              {/* Image Centered */}
              <div className="w-full aspect-square rounded-2xl bg-[#FFF8F0] overflow-hidden flex items-center justify-center p-3 mb-4 border border-[#2F241D]/5">
                <img
                  src={card.image}
                  alt={`${card.rarity} Wardling`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = AVATAR1_URL;
                  }}
                />
              </div>

              {/* Rarity Badge on Bottom */}
              <div
                className="font-patrick font-bold text-xs sm:text-sm px-4 py-1 rounded-full tracking-wide uppercase border border-[#2F241D]/10 shadow-2xs"
                style={{
                  backgroundColor: card.badgeBg,
                  color: card.badgeText
                }}
              >
                {card.rarity}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export const CollectionSection = React.memo(CollectionSectionComponent);

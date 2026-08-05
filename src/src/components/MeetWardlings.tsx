import React from 'react';
import { motion } from 'motion/react';
import { WardlingCharacter } from '../types';
import { WARDLING_CHARACTERS } from '../data/wardlings';
import { Sparkles } from 'lucide-react';

interface MeetWardlingsProps {
  onSelectCharacter?: (character: WardlingCharacter) => void;
}

const RARITY_CARDS = [
  {
    rarity: 'COMMON',
    imageSrc: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Common.png',
    character: {
      ...WARDLING_CHARACTERS[0],
      rarityTier: 'COMMON',
      name: 'Common Wardling',
    },
  },
  {
    rarity: 'UNCOMMON',
    imageSrc: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Uncommon.png',
    character: {
      ...WARDLING_CHARACTERS[1],
      rarityTier: 'UNCOMMON',
      name: 'Uncommon Wardling',
    },
  },
  {
    rarity: 'EPIC',
    imageSrc: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Epic.png',
    character: {
      ...WARDLING_CHARACTERS[3],
      rarityTier: 'EPIC',
      name: 'Epic Wardling',
    },
  },
  {
    rarity: 'LEGENDARY',
    imageSrc: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Legendary.png',
    character: {
      ...WARDLING_CHARACTERS[2],
      rarityTier: 'LEGENDARY',
      name: 'Legendary Wardling',
    },
  },
];

// Duplicate cards 3 times for seamless infinite marquee loop
const MARQUEE_CARDS = [...RARITY_CARDS, ...RARITY_CARDS, ...RARITY_CARDS];

export const MeetWardlings: React.FC<MeetWardlingsProps> = React.memo(() => {
  return (
    <section id="collection" className="py-16 lg:py-24 bg-[#FBF9F5]/50 border-y border-[#ECE7DF] overflow-hidden contain-paint">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Fade Up */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "200px" }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto space-y-4 mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#ECE7DF] text-xs font-bold text-[#5E7D3A] tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#5E7D3A]" />
            MEET OUR COMPANIONS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2B241F] font-heading">
            Meet the Wardlings
          </h2>
          <p className="text-base sm:text-lg text-[#5C544B] leading-relaxed">
            Every Wardling has its own personality, appearance and story.
          </p>
        </motion.div>

        {/* Collection Cards Track */}
        <div className="overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex w-max lg:w-auto lg:grid lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-6 animate-wardlings-marquee transform-gpu select-none">
            {MARQUEE_CARDS.map((item, index) => {
              const isDuplicate = index >= RARITY_CARDS.length;

              return (
                <div
                  key={`${item.rarity}-${index}`}
                  aria-hidden={isDuplicate ? 'true' : undefined}
                  className={`w-[260px] sm:w-[300px] lg:w-auto shrink-0 bg-white rounded-[28px] p-5 border border-[#ECE7DF] wardling-card-shadow flex flex-col justify-between group transform-gpu transition-transform duration-300 hover:-translate-y-1 ${
                    isDuplicate ? 'lg:hidden' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Character Image */}
                    <div className="overflow-hidden rounded-[20px] bg-[#FBF9F5] aspect-square flex items-center justify-center p-2">
                      <img
                        src={item.imageSrc}
                        alt={`${item.rarity} Wardling`}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-contain pointer-events-none select-none"
                      />
                    </div>

                    {/* Centered Rarity Label */}
                    <div className="pt-2 pb-1 text-center">
                      <h3 className="text-2xl font-bold text-[#2B241F] font-heading group-hover:text-[#5E7D3A] transition-colors duration-300">
                        {item.rarity}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});


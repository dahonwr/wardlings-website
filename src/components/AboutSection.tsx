import React from 'react';
import { Leaf, Sprout, Flower2 } from 'lucide-react';

const AboutSectionComponent: React.FC = () => {
  const lore = [
    'Deep within an untouched forest lies a hidden sanctuary where small forest spirits have gathered for generations.',
    'The Wardlings protect the grove, care for its living things, and help the sanctuary grow with every new keeper who finds their way inside.',
    'Some are gardeners. Some are explorers. Some simply wander in looking for a quiet place to belong. No two Wardlings are quite the same, but every one of them has a story waiting to grow.'
  ];

  const stats = [
    {
      value: '4,444',
      label: 'Wardlings'
    },
    {
      value: '150+',
      label: 'Traits'
    },
    {
      value: 'Robinhood Chain',
      label: 'Blockchain'
    },
    {
      value: 'OpenSea',
      label: 'Launchpad'
    }
  ];

  return (
    <section
      id="about"
      className="py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 lg:px-12 relative z-10 w-full overflow-hidden bg-white"
    >
      {/* Subtle organic decoration */}
      <Leaf
        aria-hidden="true"
        className="hidden sm:block absolute top-10 right-6 lg:right-16 w-8 h-8 text-[#7EBE69]/25 rotate-12 pointer-events-none"
      />
      <Sprout
        aria-hidden="true"
        className="hidden sm:block absolute bottom-16 right-16 lg:right-32 w-6 h-6 text-[#7EBE69]/20 -rotate-6 pointer-events-none"
      />
      <Flower2
        aria-hidden="true"
        className="hidden sm:block absolute bottom-8 left-6 lg:left-16 w-6 h-6 text-[#F7BFD5]/30 rotate-6 pointer-events-none"
      />

      <div
        data-scroll-anchor
        className="max-w-3xl mx-auto flex flex-col items-start text-left relative z-20"
      >
        {/* Reveal Element 1: Badge + Heading */}
        <div className="reveal-on-scroll">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF7E8] text-[#4D7A39] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#4D7A39]/20 shadow-2xs mb-4 sm:mb-6">
            <span>🌿 OUR WORLD</span>
          </div>

          <h2 className="font-dynapuff font-bold text-[34px] md:text-[44px] lg:text-[56px] text-[#2F241D] tracking-tight leading-[1.12] mb-5 sm:mb-7">
            A Sanctuary Hidden in the Wild
          </h2>
        </div>

        {/* Reveal Element 2: Lore (50-80ms delay) */}
        <div className="reveal-on-scroll reveal-delay-1 flex flex-col gap-4 sm:gap-5 max-w-2xl">
          {lore.map((paragraph, idx) => (
            <p
              key={idx}
              className="font-nunito font-semibold text-[16px] md:text-[17px] lg:text-[18px] text-[#6A6158] leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Reveal Element 3: Divider & Project Stats (additional delay) */}
        <div className="reveal-on-scroll reveal-delay-2 w-full">
          <div className="w-full my-7 sm:my-[40px] border-t border-[#E8E2D7]" />

          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-7 sm:gap-x-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-start min-w-0"
              >
                <span className="font-dynapuff font-extrabold text-[#2F241D] tracking-tight text-[22px] sm:text-[28px] lg:text-[32px] leading-tight">
                  {stat.value}
                </span>
                <span className="font-nunito font-semibold text-[#6A6158] text-[14px] sm:text-[15px] lg:text-[16px] mt-1.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const AboutSection = React.memo(AboutSectionComponent);

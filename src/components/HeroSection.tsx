import React from 'react';
import { Sparkles, Compass } from 'lucide-react';

interface HeroSectionProps {
  onOpenApply: () => void;
  onExploreClick: () => void;
}

const HERO_PC_URL = 'https://res.cloudinary.com/lgrhe1nm/image/upload/v1787814197/Pc.webp';
const HERO_MOBILE_URL = 'https://res.cloudinary.com/lgrhe1nm/image/upload/v1787814197/Mobile.webp';

const HeroSectionComponent: React.FC<HeroSectionProps> = ({
  onOpenApply,
  onExploreClick
}) => {
  return (
    <section
      id="home"
      className="relative min-h-[100svh] lg:min-h-screen lg:max-h-[1050px] pt-20 sm:pt-24 md:pt-28 lg:pt-0 pb-10 sm:pb-12 lg:pb-0 px-4 sm:px-6 md:px-12 flex flex-col justify-start lg:justify-center items-center overflow-hidden bg-[#FFFDF8]"
    >
      {/* Desktop Background Artwork Layer (z-index: 0) — shown on lg+ screens */}
      <img
        src={HERO_PC_URL}
        alt="The Sanctuary — Wardlings in the magical forest"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="hidden lg:block absolute inset-0 w-full h-full object-cover object-right z-0 pointer-events-none select-none"
      />

      {/* Mobile/Tablet Background Artwork Layer (z-index: 0) — shown below lg screens */}
      <img
        src={HERO_MOBILE_URL}
        alt="The Sanctuary — Wardlings in the magical forest"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="block lg:hidden absolute inset-0 w-full h-full object-cover object-bottom z-0 pointer-events-none select-none"
      />

      {/* Mobile Readability Gradient (z-index: 10) — soft blend ensuring typography clarity on mobile */}
      <div
        className="block lg:hidden absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,253,248,0.82) 0%, rgba(255,253,248,0.48) 30%, rgba(255,253,248,0.1) 48%, rgba(255,253,248,0) 65%)'
        }}
      />

      {/* Hero Content (z-index: 20) */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20">
        {/* Content Column positioned cleanly on the left, comfortably elevated in the sky space */}
        <div className="lg:col-span-6 xl:col-span-5 lg:pl-4 xl:pl-8 lg:-translate-y-8 xl:-translate-y-12 flex flex-col items-start text-left space-y-3 sm:space-y-5 lg:space-y-6">
          {/* Header */}
          <div className="space-y-1 sm:space-y-2">
            <span className="font-patrick font-bold text-sm sm:text-base lg:text-xl text-[#2C241E] tracking-wide uppercase">
              Welcome to
            </span>
            <h1 className="font-dynapuff font-bold text-[34px] xs:text-[40px] sm:text-[48px] md:text-[56px] lg:text-[72px] leading-[1.05] tracking-tight text-[#4D7A39]">
              WARDLINGS
            </h1>
            <h2 className="font-dynapuff font-bold text-base sm:text-xl md:text-2xl lg:text-3xl text-[#241E1A] pt-0.5 sm:pt-1">
              Every forest has its keepers.
            </h2>
          </div>

          {/* Paragraph */}
          <p className="font-nunito font-bold text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-[#241E1B] max-w-sm sm:max-w-md lg:max-w-lg leading-snug sm:leading-relaxed">
            A peaceful sanctuary where tiny forest spirits gather. Collect, protect, and grow alongside your Wardlings as you explore a magical world filled with wonder.
          </p>

          {/* Action Buttons */}
          <div className="w-full sm:w-auto flex flex-row items-center justify-start gap-2.5 sm:gap-4 pt-1 sm:pt-2">
            <button
              onClick={onOpenApply}
              style={{ backgroundColor: '#5C8E47' }}
              className="flex-1 sm:flex-initial font-dynapuff font-bold text-sm sm:text-base lg:text-lg px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-white shadow-md hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98] whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 sm:w-5 h-5 text-yellow-200 fill-yellow-200 shrink-0" />
              <span>Find Your Place</span>
            </button>

            <button
              onClick={onExploreClick}
              className="flex-1 sm:flex-initial font-baloo font-bold text-sm sm:text-base lg:text-lg px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white/90 text-[#34281F] border border-[#34281F]/15 shadow-sm hover:bg-white cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98] whitespace-nowrap"
            >
              <Compass className="w-4 h-4 sm:w-5 h-5 text-[#4D7A39] shrink-0" />
              <span>Explore Collection</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const HeroSection = React.memo(HeroSectionComponent);


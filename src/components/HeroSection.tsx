import React from 'react';
import { Sparkles, Compass } from 'lucide-react';

interface HeroSectionProps {
  onOpenApply: () => void;
  onExploreClick: () => void;
}

const HERO_BACKGROUND_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/IMG_20260824_220449.png';

const HeroSectionComponent: React.FC<HeroSectionProps> = ({
  onOpenApply,
  onExploreClick
}) => {
  return (
    <section
      id="home"
      className="relative min-h-[85vh] lg:min-h-[90vh] pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center overflow-hidden bg-[#FFFDF8]"
    >
      {/* Background Artwork Layer (z-index: 0) */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center sm:bg-right-bottom md:bg-[85%_center] lg:bg-right-bottom pointer-events-none animate-hero-breathe"
        style={{
          backgroundImage: `url("${HERO_BACKGROUND_URL}")`
        }}
      />

      {/* Semi-transparent White Gradient Overlay (z-index: 10) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#FFFDF8]/70 via-[#FFFDF8]/30 sm:via-[#FFFDF8]/20 to-transparent"
      />

      {/* Hero Content (z-index: 20) */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20">
        {/* Content Column (max 3 reveal elements) */}
        <div className="lg:col-span-8 flex flex-col items-start text-left space-y-5 sm:space-y-6">
          {/* Reveal Element 1: Header */}
          <div className="reveal-on-scroll space-y-2">
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

          {/* Reveal Element 2: Paragraph (50-80ms delay) */}
          <p className="reveal-on-scroll reveal-delay-1 font-nunito font-bold text-[16px] md:text-[17px] lg:text-[18px] text-[#241E1B] max-w-lg leading-relaxed">
            A peaceful sanctuary where tiny forest spirits gather. Collect, protect, and grow alongside your Wardlings as you explore a magical world filled with wonder.
          </p>

          {/* Reveal Element 3: Action Buttons (additional delay) */}
          <div className="reveal-on-scroll reveal-delay-2 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 pt-2">
            <button
              onClick={onOpenApply}
              style={{ backgroundColor: '#5C8E47' }}
              className="w-full max-w-[340px] sm:w-auto font-dynapuff font-bold text-base sm:text-lg px-7 py-3.5 rounded-full text-white shadow-md hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center gap-2 transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200 shrink-0" />
              <span>Find Your Place</span>
            </button>

            <button
              onClick={onExploreClick}
              className="w-full max-w-[340px] sm:w-auto font-baloo font-bold text-base sm:text-lg px-6 py-3.5 rounded-full bg-white/90 text-[#34281F] border border-[#34281F]/15 shadow-sm hover:bg-white cursor-pointer flex items-center justify-center gap-2 transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98]"
            >
              <Compass className="w-5 h-5 text-[#4D7A39] shrink-0" />
              <span>Explore Collection</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Memoized: HeroSection's only props are two stable callback references
// from App (wrapped in useCallback), so this only ever needs to render once.
export const HeroSection = React.memo(HeroSectionComponent);

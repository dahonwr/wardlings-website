import React from 'react';
import { Sparkles, Compass } from 'lucide-react';

interface HeroSectionProps {
  onOpenApply: () => void;
  onExploreClick: () => void;
}

const HERO_BACKGROUND_URL = '/assets/hero-pc.jpg';
const HERO_MOBILE_URL = '/assets/hero-mobile.jpg';

const HeroSectionComponent: React.FC<HeroSectionProps> = ({
  onOpenApply,
  onExploreClick
}) => {
  return (
    <section
      id="home"
      className="relative min-h-0 lg:min-h-[90vh] pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 md:px-12 flex flex-col justify-start lg:justify-center items-center overflow-hidden bg-[#FFFDF8]"
    >
      {/* Desktop/Tablet Background Artwork Layer (z-index: 0) — hidden below lg, where the
          dedicated mobile hero image (below) is used instead.
          Rendered as a plain <img> (not a bg-cover div) sized by WIDTH ONLY and anchored
          bottom-right, so the whole illustration always stays intact and confined to the
          right side of the section — it can never crop into the characters or drift left
          into the text column the way bg-cover's height-based scaling could. The width
          grows at wider breakpoints, where there's naturally more room before the text. */}
      <img
        src={HERO_BACKGROUND_URL}
        alt="The Sanctuary — three Wardlings approaching a glowing ruined gate"
        className="hidden lg:block absolute right-0 bottom-0 z-0 h-auto max-w-none w-[40%] xl:w-[52%] 2xl:w-[60%] pointer-events-none select-none animate-hero-breathe"
      />

      {/* Readability Gradient (z-index: 10) — desktop/tablet only. Solid cream behind the
          text column, then a soft fade into the artwork; kept subtle (never a solid block)
          so it reads as one continuous illustrated scene rather than a text card. */}
      <div
        className="hidden lg:block absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, #FFFDF8 0%, #FFFDF8 34%, rgba(255,253,248,0.55) 45%, rgba(255,253,248,0) 58%)'
        }}
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

      {/* Mobile/Tablet Hero Artwork — same hero section as the typography above, not a
          separate block: bleeds edge-to-edge and sits close beneath the CTAs so the
          whole thing reads as one continuous illustrated scene. Shown only below the
          lg breakpoint where the desktop background layer above is hidden. */}
      <div className="lg:hidden relative z-20 w-full -mx-4 sm:-mx-6 mt-4 sm:mt-5">
        <img
          src={HERO_MOBILE_URL}
          alt="Three Wardlings — a box-headed forest spirit, a hooded archer, and a robed keeper — standing before a glowing ruined gate"
          className="w-full h-auto block animate-hero-breathe"
        />
      </div>
    </section>
  );
};

// Memoized: HeroSection's only props are two stable callback references
// from App (wrapped in useCallback), so this only ever needs to render once.
export const HeroSection = React.memo(HeroSectionComponent);

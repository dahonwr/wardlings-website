import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Leaf,
  Sprout,
  Gift,
  Star,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { DiscordIcon } from './SocialIcons';
import { Settings } from '../types';

interface OGFreeMintApplicationPageProps {
  onBackToHome: () => void;
  onOpenChecker?: () => void;
  settings?: Settings;
}

const AVATAR_ARTWORK = '/assets/Legendary.jpg';
const LOGO_URL = '/assets/Logo.png';

export const OGFreeMintApplicationPage: React.FC<OGFreeMintApplicationPageProps> = ({
  onBackToHome,
  onOpenChecker
}) => {
  // Ensure the page always mounts at the very top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleCheckWalletClick = () => {
    if (onOpenChecker) {
      onOpenChecker();
    } else {
      onBackToHome();
    }
  };

  return (
    <div className="min-h-screen text-[#2F241D] relative font-nunito selection:bg-[#F7BFD5] selection:text-[#2F241D] flex flex-col justify-between overflow-x-hidden bg-[#FFFDF8]">
      {/* Subtle organic forest decorations */}
      <Leaf
        aria-hidden="true"
        className="hidden sm:block absolute top-16 left-4 lg:left-12 w-7 h-7 text-[#7EBE69]/20 -rotate-12 pointer-events-none"
      />
      <Sprout
        aria-hidden="true"
        className="hidden sm:block absolute top-28 right-4 lg:right-12 w-6 h-6 text-[#7EBE69]/20 rotate-12 pointer-events-none"
      />

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-[#2F241D]/10 bg-[#FFFDF8]/90 backdrop-blur-sm sticky top-0 z-30 px-3.5 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 group cursor-pointer bg-transparent border-none text-left"
          >
            <img
              src={LOGO_URL}
              alt="Wardlings Logo"
              width="28"
              height="28"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-dynapuff font-bold text-base sm:text-lg text-[#2F241D] tracking-tight group-hover:text-[#4D7A39] transition-colors">
              Wardlings
            </span>
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 font-baloo font-bold text-xs sm:text-sm px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-[#2F241D] border border-[#2F241D]/20 shadow-2xs hover:border-[#5C8E47] hover:text-[#4D7A39] hover:bg-[#EEF7E8] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wardlings</span>
          </button>
        </div>
      </header>

      {/* Main Dedicated Page Body — Centered single-column layout */}
      <main className="flex-1 py-4 sm:py-8 px-3 sm:px-6 relative z-10 w-full flex flex-col justify-center items-center">
        <div className="max-w-md sm:max-w-lg mx-auto w-full flex flex-col items-stretch">
          {/* 1. TOP KEEPER ARTWORK & 2. OG FREE MINT PASS INTRO */}
          <div className="p-3.5 sm:p-5 rounded-[22px] sm:rounded-[26px] bg-white border-2 border-[#2F241D]/10 shadow-2xs flex flex-col items-center text-center relative overflow-hidden mb-3.5 sm:mb-5">
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-[#EEF7E8] rounded-full blur-xl pointer-events-none" />

            {/* Character Artwork */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFF8F0] border-2 border-[#2F241D]/10 p-1.5 shadow-inner mb-2 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={AVATAR_ARTWORK}
                alt="Wardling Sanctuary Keeper"
                width="80"
                height="80"
                loading="eager"
                className="w-full h-full object-contain rounded-xl transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/Common.jpg';
                }}
              />
              <div className="absolute bottom-1 right-1 bg-[#5C8E47] text-white p-0.5 rounded-full shadow-2xs">
                <Star className="w-2.5 h-2.5 fill-white" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3E2] text-[#DD6B20] border border-[#DD6B20]/20 font-patrick font-bold text-[10px] sm:text-xs uppercase mb-1">
              <span>Sanctuary Keeper</span>
            </div>

            <h1 className="font-dynapuff font-bold text-lg sm:text-2xl text-[#2F241D] tracking-tight">
              OG Free Mint Pass
            </h1>

            <p className="font-nunito font-semibold text-[11px] sm:text-xs md:text-sm text-[#6A6158] mt-0.5 max-w-sm leading-snug">
              Early supporters who answer the Sanctuary call receive exclusive OG recognition and a guaranteed free mint allocation.
            </p>
          </div>

          {/* 3. APPLICATION CLOSED CARD */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full p-5 sm:p-7 rounded-[24px] sm:rounded-[28px] bg-white border-2 border-[#2F241D]/15 shadow-md relative overflow-hidden text-[#2F241D] flex flex-col items-center text-center"
          >
            {/* Status Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EEF7E8] border-2 border-[#5C8E47] flex items-center justify-center text-[#5C8E47] shadow-2xs mb-3 sm:mb-4 relative">
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#5C8E47]" />
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>

            {/* Closed Heading */}
            <h2 className="font-dynapuff font-bold text-lg sm:text-xl md:text-2xl text-[#2F241D] tracking-tight leading-snug uppercase max-w-sm">
              OG FREE MINT APPLICATIONS HAVE WRAPPED UP
            </h2>

            {/* Exact Copy Paragraphs */}
            <div className="space-y-3 font-nunito font-semibold text-xs sm:text-sm text-[#5A5148] leading-relaxed text-center mt-3.5 mb-6 max-w-md">
              <p>The OG Free Mint application has officially come to an end.</p>
              <p>
                Thank you to everyone who took the time to apply and be part of the first chapter of Wardlings.
              </p>
              <p>
                Our team will now review all submissions and finalize the eligible OG wallets.
              </p>
              <p>
                Once the review is complete, you’ll be able to check your wallet through the Wardlings wallet checker.
              </p>
            </div>

            {/* CTA Button: CHECK YOUR WALLET */}
            <div className="w-full max-w-sm">
              <button
                type="button"
                onClick={handleCheckWalletClick}
                style={{ backgroundColor: '#5C8E47' }}
                className="w-full font-dynapuff font-bold text-xs sm:text-sm md:text-base py-3 sm:py-3.5 px-5 rounded-full text-white shadow-sm hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200 shrink-0" />
                <span>CHECK YOUR WALLET</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="w-full border-t border-[#2F241D]/10 my-5" />

            {/* Missed spots section */}
            <div className="space-y-1.5 font-nunito font-semibold text-xs sm:text-sm text-[#5A5148] leading-relaxed text-center max-w-md">
              <p className="font-dynapuff font-bold text-sm sm:text-base text-[#2F241D]">
                Missed the OG, GTD, or FCFS spots?
              </p>
              <p>
                No worries. Join the Wardlings Discord for quick raffles and other chances to get a spot.
              </p>
            </div>

            {/* CTA Button: JOIN DISCORD */}
            <div className="w-full max-w-sm mt-4">
              <a
                href="https://discord.com/invite/AXjAt95DK"
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: '#5C8E47' }}
                className="w-full font-dynapuff font-bold text-xs sm:text-sm md:text-base py-3 sm:py-3.5 px-5 rounded-full text-white shadow-sm hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <DiscordIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                <span>JOIN DISCORD</span>
              </a>
            </div>
          </motion.div>

          {/* 4. OG KEEPER PERKS (LOCATED DIRECTLY BELOW THE APPLICATION) */}
          <div className="mt-4 sm:mt-5 p-4 sm:p-5 rounded-[22px] sm:rounded-[24px] bg-[#FAF6EE] border border-[#2F241D]/10 space-y-2.5 shadow-2xs">
            <h3 className="font-baloo font-bold text-xs sm:text-sm text-[#2F241D] flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#5C8E47]" />
              <span>OG Keeper Perks</span>
            </h3>

            <div className="space-y-2 font-nunito text-xs text-[#4E443B]">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#EEF7E8] text-[#4D7A39] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-[#2F241D]">Guaranteed Free Mint:</span> 1x Free Mint allocation during the Robinhood Chain launch.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#EEF7E8] text-[#4D7A39] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-[#2F241D]">Exclusive Discord Role:</span> Verified OG badge and private Sanctuary channels.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#EEF7E8] text-[#4D7A39] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-[#2F241D]">Priority Ecosystem Access:</span> First look at future Wardling lore drops and companion items.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dedicated Page Footer */}
      <footer className="w-full border-t border-[#2F241D]/10 py-4 sm:py-5 px-4 text-center">
        <p className="font-patrick font-bold text-xs sm:text-sm text-[#6A6158]">
          🌿 Wardlings Sanctuary • OG Free Mint Pass
        </p>
      </footer>
    </div>
  );
};

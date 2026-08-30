import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, RefreshCw, Lock, ArrowLeft, AlertCircle, Leaf, Sprout } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Settings } from '../types';
import { checkWinnerAllocation, WinnerCheckResult } from '../services/whitelistService';
import { XIcon, DiscordIcon } from './SocialIcons';

// Authoritative Visual Assets
const GRAPHIC_WINNER_URL = '/assets/Youreuin.png';
const GRAPHIC_NOT_FOUND_URL = '/assets/Notthistime.png';
const LOGO_URL = '/assets/Logo.png';
const DISCORD_INVITE_URL = 'https://discord.com/invite/AXjAt95DK';

// Brand confetti celebration colors
const CONFETTI_COLORS = ['#82C66A', '#F7BFD5', '#FDE047', '#DFF4FF', '#2F241D'];

interface WalletCheckerPageProps {
  onBackToHome: () => void;
  settings?: Settings;
}

type CheckerStep =
  | 'wallet_input'  // Wallet Address Input Form (default starting screen on dedicated page)
  | 'winner'        // Wallet Found -> YOU GOT IN Graphic + Allocation + Confetti + Share on X
  | 'not_found';    // Wallet Not Found -> NOT THIS TIME Graphic + No Allocation + Discord Link

export const WalletCheckerPage: React.FC<WalletCheckerPageProps> = ({
  onBackToHome,
  settings
}) => {
  const [step, setStep] = useState<CheckerStep>('wallet_input');
  const [walletInput, setWalletInput] = useState('');
  const [activeWallet, setActiveWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Checking allocation...');
  const [errorMessage, setErrorMessage] = useState('');
  const [allocationResult, setAllocationResult] = useState<WinnerCheckResult | null>(null);

  const walletInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top immediately when mounted
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Confetti celebration trigger for winning wallets
  const triggerConfettiCelebration = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    confetti({
      particleCount: 60,
      spread: 60,
      angle: 60,
      origin: { x: 0.2, y: 0.6 },
      colors: CONFETTI_COLORS,
      zIndex: 9999
    });

    confetti({
      particleCount: 60,
      spread: 60,
      angle: 120,
      origin: { x: 0.8, y: 0.6 },
      colors: CONFETTI_COLORS,
      zIndex: 9999
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x: 0.5, y: 0.55 },
        colors: CONFETTI_COLORS,
        zIndex: 9999
      });
    }, 200);
  }, []);

  // Check Wallet Allocation against Google Sheet
  const handleCheckWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWallet = walletInput.trim();

    if (!cleanWallet) {
      setErrorMessage('Please enter a Robinhood Chain wallet address.');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setLoadingText('Searching allocation data...');
    setErrorMessage('');

    try {
      const result = await checkWinnerAllocation(cleanWallet);
      setActiveWallet(cleanWallet);
      setAllocationResult(result);

      if (result.found && ((result.allocations && result.allocations.length > 0) || result.allocation)) {
        setStep('winner');
        triggerConfettiCelebration();
      } else {
        setStep('not_found');
      }
    } catch (err) {
      console.error('Failed to verify allocation:', err);
      setErrorMessage('Could not check wallet allocation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset checker back to wallet input state while staying on /walletchecker
  const handleReset = () => {
    setStep('wallet_input');
    setWalletInput('');
    setActiveWallet('');
    setErrorMessage('');
    setAllocationResult(null);
    setIsLoading(false);
  };

  const formatShortAddress = (addr?: string) => {
    if (!addr) return '';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Build Share on X intent URL
  const allocationsList = allocationResult?.allocations?.length
    ? allocationResult.allocations
    : [allocationResult?.allocation || 'GTD'];
  const allocationText = allocationsList.map((a) => `${a} Spot`).join(' & ');
  const tweetText = `I found my place in the Wardlings Sanctuary 🌿\n\nI’m officially in with a ${allocationText}.\n\n@wardlingsnft\n#WardlingsNFT`;
  const shareOnXUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

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
      <main className="flex-1 py-6 sm:py-12 px-3 sm:px-6 relative z-10 w-full flex flex-col justify-center items-center">
        <div className="max-w-lg mx-auto w-full flex flex-col items-center text-center">
          {/* Top Section Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4EEE4] text-[#6A6158] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#2F241D]/15 shadow-xs mb-4">
            {step === 'winner' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#5C8E47]" />
                <span className="text-[#5C8E47]">ALLOCATION FOUND</span>
              </>
            ) : step === 'not_found' ? (
              <>
                <Lock className="w-3.5 h-3.5 text-[#6A6158]" />
                <span>ALLOCATION STATUS</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-[#5C8E47]" />
                <span className="text-[#4D7A39]">WALLET CHECKER</span>
              </>
            )}
          </div>

          {/* Main Interactive Card */}
          <div className="w-full p-6 sm:p-10 rounded-3xl bg-white border-2 border-[#2F241D] shadow-md text-[#2F241D]">
            <AnimatePresence mode="wait">
              {/* STEP 1: WALLET INPUT SCREEN */}
              {step === 'wallet_input' && (
                <motion.div
                  key="step-wallet-input"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center w-full"
                >
                  <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl tracking-tight text-[#2F241D]">
                    Check Wallet Allocation
                  </h2>
                  <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] mt-2 mb-6">
                    Enter your Robinhood Chain wallet address to check your recorded allocation.
                  </p>

                  <form onSubmit={handleCheckWallet} className="w-full space-y-4">
                    <div className="text-left">
                      <label
                        htmlFor="wallet-address-input"
                        className="block font-baloo font-bold text-sm text-[#2F241D] mb-1.5"
                      >
                        Robinhood Chain Wallet Address
                      </label>
                      <input
                        id="wallet-address-input"
                        ref={walletInputRef}
                        type="text"
                        value={walletInput}
                        onChange={(e) => setWalletInput(e.target.value)}
                        placeholder="0x..."
                        disabled={isLoading}
                        autoComplete="off"
                        spellCheck={false}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#2F241D] bg-[#FFFDF8] font-mono font-bold text-sm sm:text-base text-[#2F241D] focus:outline-none focus:ring-2 focus:ring-[#82C66A] shadow-xs disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      />
                    </div>

                    {errorMessage && (
                      <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-nunito font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-center">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col items-center gap-3 w-full">
                      <button
                        type="submit"
                        disabled={isLoading || !walletInput.trim()}
                        style={{ backgroundColor: '#5C8E47' }}
                        className="w-full font-dynapuff font-bold text-base sm:text-lg py-3.5 rounded-full text-white shadow-md hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                            <span>{loadingText}</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 shrink-0" />
                            <span>Check Allocation</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={onBackToHome}
                        disabled={isLoading}
                        className="w-full font-baloo font-bold text-sm sm:text-base py-2.5 rounded-full bg-white text-[#2F241D] border-2 border-[#2F241D] hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: WINNER FOUND -> YOU GOT IN + ALLOCATION + CONFETTI + SHARE ON X */}
              {step === 'winner' && (
                <motion.div
                  key="step-winner"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Official YOU GOT IN Graphic */}
                  <div className="w-full max-w-xs sm:max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#2F241D] shadow-md bg-white mb-5 flex items-center justify-center">
                    <img
                      src={GRAPHIC_WINNER_URL}
                      alt="Official Wardlings Allocation"
                      width="384"
                      height="288"
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-contain block"
                    />
                  </div>

                  {/* Allocation Details */}
                  <div className="space-y-3 mb-6 w-full">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF7E8] text-[#3D6E29] border border-[#3D6E29]/20 font-patrick font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#5C8E47]" />
                      <span>
                        {allocationResult?.allocations && allocationResult.allocations.length > 1
                          ? 'ALLOCATIONS FOUND'
                          : 'ALLOCATION FOUND'}
                      </span>
                    </div>

                    {/* Allocation Display */}
                    <div className="p-4 rounded-2xl bg-[#EEF7E8] border-2 border-[#2F241D] shadow-xs space-y-2">
                      <span className="block font-patrick font-bold text-xs text-[#6A6158] uppercase">
                        {allocationResult?.allocations && allocationResult.allocations.length > 1
                          ? 'Official Whitelist Spots'
                          : 'Official Whitelist Spot'}
                      </span>

                      <div className="flex flex-col gap-2 w-full">
                        {(allocationResult?.allocations && allocationResult.allocations.length > 0
                          ? allocationResult.allocations
                          : [allocationResult?.allocation || 'GTD']
                        ).map((alloc) => (
                          <div
                            key={alloc}
                            className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-white/90 border border-[#2F241D]/15 text-[#2F241D]"
                          >
                            <span className="font-dynapuff font-bold text-xl sm:text-2xl text-[#3D6E29] tracking-wider">
                              {alloc} Spot
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {activeWallet && (
                      <p className="font-mono text-xs text-[#6A6158]">
                        Wallet: {formatShortAddress(activeWallet)}
                      </p>
                    )}
                  </div>

                  {/* Share on X Button */}
                  <div className="w-full space-y-3">
                    <a
                      href={shareOnXUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: '#2F241D' }}
                      className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#1C1511] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98]"
                    >
                      <XIcon className="w-4.5 h-4.5 text-white shrink-0" />
                      <span>Share Your Spot</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="font-baloo font-semibold text-xs sm:text-sm text-[#8A8175] hover:text-[#2F241D] transition-colors cursor-pointer py-1 block mx-auto"
                    >
                      Check another wallet →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: NOT FOUND -> NOT THIS TIME + DAILY WL GIVEAWAYS + JOIN SANCTUARY DISCORD */}
              {step === 'not_found' && (
                <motion.div
                  key="step-not-found"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Official NOT THIS TIME Graphic */}
                  <div className="w-full max-w-xs sm:max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#2F241D] shadow-md bg-white mb-5 flex items-center justify-center">
                    <img
                      src={GRAPHIC_NOT_FOUND_URL}
                      alt="Wardlings Allocation Status"
                      width="384"
                      height="288"
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-contain block"
                    />
                  </div>

                  <div className="space-y-1.5 mb-6 text-center">
                    <p className="font-dynapuff font-bold text-lg sm:text-xl text-[#2F241D]">
                      Didn't make this round? No worries.
                    </p>
                    <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] max-w-xs mx-auto leading-relaxed">
                      We host daily WL giveaways in the Wardlings Discord.
                    </p>
                    {activeWallet && (
                      <p className="font-mono text-xs text-[#8A8175] pt-1">
                        {formatShortAddress(activeWallet)}
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-3">
                    <a
                      href={DISCORD_INVITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: '#5C8E47' }}
                      className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98]"
                    >
                      <DiscordIcon className="w-5 h-5 text-white shrink-0" />
                      <span>Join the Sanctuary</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="font-baloo font-semibold text-xs sm:text-sm text-[#8A8175] hover:text-[#2F241D] transition-colors cursor-pointer py-1 block mx-auto"
                    >
                      Check another wallet →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Dedicated Page Footer */}
      <footer className="w-full border-t border-[#2F241D]/10 py-4 sm:py-5 px-4 text-center">
        <p className="font-patrick font-bold text-xs sm:text-sm text-[#6A6158]">
          🌿 Wardlings Sanctuary • Wallet Checker
        </p>
      </footer>
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, RefreshCw, Lock, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Settings } from '../types';
import { checkWinnerAllocation, WinnerCheckResult } from '../services/whitelistService';
import { fadeUpPop, fadeUpPopTransition, badgePop, badgePopTransition, popInPlayfulTransition, staggerContainer } from '../lib/motion';
import { scrollElementIntoSmartView } from '../lib/scroll';
import { XIcon, DiscordIcon } from './SocialIcons';

// Authoritative Visual Assets
const GRAPHIC_WINNER_URL =
  'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Youreuin.png';
const GRAPHIC_NOT_FOUND_URL =
  'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Notthistime.png';

// Brand confetti celebration colors
const CONFETTI_COLORS = ['#82C66A', '#F7BFD5', '#FDE047', '#DFF4FF', '#2F241D'];

interface ApplicationSectionProps {
  settings?: Settings;
  checkerTrigger?: number;
}

type CheckerStep =
  | 'idle'          // Whitelist Closed + "Find Your Place" CTA
  | 'wallet_input'  // Wallet Address Input Form
  | 'winner'        // Wallet Found -> YOU GOT IN Graphic + Allocation + Confetti + Share on X
  | 'not_found';    // Wallet Not Found -> NOT THIS TIME Graphic + No Allocation + No Share Button

export const ApplicationSection: React.FC<ApplicationSectionProps> = ({
  settings,
  checkerTrigger = 0
}) => {
  const [step, setStep] = useState<CheckerStep>('idle');
  const [walletInput, setWalletInput] = useState('');
  const [activeWallet, setActiveWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Checking allocation...');
  const [errorMessage, setErrorMessage] = useState('');
  const [allocationResult, setAllocationResult] = useState<WinnerCheckResult | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const walletInputRef = useRef<HTMLInputElement>(null);

  // Fires exactly when the winner/not_found result block is attached to
  // the DOM (React calls ref callbacks synchronously on mount) — a precise
  // signal that beats any fixed delay. A follow-up double rAF waits for
  // that content to actually be laid out and painted before measuring
  // where it landed, so the reposition below is based on real geometry.
  const handleResultMount = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollElementIntoSmartView(cardRef.current);
      });
    });
  }, []);

  // The result graphics are remote images with no known intrinsic size, so
  // they can still grow the card after the initial layout settles once
  // they finish loading. Re-checking (not re-forcing) the position on load
  // catches that without stacking animations — scrollElementIntoSmartView
  // only moves the page if the content has actually drifted out of a
  // sensible spot, and scrollToY cancels any in-flight scroll before
  // starting a new one, so this never fights the mount-time scroll above.
  const handleResultImageLoad = useCallback(() => {
    scrollElementIntoSmartView(cardRef.current);
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
    }, 250);
  }, []);

  // Schedules work for just after the browser has painted the current
  // step's content, so measurements (and the resulting scroll target)
  // reflect real, laid-out geometry instead of a guessed delay.
  const runAfterPaint = useCallback((fn: () => void) => {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }, []);

  // Trigger opening checker when hero CTA or navbar is clicked. The caller
  // (App.tsx) already scrolls to this exact card via scrollToId('apply')
  // when it bumps checkerTrigger, so this only needs to handle focus —
  // scrolling again here would just be a second animation to the same spot.
  useEffect(() => {
    if (checkerTrigger > 0) {
      setErrorMessage('');
      setStep('wallet_input');
      runAfterPaint(() => {
        walletInputRef.current?.focus();
      });
    }
  }, [checkerTrigger, runAfterPaint]);

  // Open Wallet Input
  const handleOpenWalletInput = () => {
    setStep('wallet_input');
    setErrorMessage('');
    runAfterPaint(() => {
      scrollElementIntoSmartView(cardRef.current);
      walletInputRef.current?.focus();
    });
  };

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

      if (result.found && result.allocation) {
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

  // Reset to initial screen or check another wallet
  const handleReset = () => {
    setStep('wallet_input');
    setWalletInput('');
    setActiveWallet('');
    setErrorMessage('');
    setAllocationResult(null);
    setIsLoading(false);
    setTimeout(() => {
      walletInputRef.current?.focus();
    }, 100);
  };

  const handleBackToIdle = () => {
    setStep('idle');
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
  const allocationName = allocationResult?.allocation || 'GTD';
  const tweetText = `I found my place in the Wardlings Sanctuary 🌿\n\nI’m officially in with a ${allocationName} spot.\n\n@wardlingsnft\n#WardlingsNFT`;
  const shareOnXUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <section id="apply" className="py-16 md:py-24 px-4 sm:px-6 relative z-10 w-full bg-[#FFFDF8]">
      <motion.div
        ref={cardRef}
        data-scroll-anchor
        variants={staggerContainer(0.14)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -35% 0px' }}
        className="max-w-lg mx-auto flex flex-col items-center text-center"
      >
        {/* Top Section Badge */}
        <motion.div
          variants={badgePop}
          transition={badgePopTransition}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4EEE4] text-[#6A6158] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#2F241D]/15 shadow-xs mb-4"
        >
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
          ) : step === 'wallet_input' ? (
            <>
              <Search className="w-3.5 h-3.5 text-[#5C8E47]" />
              <span className="text-[#4D7A39]">WALLET CHECKER</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>WHITELIST CLOSED</span>
            </>
          )}
        </motion.div>

        {/* Main Interactive Card */}
        <motion.div
          variants={fadeUpPop}
          transition={{ ...popInPlayfulTransition, delay: 0.1 }}
          className="w-full p-6 sm:p-10 rounded-3xl bg-[#FFFDF8] border-2 border-[#2F241D] shadow-md text-[#2F241D]"
        >
          <AnimatePresence mode="wait">
            {/* STEP 0: IDLE SCREEN (CLOSED WHITELIST & FIND YOUR PLACE) */}
            {step === 'idle' && (
              <motion.div
                key="step-idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center"
              >
                <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight">
                  WHITELIST CLOSED
                </h2>
                <p className="font-nunito font-semibold text-base sm:text-lg text-[#6A6158] mt-4 leading-relaxed">
                  The first chapter of the Sanctuary has come to an end.
                  <br />
                  Thank you to everyone who planted their story with us.
                </p>
                <p className="font-nunito font-semibold text-base sm:text-lg text-[#6A6158] mt-3 leading-relaxed">
                  Check if your wallet has an allocation for the upcoming mint.
                </p>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 w-full p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-nunito font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-center"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Main CTA: Find Your Place */}
                <div className="mt-7 w-full flex flex-col items-center">
                  <motion.button
                    onClick={handleOpenWalletInput}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ backgroundColor: '#5C8E47' }}
                    className="w-full sm:w-auto font-dynapuff font-bold text-base sm:text-lg px-8 py-3.5 rounded-full text-white shadow-md hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200 shrink-0" />
                    <span>Find Your Place</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 1: WALLET INPUT SCREEN */}
            {step === 'wallet_input' && (
              <motion.div
                key="step-wallet-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
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
                      className="w-full px-4 py-3 rounded-2xl border-2 border-[#2F241D] bg-white font-mono font-bold text-sm sm:text-base text-[#2F241D] focus:outline-none focus:ring-2 focus:ring-[#82C66A] shadow-xs disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    />
                  </div>

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-nunito font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-center"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBackToIdle}
                      disabled={isLoading}
                      className="w-full sm:w-auto font-baloo font-bold text-sm sm:text-base px-5 py-3 rounded-full bg-white text-[#2F241D] border-2 border-[#2F241D] hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Back
                    </button>

                    <motion.button
                      type="submit"
                      disabled={isLoading || !walletInput.trim()}
                      whileHover={!isLoading && walletInput.trim() ? { scale: 1.02 } : {}}
                      whileTap={!isLoading && walletInput.trim() ? { scale: 0.98 } : {}}
                      style={{ backgroundColor: '#5C8E47' }}
                      className="w-full sm:flex-1 font-dynapuff font-bold text-base sm:text-lg py-3 rounded-full text-white shadow-md hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: WINNER FOUND -> YOU GOT IN + ALLOCATION + CONFETTI + SHARE ON X */}
            {step === 'winner' && (
              <motion.div
                key="step-winner"
                ref={handleResultMount}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col items-center w-full"
              >
                {/* Official YOU GOT IN Graphic */}
                <div className="w-full max-w-xs sm:max-w-sm rounded-2xl overflow-hidden border-2 border-[#2F241D] shadow-md bg-white mb-5">
                  <img
                    src={GRAPHIC_WINNER_URL}
                    alt="Official Wardlings Allocation"
                    className="w-full h-auto object-contain block"
                    onLoad={handleResultImageLoad}
                  />
                </div>

                {/* Allocation Details */}
                <div className="space-y-3 mb-6 w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF7E8] text-[#3D6E29] border border-[#3D6E29]/20 font-patrick font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#5C8E47]" />
                    <span>ALLOCATION FOUND</span>
                  </div>

                  {/* Allocation Display */}
                  <div className="p-4 rounded-2xl bg-[#EEF7E8] border-2 border-[#2F241D] shadow-xs">
                    <span className="block font-patrick font-bold text-xs text-[#6A6158] uppercase">
                      Official Whitelist Spot
                    </span>
                    <span className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#3D6E29] tracking-wider">
                      {allocationResult?.allocation || 'GTD'}
                    </span>
                  </div>

                  {activeWallet && (
                    <p className="font-mono text-xs text-[#6A6158]">
                      Wallet: {formatShortAddress(activeWallet)}
                    </p>
                  )}
                </div>

                {/* Share on X Button */}
                <div className="w-full space-y-3">
                  <motion.a
                    href={shareOnXUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ backgroundColor: '#2F241D' }}
                    className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#1C1511] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-all"
                  >
                    <XIcon className="w-4.5 h-4.5 text-white shrink-0" />
                    <span>Share Your Spot</span>
                  </motion.a>

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
                ref={handleResultMount}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col items-center w-full"
              >
                {/* Official NOT THIS TIME Graphic */}
                <div className="w-full max-w-xs sm:max-w-sm rounded-2xl overflow-hidden border-2 border-[#2F241D] shadow-md bg-white mb-5">
                  <img
                    src={GRAPHIC_NOT_FOUND_URL}
                    alt="Wardlings Allocation Status"
                    className="w-full h-auto object-contain block"
                    onLoad={handleResultImageLoad}
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
                  <motion.a
                    href="https://discord.com/invite/AXjAt95DK"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ backgroundColor: '#5C8E47' }}
                    className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-all"
                  >
                    <DiscordIcon className="w-5 h-5 text-white shrink-0" />
                    <span>Join the Sanctuary</span>
                  </motion.a>

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
        </motion.div>

        {/* Follow Wardlings on X Section */}
        <motion.div
          variants={fadeUpPop}
          transition={{ ...fadeUpPopTransition, delay: 0.2 }}
          className="w-full mt-5 p-5 sm:p-6 rounded-3xl bg-white/60 border border-[#2F241D]/10 text-center"
        >
          <h3 className="font-dynapuff font-bold text-lg sm:text-xl text-[#2F241D]">
            Follow Wardlings on X
          </h3>
          <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] mt-2 leading-relaxed">
            Stay close to the Sanctuary. Follow @wardlingsnft on X for Keeper announcements, updates, and what's coming next.
          </p>
          <motion.a
            href={settings?.twitter_follow || 'https://x.com/wardlingsnft'}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-4 w-full sm:w-auto font-baloo font-bold text-base sm:text-lg px-6 py-3.5 rounded-full bg-white/90 text-[#34281F] border border-[#34281F]/15 shadow-sm hover:bg-white cursor-pointer inline-flex items-center justify-center gap-2 transition-all"
          >
            <XIcon className="w-4 h-4 text-[#34281F] shrink-0" />
            <span>Follow @wardlingsnft</span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

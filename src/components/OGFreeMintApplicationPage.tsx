import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Leaf,
  Sprout,
  ShieldCheck,
  Gift,
  Star,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Settings } from '../types';
import { submitOgApplication } from '../services/ogApplicationService';
import { XIcon } from './SocialIcons';

interface OGFreeMintApplicationPageProps {
  onBackToHome: () => void;
  settings?: Settings;
}

type WizardStep =
  | 'username'    // Step 1: X Username
  | 'follow'      // Step 2: Follow @wardlingsnft
  | 'like'        // Step 3: Like the post
  | 'repost'      // Step 4: Repost the post
  | 'comment_tag' // Step 5: Comment + tag 2 friends
  | 'wallet';     // Step 6: Wallet Address

type TaskState = 'idle' | 'opening' | 'checking' | 'completed';

interface SocialTaskConfig {
  step: WizardStep;
  stepNumber: number;
  title: string;
  url: string;
  nextStep: WizardStep;
}

const AVATAR_ARTWORK = '/assets/Legendary.jpg';
const LOGO_URL = '/assets/Logo.png';

export const OGFreeMintApplicationPage: React.FC<OGFreeMintApplicationPageProps> = ({
  onBackToHome,
  settings
}) => {
  // Wizard current step
  const [currentStep, setCurrentStep] = useState<WizardStep>('username');

  // User input data
  const [xUsername, setXUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Active social task timer and state
  const [taskState, setTaskState] = useState<TaskState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(5);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<number | string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for timer cleanup
  const timerIntervalRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Centralized URLs configuration
  const followUrl = settings?.twitter_follow || 'https://x.com/WardlingsNFT';
  const announcementUrl =
    settings?.twitter_like ||
    settings?.twitter_repost ||
    settings?.twitter_comment ||
    'https://x.com/wardlingsnft/status/2093096332936491146?s=20';

  const socialTasks: Record<
    'follow' | 'like' | 'repost' | 'comment_tag',
    SocialTaskConfig
  > = {
    follow: {
      step: 'follow',
      stepNumber: 2,
      title: 'Follow @wardlingsnft',
      url: followUrl,
      nextStep: 'like'
    },
    like: {
      step: 'like',
      stepNumber: 3,
      title: 'Like the post',
      url: announcementUrl,
      nextStep: 'repost'
    },
    repost: {
      step: 'repost',
      stepNumber: 4,
      title: 'Repost the post',
      url: announcementUrl,
      nextStep: 'comment_tag'
    },
    comment_tag: {
      step: 'comment_tag',
      stepNumber: 5,
      title: 'Comment + tag 2 friends',
      url: announcementUrl,
      nextStep: 'wallet'
    }
  };

  // Clear timers on unmount and scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Handle Step 1: Username Submit
  const handleUsernameNext = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = xUsername.trim().replace(/^@+/, '');
    if (!cleanUsername) return;

    setXUsername(cleanUsername);
    setErrorMessage('');
    setTaskState('idle');
    setSecondsLeft(5);
    setCurrentStep('follow');
  };

  // Handle Social Task Click (Steps 2 to 5)
  const handleTaskCardClick = (taskConfig: SocialTaskConfig) => {
    // Prevent duplicate activation while timer or transition is active
    if (taskState !== 'idle') return;

    setTaskState('opening');
    setSecondsLeft(5);

    // Open X in a new tab safely
    try {
      window.open(taskConfig.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Could not open new window automatically:', e);
    }

    // Switch to checking state with countdown
    setTaskState('checking');

    let currentSec = 5;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = window.setInterval(() => {
      currentSec -= 1;
      setSecondsLeft(currentSec);

      if (currentSec <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setTaskState('completed');

        // Allow user to see "Completed" check for a brief moment before moving to next step
        transitionTimeoutRef.current = window.setTimeout(() => {
          setTaskState('idle');
          setSecondsLeft(5);
          setCurrentStep(taskConfig.nextStep);
        }, 800);
      }
    }, 1000);
  };

  // Handle Step 6: Wallet Submit
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWallet = walletAddress.trim();
    if (!cleanWallet || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setIsDuplicate(false);

    const cleanXUsername = xUsername.trim().replace(/^@+/, '');

    const payload = {
      x_username: cleanXUsername,
      wallet_address: cleanWallet,
      completed_follow: true,
      completed_like: true,
      completed_share: true,
      completed_comment: true,
      completed_tag: true
    };

    const result = await submitOgApplication(payload);
    setIsSubmitting(false);

    if (result.ok) {
      setIsSuccess(true);
      if (result.data?.id) {
        setApplicationId(result.data.id);
      }
    } else {
      setIsDuplicate(Boolean(result.isDuplicate || result.status === 409));
      setErrorMessage(
        result.errorMessage ||
          (result.status === 409
            ? 'We already have an application for this X username or wallet.'
            : "Your application wasn't submitted. Please try again.")
      );
    }
  };

  // Helper to determine step indicator (6 steps in total flow)
  const getStepNumber = (step: WizardStep) => {
    switch (step) {
      case 'username':
        return 1;
      case 'follow':
        return 2;
      case 'like':
        return 3;
      case 'repost':
        return 4;
      case 'comment_tag':
        return 5;
      case 'wallet':
        return 6;
    }
  };

  const currentStepNum = getStepNumber(currentStep);

  return (
    <div
      className="min-h-screen text-[#2F241D] relative font-nunito selection:bg-[#F7BFD5] selection:text-[#2F241D] flex flex-col justify-between overflow-x-hidden bg-[#FFFDF8]"
    >
      {/* Subtle organic decorations */}
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

          {/* 3. APPLICATION CARD (PRIMARY CENTERED FOCUS) */}
          <div className="w-full p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] bg-white border-2 border-[#2F241D]/15 shadow-md relative overflow-hidden text-[#2F241D]">
            <AnimatePresence mode="wait">
              {/* SUCCESS STATE */}
              {isSuccess ? (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex flex-col items-center text-center py-4 sm:py-6"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EEF7E8] border-2 border-[#5C8E47] flex items-center justify-center text-[#5C8E47] shadow-sm mb-3.5 relative">
                    <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-[#5C8E47]" />
                    <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>

                  {applicationId && (
                    <span className="inline-block px-3 py-0.5 rounded-full bg-[#FAF6EE] border border-[#2F241D]/10 text-xs font-mono font-bold text-[#6A6158] mb-1.5">
                      Application #{applicationId}
                    </span>
                  )}

                  <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
                    Application Received
                  </h2>

                  <p className="font-nunito font-bold text-sm sm:text-base text-[#4D7A39] mt-1.5">
                    Your OG application has been submitted successfully.
                  </p>

                  <p className="font-nunito font-semibold text-xs sm:text-sm text-[#6A6158] mt-1.5 max-w-sm leading-relaxed">
                    We'll review your application and keep your Sanctuary journey moving.
                  </p>

                  <div className="mt-6 w-full max-w-xs flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={onBackToHome}
                      style={{ backgroundColor: '#5C8E47' }}
                      className="w-full font-dynapuff font-bold text-sm sm:text-base py-3 px-5 rounded-full text-white shadow-sm hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                      <span>Back to Wardlings</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* WIZARD FLOW STATE: COMPACT & NATURALLY SIZED BASED ON ACTIVE STEP */
                <motion.div
                  key="wizard-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Wizard Card Header with Step Progress */}
                  <div className="border-b border-[#2F241D]/10 pb-3 mb-4 sm:pb-4 sm:mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="font-dynapuff font-bold text-xl sm:text-2xl text-[#2F241D] leading-tight">
                        OG Application
                      </h2>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="font-patrick font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#EEF7E8] text-[#4D7A39] border border-[#4D7A39]/20">
                        Step {currentStepNum} of 6
                      </span>
                      {/* Mini step dot progress */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <div
                            key={num}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              num === currentStepNum
                                ? 'w-4 sm:w-5 bg-[#5C8E47]'
                                : num < currentStepNum
                                ? 'w-1.5 sm:w-2 bg-[#82C66A]'
                                : 'w-1.5 sm:w-2 bg-[#2F241D]/15'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* STEP 1: X USERNAME ONLY */}
                  {currentStep === 'username' && (
                    <motion.form
                      key="step-username"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      onSubmit={handleUsernameNext}
                      className="space-y-4 sm:space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="og-x-username"
                          className="block font-baloo font-bold text-sm sm:text-base text-[#2F241D] mb-1.5 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1.5">
                            <XIcon className="w-3.5 h-3.5 text-[#2F241D]" />
                            <span>X Username</span>
                          </span>
                        </label>
                        <input
                          id="og-x-username"
                          type="text"
                          value={xUsername}
                          onChange={(e) => setXUsername(e.target.value)}
                          placeholder="@yourusername"
                          autoComplete="off"
                          spellCheck={false}
                          className="w-full px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-2xl border-2 border-[#2F241D]/20 focus:border-[#5C8E47] bg-[#FFFDF8] font-nunito font-bold text-base text-[#2F241D] placeholder:text-[#A89F95] focus:outline-none focus:ring-2 focus:ring-[#82C66A]/30 shadow-2xs transition-all"
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={!xUsername.trim()}
                          style={{ backgroundColor: xUsername.trim() ? '#5C8E47' : '#9E948B' }}
                          className="w-full font-dynapuff font-bold text-sm sm:text-base py-3 sm:py-3.5 px-5 rounded-full text-white shadow-sm hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-1.5 transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* STEPS 2-5: SINGLE SOCIAL TASK CARD ONLY */}
                  {(currentStep === 'follow' ||
                    currentStep === 'like' ||
                    currentStep === 'repost' ||
                    currentStep === 'comment_tag') && (
                    <motion.div
                      key={`step-${currentStep}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="w-full"
                    >
                      {(() => {
                        const task = socialTasks[currentStep];
                        const isOpening = taskState === 'opening';
                        const isChecking = taskState === 'checking';
                        const isCompleted = taskState === 'completed';

                        return (
                          <div
                            onClick={() => handleTaskCardClick(task)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleTaskCardClick(task);
                              }
                            }}
                            className={`w-full py-5 px-4 sm:py-6 sm:px-6 rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 cursor-pointer select-none text-center flex flex-col items-center justify-center relative overflow-hidden ${
                              isCompleted
                                ? 'bg-[#EEF7E8] border-[#5C8E47] shadow-xs'
                                : isChecking || isOpening
                                ? 'bg-[#FAF6EE] border-[#5C8E47]/60 shadow-sm'
                                : 'bg-[#FFFDF8] border-[#2F241D]/20 hover:border-[#5C8E47] hover:bg-[#FAF6EE] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.99]'
                            }`}
                          >
                            {/* Icon Indicator */}
                            <div className="mb-2.5">
                              {isCompleted ? (
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#5C8E47] text-white shadow-2xs">
                                  <Check className="w-5 h-5 stroke-[3]" />
                                </div>
                              ) : isChecking ? (
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#EEF7E8] text-[#4D7A39] border border-[#4D7A39]/30">
                                  <RefreshCw className="w-5 h-5 animate-spin" />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FAF6EE] border border-[#2F241D]/15 text-[#2F241D]">
                                  <XIcon className="w-4 h-4 text-[#2F241D]" />
                                </div>
                              )}
                            </div>

                            {/* Task Title (ONLY the task itself, no instructional helper text) */}
                            <h3 className="font-dynapuff font-bold text-base sm:text-lg md:text-xl text-[#2F241D] max-w-sm">
                              {task.title}
                            </h3>

                            {/* Active interaction feedback */}
                            {(isOpening || isChecking || isCompleted) && (
                              <div className="mt-2.5 font-nunito font-bold text-xs sm:text-sm">
                                {isOpening && (
                                  <span className="text-[#4D7A39]">
                                    Opening X...
                                  </span>
                                )}
                                {isChecking && (
                                  <div className="flex flex-col items-center gap-1.5">
                                    <span className="text-[#4D7A39]">
                                      Checking task... {secondsLeft}
                                    </span>
                                    <div className="w-28 sm:w-36 h-1.5 rounded-full bg-[#2F241D]/10 overflow-hidden">
                                      <div
                                        className="h-full bg-[#5C8E47] transition-all duration-1000 ease-linear"
                                        style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                {isCompleted && (
                                  <span className="text-[#4D7A39] font-bold">
                                    Completed
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* STEP 6: WALLET ADDRESS & SUBMIT */}
                  {currentStep === 'wallet' && (
                    <motion.form
                      key="step-wallet"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      onSubmit={handleSubmitApplication}
                      className="space-y-3.5 sm:space-y-4 w-full min-w-0"
                    >
                      <div className="w-full min-w-0">
                        <label
                          htmlFor="og-wallet-address"
                          className="block font-baloo font-bold text-xs sm:text-sm md:text-base text-[#2F241D] mb-1 flex items-center justify-between"
                        >
                          <span>Wallet Address</span>
                          <span className="text-[10px] sm:text-xs font-nunito font-semibold text-[#8C837A] shrink-0">
                            Robinhood Chain
                          </span>
                        </label>
                        <div className="w-full min-w-0 relative">
                          <input
                            id="og-wallet-address"
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="Enter your wallet address (0x...)"
                            disabled={isSubmitting}
                            autoComplete="off"
                            spellCheck={false}
                            className="w-full max-w-full min-w-0 box-border px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl border-2 border-[#2F241D]/20 focus:border-[#5C8E47] bg-[#FFFDF8] font-mono font-bold text-xs sm:text-sm text-[#2F241D] placeholder:text-[#A89F95] placeholder:font-nunito placeholder:text-xs sm:placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#82C66A]/30 shadow-2xs disabled:opacity-60 transition-all truncate"
                          />
                        </div>
                        <p className="font-nunito font-semibold text-[10px] sm:text-xs text-[#8C837A] mt-1 leading-snug">
                          Address submission field only. No signature or wallet connection required.
                        </p>
                      </div>

                      {/* Error Banner */}
                      {errorMessage && (
                        <div
                          className={`p-3 rounded-2xl border text-xs font-nunito font-bold flex items-start gap-2 w-full min-w-0 ${
                            isDuplicate
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}
                        >
                          <AlertCircle
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isDuplicate ? 'text-amber-600' : 'text-red-600'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-dynapuff font-bold text-xs sm:text-sm">
                              {isDuplicate
                                ? 'Application Already Submitted'
                                : 'Something went wrong'}
                            </div>
                            <p className="mt-0.5 font-semibold text-xs opacity-90 break-words">
                              {errorMessage}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-1">
                        <button
                          type="submit"
                          disabled={!walletAddress.trim() || isSubmitting}
                          style={{
                            backgroundColor:
                              walletAddress.trim() && !isSubmitting ? '#5C8E47' : '#9E948B'
                          }}
                          className="w-full font-dynapuff font-bold text-xs sm:text-sm md:text-base py-3 sm:py-3.5 px-4 rounded-full text-white shadow-sm hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200 shrink-0" />
                              <span>Submit OG Application</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. OG KEEPER PERKS (LOCATED DIRECTLY BELOW THE APPLICATION) */}
          <div className="mt-5 sm:mt-6 p-4 sm:p-6 rounded-[24px] bg-[#FAF6EE] border border-[#2F241D]/10 space-y-3 shadow-2xs">
            <h3 className="font-baloo font-bold text-sm sm:text-base text-[#2F241D] flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#5C8E47]" />
              <span>OG Keeper Perks</span>
            </h3>

            <div className="space-y-2 font-nunito text-xs sm:text-sm text-[#4E443B]">
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
      <footer className="w-full border-t border-[#2F241D]/10 py-5 px-4 text-center">
        <p className="font-patrick font-bold text-xs sm:text-sm text-[#6A6158]">
          🌿 Wardlings Sanctuary • OG Free Mint Pass Application
        </p>
      </footer>
    </div>
  );
};

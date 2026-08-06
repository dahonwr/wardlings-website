import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, ExternalLink, RefreshCw, Lock, Check } from 'lucide-react';
import { Settings } from '../types';
import { WardlingsProgressTracker } from './WardlingsProgressTracker';
import { WhitelistSuccessPopup } from './WhitelistSuccessPopup';
import { useWhitelist } from '../hooks/useWhitelist';
import { SOCIAL_TASKS } from '../services/whitelistService';

interface ApplicationPageProps {
  onBackToSanctuary: () => void;
  settings: Settings;
}

const WHITELIST_LOGO_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Whitelist.png';

export const ApplicationPage: React.FC<ApplicationPageProps> = ({
  onBackToSanctuary,
  settings
}) => {
  const {
    application,
    currentStep,
    setCurrentStep,
    xHandleInput,
    setXHandleInput,
    walletInput,
    setWalletInput,
    commentLinkInput,
    setCommentLinkInput,
    isSubmitting,
    errorMessage,
    setErrorMessage,
    isTaskCompleted,
    areAllSocialTasksCompleted,
    restoreApplication,
    submitStep1Handle,
    toggleSocialTask,
    proceedToStep3Wallet,
    submitStep3Wallet,
    submitStep4CommentLink
  } = useWhitelist();

  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Whitelist success popup: fires once, the moment the application lands
  // on step 5 (i.e. right after a successful submission) — not on every
  // visit to the final step (e.g. restoring a past application).
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const previousStepRef = useRef(currentStep);
  useEffect(() => {
    if (currentStep === 5 && previousStepRef.current !== 5) {
      setShowSuccessPopup(true);
    }
    previousStepRef.current = currentStep;
  }, [currentStep]);

  // Active 5-second countdown timers for task clicks: taskId -> seconds remaining
  const [pendingTasks, setPendingTasks] = useState<Record<string, number>>({});

  // Countdown timer interval for display (decrements 4s -> 3s -> 2s -> 1s)
  useEffect(() => {
    const keys = Object.keys(pendingTasks);
    if (keys.length === 0) return;

    const interval = setInterval(() => {
      setPendingTasks(prev => {
        const next = { ...prev };
        let changed = false;

        for (const taskId of Object.keys(next)) {
          if (next[taskId] > 1) {
            next[taskId] -= 1;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingTasks]);

  // Handle task card click
  const handleTaskClick = (taskId: string, linkUrl: string) => {
    if (pendingTasks[taskId] || isTaskCompleted(taskId)) return;

    // 1. Open URL immediately in new tab
    window.open(linkUrl, '_blank', 'noopener,noreferrer');

    // 2. Set fake checking state with 4 seconds countdown
    setPendingTasks(prev => ({ ...prev, [taskId]: 4 }));

    // 3. Guaranteed automatic task completion after 3.5 seconds
    setTimeout(() => {
      // Clear pending state
      setPendingTasks(prev => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });

      // Mark task as completed (updates local state instantly + syncs Supabase)
      toggleSocialTask(taskId);
    }, 3500);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitStep1Handle(xHandleInput);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery) return;
    setIsLookingUp(true);
    const found = await restoreApplication(lookupQuery);
    setIsLookingUp(false);
    if (!found) {
      setErrorMessage('No application found in Supabase for this X handle or wallet address.');
    }
  };

  const formatUsername = (val: string) => {
    const clean = val.trim().replace(/^@/, '');
    return clean ? `@${clean}` : '@username';
  };

  const truncateWallet = (addr?: string | null) => {
    if (!addr) return '0x0000...0000';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getTaskLink = (taskId: string) => {
    switch (taskId) {
      case 'follow_x': return settings.twitter_follow || 'https://x.com/WardlingsNFT';
      case 'like_pinned': return settings.twitter_like || 'https://x.com/WardlingsNFT/status/1';
      case 'repost_pinned': return settings.twitter_repost || 'https://x.com/WardlingsNFT/status/1';
      case 'comment_pinned': return settings.twitter_comment || 'https://x.com/WardlingsNFT/status/1';
      default: return 'https://x.com/WardlingsNFT';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto min-h-screen w-full flex flex-col justify-between py-6 px-4 sm:px-6 select-none"
      style={{
        background: 'linear-gradient(180deg, #F9FCF4 0%, #EEF8E9 45%, #F8FBF3 100%)'
      }}
    >
      {/* Header */}
      <header className="w-full max-w-[1280px] mx-auto flex items-center justify-between py-2 relative z-20">
        <button
          onClick={onBackToSanctuary}
          className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none text-left"
        >
          <img
            src={WHITELIST_LOGO_URL}
            alt="Wardlings Logo"
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-dynapuff font-bold text-xl text-[#2F241D] tracking-tight group-hover:text-[#4D7A39] transition-colors">
            Wardlings
          </span>
        </button>

        <button
          onClick={onBackToSanctuary}
          className="inline-flex items-center gap-2 font-baloo font-bold text-sm sm:text-base px-4 py-2 rounded-full bg-[#FFFDF8] text-[#2F241D] border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#82C66A] hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Sanctuary</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-lg mx-auto my-auto relative z-20 py-8 flex flex-col items-center">
        {/* Restore Progress Bar */}
        <form onSubmit={handleLookup} className="mb-4 flex items-center gap-2 bg-white/80 p-2 rounded-2xl border border-[#2F241D]/30 w-full max-w-sm">
          <input
            type="text"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            placeholder="Restore with @username or 0x wallet..."
            className="px-2 text-xs font-nunito font-bold text-[#2F241D] focus:outline-none w-full bg-transparent"
          />
          <button
            type="submit"
            disabled={isLookingUp}
            className="px-3 py-1 bg-[#82C66A] text-white font-dynapuff font-bold text-xs rounded-xl hover:bg-[#72B65A] shrink-0"
          >
            {isLookingUp ? '...' : 'Restore'}
          </button>
        </form>

        {/* Progress Tracker */}
        <WardlingsProgressTracker
          currentStep={
            currentStep === 2
              ? 2 + (SOCIAL_TASKS.filter(st => isTaskCompleted(st.id)).length / 4)
              : currentStep
          }
        />

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border-2 border-[#2F241D] shadow-lg text-[#2F241D]"
            >
              <div className="text-center mb-6">
                <h1 className="font-dynapuff font-bold text-3xl sm:text-4xl text-[#2F241D]">
                  Who Are You?
                </h1>
                <p className="font-nunito font-semibold text-base text-[#6A6158] mt-2">
                  Begin your journey by telling us who you are.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-5">
                <div>
                  <label className="block font-baloo font-bold text-base text-[#2F241D] mb-1.5">
                    X Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-dynapuff font-bold text-lg text-[#2F241D]/40">
                      @
                    </span>
                    <input
                      type="text"
                      value={xHandleInput}
                      onChange={(e) => setXHandleInput(e.target.value)}
                      placeholder="username"
                      className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-[#2F241D] bg-white font-nunito font-bold text-lg text-[#2F241D] focus:outline-none focus:ring-2 focus:ring-[#82C66A] shadow-xs"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {errorMessage && (
                  <p className="font-patrick font-bold text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-dynapuff font-bold text-lg py-3.5 rounded-full bg-[#82C66A] text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#72B65A] active:translate-y-0.5 cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  Continue →
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border-2 border-[#2F241D] shadow-lg text-[#2F241D]"
            >
              <div className="text-center mb-6">
                <h1 className="font-dynapuff font-bold text-3xl sm:text-4xl text-[#2F241D]">
                  Earn Your Place
                </h1>
                <p className="font-nunito font-semibold text-base text-[#6A6158] mt-2">
                  Click each task card to open and complete sanctuary tasks sequentially.
                </p>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 mb-6">
                {SOCIAL_TASKS.map((task, idx) => {
                  const done = isTaskCompleted(task.id);
                  const prevDone = idx === 0 || isTaskCompleted(SOCIAL_TASKS[idx - 1].id);
                  const isLocked = !prevDone;
                  const isChecking = Boolean(pendingTasks[task.id]);
                  const countdown = pendingTasks[task.id];

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: isLocked ? 0.55 : 1, y: 8 }}
                      animate={{
                        opacity: isLocked ? 0.55 : 1,
                        y: 0
                      }}
                      whileHover={
                        !isLocked && !done && !isChecking
                          ? { y: -2, boxShadow: '0 6px 16px rgba(47,36,29,0.12)' }
                          : {}
                      }
                      whileTap={
                        !isLocked && !done && !isChecking
                          ? { scale: 0.985 }
                          : {}
                      }
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        if (!isLocked && !done && !isChecking) {
                          handleTaskClick(task.id, getTaskLink(task.id));
                        }
                      }}
                      className={`relative p-4 sm:p-4.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 group ${
                        done
                          ? 'bg-[#EEF7E8] border-[#82C66A]/70 cursor-default select-none shadow-xs'
                          : isChecking
                          ? 'bg-[#FFFDF8] border-[#82C66A] ring-2 ring-[#82C66A]/20 shadow-md cursor-wait'
                          : !isLocked
                          ? 'bg-white border-[#2F241D] hover:border-[#82C66A] shadow-xs cursor-pointer'
                          : 'bg-gray-50/70 border-gray-300 opacity-55 cursor-not-allowed pointer-events-none select-none'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Task Checkmark / Spinner / Lock / Number Badge */}
                        <div className="shrink-0">
                          {done ? (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: [0, 1.25, 1], opacity: 1 }}
                              transition={{ duration: 0.35, ease: 'easeOut' }}
                              className="w-9 h-9 rounded-xl bg-[#82C66A] text-white flex items-center justify-center shadow-xs"
                            >
                              <Check className="w-5 h-5 stroke-[3]" />
                            </motion.div>
                          ) : isChecking ? (
                            <div className="w-9 h-9 rounded-xl bg-[#82C66A]/20 text-[#4D7A39] border border-[#82C66A]/50 flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            </div>
                          ) : isLocked ? (
                            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center">
                              <Lock className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#FFF8F0] text-[#2F241D] border border-[#2F241D]/20 flex items-center justify-center font-dynapuff font-bold text-xs group-hover:border-[#82C66A] group-hover:bg-[#EEF7E8] transition-colors">
                              #{idx + 1}
                            </div>
                          )}
                        </div>

                        {/* Task Text & Status */}
                        <div className="flex flex-col">
                          <span
                            className={`font-baloo font-bold text-sm sm:text-base ${
                              done
                                ? 'text-[#4D7A39]'
                                : isLocked
                                ? 'text-gray-400'
                                : 'text-[#2F241D]'
                            }`}
                          >
                            {task.label}
                          </span>
                          {isChecking && (
                            <span className="font-patrick font-bold text-xs text-[#4D7A39] animate-pulse flex items-center gap-1 mt-0.5">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Checking... {countdown}s
                            </span>
                          )}
                          {done && (
                            <span className="font-patrick font-bold text-xs text-[#82C66A] flex items-center gap-1 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          )}
                          {isLocked && (
                            <span className="font-patrick font-bold text-xs text-gray-400 mt-0.5">
                              Locked (Complete #{idx} first)
                            </span>
                          )}
                          {!done && !isChecking && !isLocked && (
                            <span className="font-patrick font-bold text-xs text-[#6A6158] group-hover:text-[#4D7A39] transition-colors mt-0.5">
                              Click card to open task
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Icon Indicator (NO text buttons) */}
                      <div className="shrink-0 flex items-center">
                        {done ? (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="p-1.5 rounded-full bg-[#82C66A]/20 text-[#82C66A]"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </motion.div>
                        ) : isChecking ? (
                          <div className="p-1.5 rounded-full bg-[#82C66A]/15 text-[#4D7A39]">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          </div>
                        ) : isLocked ? (
                          <div className="p-1.5 rounded-full bg-gray-100 text-gray-400">
                            <Lock className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-[#FFF8F0] text-[#2F241D]/60 border border-[#2F241D]/20 group-hover:bg-[#82C66A] group-hover:text-white group-hover:border-[#2F241D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shadow-xs">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {errorMessage && (
                <p className="font-patrick font-bold text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 mb-4">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={proceedToStep3Wallet}
                disabled={!areAllSocialTasksCompleted()}
                className={`w-full font-dynapuff font-bold text-base py-3.5 rounded-full border-2 border-[#2F241D] transition-all ${
                  areAllSocialTasksCompleted()
                    ? 'bg-[#82C66A] text-white shadow-[2px_3px_0px_#2F241D] hover:bg-[#72B65A] cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                }`}
              >
                Continue to Wallet →
              </button>
            </motion.div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border-2 border-[#2F241D] shadow-lg text-[#2F241D]"
            >
              <div className="text-center mb-6">
                <h1 className="font-dynapuff font-bold text-3xl sm:text-4xl text-[#2F241D]">
                  Plant Your Root
                </h1>
                <p className="font-nunito font-semibold text-base text-[#6A6158] mt-2">
                  Choose the wallet where your Wardling may one day find you.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); submitStep3Wallet(walletInput); }} className="space-y-5">
                <div>
                  <label className="block font-baloo font-bold text-base text-[#2F241D] mb-1.5">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#2F241D] bg-white font-mono font-bold text-sm sm:text-base text-[#2F241D] focus:outline-none focus:ring-2 focus:ring-[#82C66A] shadow-xs"
                    required
                    autoFocus
                  />
                </div>

                {errorMessage && (
                  <p className="font-patrick font-bold text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                    {errorMessage}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-1/3 font-baloo font-bold text-base py-3.5 rounded-full bg-white text-[#2F241D] border-2 border-[#2F241D] hover:bg-gray-100 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 font-dynapuff font-bold text-base sm:text-lg py-3.5 rounded-full bg-[#82C66A] text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#72B65A] cursor-pointer"
                  >
                    Save Wallet →
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border-2 border-[#2F241D] shadow-lg text-[#2F241D]"
            >
              <div className="text-center mb-6">
                <h1 className="font-dynapuff font-bold text-3xl sm:text-4xl text-[#2F241D]">
                  Paste Comment Link
                </h1>
                <p className="font-nunito font-semibold text-base text-[#6A6158] mt-2">
                  Paste the link to your comment on the pinned post to complete your submission.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); submitStep4CommentLink(commentLinkInput); }} className="space-y-5">
                <div>
                  <label className="block font-baloo font-bold text-base text-[#2F241D] mb-1.5">
                    X Comment URL
                  </label>
                  <input
                    type="url"
                    value={commentLinkInput}
                    onChange={(e) => setCommentLinkInput(e.target.value)}
                    placeholder="https://x.com/username/status/..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#2F241D] bg-white font-nunito font-bold text-sm sm:text-base text-[#2F241D] focus:outline-none focus:ring-2 focus:ring-[#82C66A] shadow-xs"
                    required
                    autoFocus
                  />
                </div>

                {errorMessage && (
                  <p className="font-patrick font-bold text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                    {errorMessage}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-1/3 font-baloo font-bold text-base py-3.5 rounded-full bg-white text-[#2F241D] border-2 border-[#2F241D] hover:bg-gray-100 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 font-dynapuff font-bold text-base sm:text-lg py-3.5 rounded-full bg-[#82C66A] text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#72B65A] cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 fill-white" />
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* FINAL CONFIRMATION */}
          {currentStep === 5 && application && (
            <motion.div
              key="step-final"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full flex flex-col items-center space-y-6"
            >
              <div className="text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#EEF7E8] border border-[#82C66A]/40 font-patrick font-bold text-sm text-[#4D7A39] mb-2 shadow-xs">
                  ✨ Application Planted Successfully
                </span>
                <h1 className="font-dynapuff font-bold text-3xl sm:text-4xl text-[#2F241D] tracking-tight">
                  YOUR STORY HAS TAKEN ROOT
                </h1>
              </div>

              {/* Sanctuary Token Bound Card */}
              <div className="w-full p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border-2 border-[#2F241D] shadow-lg text-[#2F241D]">
                <div className="flex items-center justify-between border-b-2 border-[#2F241D]/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <span className="font-dynapuff font-bold text-base text-[#2F241D]">
                      SANCTUARY TOKEN
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF7E8] border border-[#82C66A]/30 font-patrick font-bold text-xs text-[#2F241D]">
                    <span className="w-2 h-2 rounded-full bg-[#82C66A] animate-pulse-dot" />
                    Status: {application.status === 'pending' ? 'Growing' : application.status}
                  </div>
                </div>

                <div className="space-y-2.5 font-nunito text-sm sm:text-base">
                  <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-[#2F241D]">
                    <span className="font-bold text-[#6A6158]">Bound to:</span>
                    <span className="font-dynapuff font-bold text-[#2F241D]">
                      {formatUsername(application.x_handle)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-[#2F241D]">
                    <span className="font-bold text-[#6A6158]">Wallet:</span>
                    <span className="font-mono font-bold text-[#2F241D]">
                      {truncateWallet(application.wallet_address)}
                    </span>
                  </div>

                  {application.comment_link && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-[#2F241D]">
                      <span className="font-bold text-[#6A6158]">Comment Link:</span>
                      <a
                        href={application.comment_link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-nunito font-bold text-[#4D7A39] hover:underline flex items-center gap-1 text-xs sm:text-sm truncate max-w-[160px]"
                      >
                        <span>View Comment</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-[#2F241D]/20 my-4" />

                <div className="space-y-3 font-nunito text-xs sm:text-sm text-[#6A6158] leading-relaxed text-center sm:text-left">
                  <p className="font-semibold italic text-[#2F241D]">
                    Every Keeper begins with a single seed.
                  </p>
                  <p>
                    Your application has been planted within the Sanctuary and is now waiting to bloom.
                  </p>
                  <p>
                    The chosen Keepers will be revealed on our official X account.
                  </p>
                  <p className="font-bold text-[#2F241D] pt-1">
                    Thank you for helping protect the world of Wardlings.
                  </p>
                </div>
              </div>

              <button
                onClick={onBackToSanctuary}
                className="font-dynapuff font-bold text-base px-6 py-3 rounded-full bg-[#82C66A] text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#72B65A] cursor-pointer transition-all"
              >
                Return to Sanctuary Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full text-center relative z-20 pt-4 pb-2">
        <p className="font-patrick font-bold text-sm text-[#6A6158]">
          🌿 Wardlings Sanctuary • A Peaceful Forest Realm
        </p>
      </footer>

      <WhitelistSuccessPopup open={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} />
    </div>
  );
};

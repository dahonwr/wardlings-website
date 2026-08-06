import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ExternalLink, ArrowRight, ArrowLeft, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Settings, Application } from '../types';
import { submitApplication } from '../lib/storage';
import { WardlingCharacter } from './WardlingCharacter';
import { WardlingsProgressTracker } from './WardlingsProgressTracker';

interface KeeperModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
}

export const KeeperModal: React.FC<KeeperModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 'animating' | 4>(1);

  // Form State
  const [twitterUsername, setTwitterUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({
    follow: false,
    like: false,
    repost: false,
    comment: false
  });

  // Validation & Submission State
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  // Reset form when modal opens
  const handleModalClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setErrorMsg('');
      setTwitterUsername('');
      setWalletAddress('');
      setCompletedTasks({ follow: false, like: false, repost: false, comment: false });
      setSubmittedApp(null);
    }, 400);
  };

  // Step 1 validation
  const handleStep1Continue = () => {
    const clean = twitterUsername.trim().replace(/^@/, '');
    if (!clean || clean.length < 2) {
      setErrorMsg('Please enter a valid X (Twitter) username.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  // Step 2 task click
  const handleTaskClick = (key: 'follow' | 'like' | 'repost' | 'comment', url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setCompletedTasks(prev => ({ ...prev, [key]: true }));
  };

  const allTasksDone = Object.values(completedTasks).every(Boolean);

  const handleStep2Continue = () => {
    if (!allTasksDone) {
      setErrorMsg('Please complete all 4 Sanctuary tasks to continue.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  // EVM Wallet validation
  const isValidEVM = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
  };

  // Step 3 submission & transition animation
  const handlePlantApplication = async () => {
    const cleanWallet = walletAddress.trim();
    if (!isValidEVM(cleanWallet)) {
      setErrorMsg('Please enter a valid Ethereum wallet address starting with 0x (42 characters).');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const result = await submitApplication({
      twitter_username: twitterUsername.trim(),
      wallet_address: cleanWallet,
      completed_tasks: true
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to submit application.');
      return;
    }

    if (result.application) {
      setSubmittedApp(result.application);
    }

    // Trigger magical planting animation
    setStep('animating');

    setTimeout(() => {
      setStep(4);
      // Trigger celebrate confetti
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#7EBE69', '#F7BFD5', '#FDE047', '#DFF4FF']
      });
    }, 2800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Darkened overlay background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={handleModalClose}
          className="fixed inset-0 bg-[#2B2B2B]"
        />

        {/* Closing Tree Curtain Animations */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '-80%' }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed top-0 bottom-0 left-0 w-1/2 bg-[#7C5B46] border-r-4 border-[#2B2B2B] pointer-events-none z-40 opacity-20 hidden md:block"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: '80%' }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed top-0 bottom-0 right-0 w-1/2 bg-[#7C5B46] border-l-4 border-[#2B2B2B] pointer-events-none z-40 opacity-20 hidden md:block"
        />

        {/* Floating leaves overlay */}
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute top-10 left-1/4 text-[#7EBE69] animate-leaf-fall-1">
            🍃
          </div>
          <div className="absolute top-12 right-1/4 text-[#F7BFD5] animate-leaf-fall-2">
            🌸
          </div>
        </div>

        {/* Main Portal Modal Window */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-50 w-full max-w-xl cozy-card p-6 sm:p-10 bg-[#FFF9EF] overflow-hidden my-auto"
        >
          {/* Close button */}
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#FFF9EF] border-2 border-[#2B2B2B] hover:bg-[#F7BFD5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tape strip */}
          <div className="tape-strip absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 rotate-1 flex items-center justify-center">
            <span className="font-patrick font-bold text-xs text-[#7C5B46]">
              🌿 KEEPER PORTAL
            </span>
          </div>

          {/* Wardlings Progress Tracker */}
          <div className="pt-2 pb-2">
            <WardlingsProgressTracker
              currentStep={step === 'animating' ? 3 : step}
            />
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 mt-2">
              <div className="text-center space-y-2">
                <span className="font-patrick font-bold text-sm px-3 py-1 rounded-full bg-[#D9F5C2] border-2 border-[#2B2B2B] text-[#2B2B2B]">
                  STEP 1 — BEGIN YOUR JOURNEY
                </span>
                <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2B2B2B] pt-1">
                  What is your name, Keeper?
                </h2>
                <p className="font-nunito font-semibold text-base text-[#2B2B2B]/80">
                  Every Keeper has a name. Enter your X username so the Wardlings know who has arrived.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-100 border-2 border-red-400 text-red-700 font-nunito font-bold text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="font-patrick font-bold text-base text-[#7C5B46] block">
                  X Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-dynapuff text-base text-[#7C5B46]">
                    @
                  </span>
                  <input
                    type="text"
                    value={twitterUsername}
                    onChange={(e) => setTwitterUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#FFF9EF] border-3 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] font-nunito font-bold text-lg text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#7EBE69]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  onClick={handleStep1Continue}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full font-dynapuff font-bold text-lg py-3.5 rounded-2xl bg-[#F7BFD5] text-[#2B2B2B] border-3 border-[#2B2B2B] shadow-[3px_4px_0px_#2B2B2B] hover:bg-[#f3a6c3] cursor-pointer flex items-center justify-center gap-2"
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 mt-2">
              <div className="text-center space-y-2">
                <span className="font-patrick font-bold text-sm px-3 py-1 rounded-full bg-[#F7BFD5] border-2 border-[#2B2B2B] text-[#2B2B2B]">
                  STEP 2 — EARN THE WARDLINGS' TRUST
                </span>
                <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2B2B2B] pt-1">
                  Complete Sanctuary Tasks
                </h2>
                <p className="font-nunito font-semibold text-base text-[#2B2B2B]/80">
                  Complete each task to show your support for the Sanctuary.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-100 border-2 border-red-400 text-red-700 font-nunito font-bold text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                {[
                  { key: 'follow', title: 'Follow @WardlingsNFT', url: settings.twitter_follow },
                  { key: 'like', title: 'Like the pinned post', url: settings.twitter_like },
                  { key: 'repost', title: 'Repost the pinned post', url: settings.twitter_repost },
                  { key: 'comment', title: 'Comment on the pinned post', url: settings.twitter_comment }
                ].map((task) => {
                  const isDone = completedTasks[task.key as keyof typeof completedTasks];

                  return (
                    <div
                      key={task.key}
                      onClick={() => handleTaskClick(task.key as any, task.url)}
                      className={`p-3.5 rounded-2xl border-3 border-[#2B2B2B] transition-all cursor-pointer flex items-center justify-between ${
                        isDone ? 'bg-[#D9F5C2] shadow-[2px_2px_0px_#2B2B2B]' : 'bg-[#FFF9EF] hover:bg-[#DFF4FF] shadow-[2px_3px_0px_#2B2B2B]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-md border-2 border-[#2B2B2B] flex items-center justify-center ${isDone ? 'bg-[#7EBE69] text-white' : 'bg-white'}`}>
                          {isDone && <CheckCircle2 className="w-5 h-5 text-white stroke-[3]" />}
                        </div>
                        <span className="font-baloo font-bold text-base text-[#2B2B2B]">
                          {task.title}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#7C5B46]" />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-2xl bg-[#FFF9EF] border-3 border-[#2B2B2B] font-baloo font-bold text-base text-[#2B2B2B] hover:bg-stone-200 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <motion.button
                  onClick={handleStep2Continue}
                  disabled={!allTasksDone}
                  whileHover={allTasksDone ? { scale: 1.02 } : {}}
                  whileTap={allTasksDone ? { scale: 0.98 } : {}}
                  className={`flex-1 font-dynapuff font-bold text-lg py-3.5 rounded-2xl border-3 border-[#2B2B2B] transition-all flex items-center justify-center gap-2 ${
                    allTasksDone
                      ? 'bg-[#7EBE69] text-white shadow-[3px_4px_0px_#2B2B2B] hover:bg-[#68a853] cursor-pointer'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                  }`}
                >
                  I've completed the tasks →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 mt-2">
              <div className="text-center space-y-2">
                <span className="font-patrick font-bold text-sm px-3 py-1 rounded-full bg-[#DFF4FF] border-2 border-[#2B2B2B] text-[#2B2B2B]">
                  STEP 3 — PLANT YOUR ROOTS
                </span>
                <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2B2B2B] pt-1">
                  Enter Your Wallet Address
                </h2>
                <p className="font-nunito font-semibold text-base text-[#2B2B2B]/80">
                  Enter the wallet that will become part of the Sanctuary.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-100 border-2 border-red-400 text-red-700 font-nunito font-bold text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="font-patrick font-bold text-base text-[#7C5B46] block">
                  EVM Wallet Address (Ethereum)
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF9EF] border-3 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] font-mono text-sm text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#7EBE69]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-2xl bg-[#FFF9EF] border-3 border-[#2B2B2B] font-baloo font-bold text-base text-[#2B2B2B] hover:bg-stone-200 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <motion.button
                  onClick={handlePlantApplication}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 font-dynapuff font-bold text-lg py-3.5 rounded-2xl bg-[#7EBE69] text-white border-3 border-[#2B2B2B] shadow-[3px_4px_0px_#2B2B2B] hover:bg-[#68a853] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Planting Seed...' : 'Plant My Application →'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ANIMATING TRANSITION BETWEEN STEP 3 & STEP 4 */}
          {step === 'animating' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              {/* Seed drops into soil animation */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <motion.div
                  animate={{ y: [ -40, 20 ], scale: [1, 0.8] }}
                  transition={{ duration: 1.2, ease: 'easeIn' }}
                  className="w-8 h-10 bg-[#FDE047] rounded-full border-2 border-[#2B2B2B] z-10"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 1.3, duration: 1 }}
                  className="absolute bottom-2 text-4xl"
                >
                  🌱
                </motion.div>
              </div>

              <div className="space-y-1">
                <h3 className="font-dynapuff font-bold text-2xl text-[#2B2B2B]">
                  Planting Your Seed...
                </h3>
                <p className="font-patrick text-lg text-[#7C5B46]">
                  The Sanctuary soil welcomes your application!
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — SUCCESS SANCTUARY TOKEN CARD */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 mt-1 text-center">
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#D9F5C2] border-2 border-[#2B2B2B]">
                <Sparkles className="w-4 h-4 text-[#7EBE69]" />
                <span className="font-patrick font-bold text-sm text-[#7C5B46]">
                  YOUR STORY HAS TAKEN ROOT
                </span>
              </div>

              {/* Sanctuary Token Card */}
              <div className="cozy-card p-6 bg-gradient-to-b from-[#FFF9EF] via-[#FFF9EF] to-[#D9F5C2] border-3 border-[#2B2B2B] shadow-[4px_6px_0px_#2B2B2B] text-left relative overflow-hidden">
                <div className="tape-strip absolute -top-2 right-6 w-20 h-5 rotate-2" />

                <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#7C5B46]/30">
                  <span className="font-dynapuff font-bold text-xl text-[#2B2B2B] flex items-center gap-2">
                    🌿 SANCTUARY TOKEN
                  </span>
                  <span className="font-patrick font-bold text-sm px-3 py-0.5 rounded-full bg-[#7EBE69] text-white border-2 border-[#2B2B2B]">
                    Status: Growing
                  </span>
                </div>

                <div className="py-3 space-y-1.5 font-nunito font-semibold text-sm text-[#2B2B2B]">
                  <div className="flex justify-between">
                    <span className="text-[#7C5B46]">Bound to:</span>
                    <span className="font-bold">@{twitterUsername.replace(/^@/, '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7C5B46]">EVM Wallet:</span>
                    <span className="font-mono text-xs">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                </div>

                <div className="my-2 border-t border-[#2B2B2B]/20" />

                <p className="font-nunito font-semibold text-xs sm:text-sm text-[#2B2B2B]/90 leading-relaxed pt-1">
                  Every Keeper begins with a single seed. Your application has been planted within the Sanctuary and is now waiting to bloom. The chosen Keepers will be revealed on our official X account.
                  Thank you for helping protect the world of Wardlings.
                </p>
              </div>

              {/* Wholesome Wardling Illustration holding a glowing seedling with both hands */}
              <div className="flex flex-col items-center justify-center py-2">
                <WardlingCharacter variant="holding-seed" size={170} />
              </div>

              <button
                onClick={handleModalClose}
                className="w-full font-dynapuff font-bold text-lg py-3 rounded-2xl bg-[#7EBE69] text-white border-3 border-[#2B2B2B] shadow-[3px_4px_0px_#2B2B2B] hover:bg-[#68a853] cursor-pointer"
              >
                Return to Sanctuary
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

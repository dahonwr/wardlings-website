import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiscordIcon } from './SocialIcons';
import { Settings } from '../types';

const DISCORD_INVITE_URL = 'https://discord.com/invite/AXjAt95DK';
const API_STATUS_URL = 'https://wardlings-og-api.xethrial.workers.dev/api/discord/status';
const API_CLAIM_URL = 'https://wardlings-og-api.xethrial.workers.dev/api/discord/claim';

const CONFETTI_COLORS = ['#82C66A', '#5865F2', '#F7BFD5', '#FDE047', '#DFF4FF', '#2F241D'];

interface DiscordClaimPageProps {
  onBackToHome: () => void;
  settings?: Settings;
}

type ClaimStage =
  | 'join_prompt'  // Initial screen with Join button
  | 'claiming'     // Joined! Calling claim API
  | 'success'      // Roles successfully claimed!
  | 'expired'      // Session expired
  | 'missing_token'; // No token provided in URL

export const DiscordClaimPage: React.FC<DiscordClaimPageProps> = ({
  onBackToHome
}) => {
  // Read claim token from URL synchronously
  const [claimToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
      );
      const token = params.get('claim') || hashParams.get('claim');
      return token ? token.trim() : null;
    } catch {
      return null;
    }
  });

  const [stage, setStage] = useState<ClaimStage>(() =>
    claimToken ? 'join_prompt' : 'missing_token'
  );
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  const isRequestInFlight = useRef(false);
  const isMountedRef = useRef(true);

  // Confetti celebration
  const triggerCelebration = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    confetti({
      particleCount: 80,
      spread: 75,
      origin: { x: 0.5, y: 0.45 },
      colors: CONFETTI_COLORS,
      zIndex: 99999
    });
  }, []);

  // Claim roles once membership is confirmed
  const performClaim = useCallback(async (token: string) => {
    if (!isMountedRef.current) return;
    setStage('claiming');
    setIsPolling(false);

    try {
      const res = await fetch(API_CLAIM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: token })
      });

      const data = await res.json().catch(() => ({}));

      if (!isMountedRef.current) return;

      if (data && (data.success || data.claimed)) {
        const roles: string[] = Array.isArray(data.assigned_roles)
          ? data.assigned_roles
          : Array.isArray(data.roles)
          ? data.roles
          : [];
        setAssignedRoles(roles);
        setStage('success');
        triggerCelebration();
      } else if (
        data?.error &&
        (data.error.toLowerCase().includes('expired') || data.error.toLowerCase().includes('invalid'))
      ) {
        setStage('expired');
        setErrorMessage('Your Discord session expired. Please verify Discord again.');
      } else {
        setStage('expired');
        setErrorMessage(data?.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error claiming Discord role:', err);
      setStage('expired');
      setErrorMessage('Something went wrong. Please try again.');
    }
  }, [triggerCelebration]);

  // Check Discord Membership Status
  const checkStatus = useCallback(async () => {
    if (!claimToken || !isMountedRef.current || isRequestInFlight.current) {
      return;
    }

    isRequestInFlight.current = true;

    try {
      const res = await fetch(API_STATUS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claimToken })
      });

      const data = await res.json().catch(() => ({}));

      if (!isMountedRef.current) return;

      if (data.joined === true || (data.success === true && data.joined === true)) {
        // Stop polling and immediately claim matching roles
        setIsPolling(false);
        await performClaim(claimToken);
      } else if (
        data.success === false &&
        data.error &&
        (data.error.toLowerCase().includes('expired') || data.error.toLowerCase().includes('invalid'))
      ) {
        // Expired token
        setIsPolling(false);
        setStage('expired');
        setErrorMessage('Your Discord session expired. Please verify Discord again.');
      }
    } catch (err) {
      console.warn('Membership status check failed:', err);
    } finally {
      isRequestInFlight.current = false;
    }
  }, [claimToken, performClaim]);

  // Polling hook: runs every 2s once user clicks "JOIN THE SANCTUARY"
  useEffect(() => {
    isMountedRef.current = true;

    if (isPolling && claimToken) {
      checkStatus();

      const interval = setInterval(() => {
        checkStatus();
      }, 2000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [checkStatus, isPolling, claimToken]);

  // Clean URL claim parameter without losing state
  useEffect(() => {
    if (typeof window !== 'undefined' && claimToken) {
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      } catch {}
    }
  }, [claimToken]);

  const handleJoinClick = () => {
    setIsPolling(true);
    window.open(DISCORD_INVITE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen text-[#2F241D] relative font-nunito selection:bg-[#F7BFD5] selection:text-[#2F241D] flex flex-col justify-between overflow-x-hidden bg-[#FFFDF8]">
      {/* Background Decorative Soft Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#E5F5D8]/40 blur-3xl" />
        <div className="absolute top-[30%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#EEF2FE]/50 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#FCE8F0]/40 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-xs border border-[#2F241D]/15 font-patrick font-bold text-sm text-[#2F241D] hover:bg-white transition-transform hover:-translate-x-0.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#5C8E47]" />
          <span>Back to Wardlings</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#2F241D]/15 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#5865F2]" />
          <span className="font-patrick font-bold text-xs text-[#2F241D] tracking-wide uppercase">
            Discord Role Claim
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-lg mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full bg-white rounded-3xl border-2 border-[#2F241D] shadow-[4px_6px_0px_#2F241D] p-6 sm:p-8 text-[#2F241D] relative overflow-hidden"
        >
          {/* STAGE 1: JOIN SANCTUARY PROMPT */}
          {stage === 'join_prompt' && (
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF2FE] text-[#5865F2] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#5865F2]/25 mb-4">
                <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
                <span>DISCORD CONNECTED</span>
              </div>

              <h1 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
                JOIN THE SANCTUARY
              </h1>

              <p className="font-nunito font-bold text-sm sm:text-base text-[#2F241D] mt-3">
                Your Discord account is connected.
              </p>
              <p className="font-nunito font-semibold text-xs sm:text-sm text-[#6A6158] mt-1 mb-6 max-w-xs leading-relaxed">
                Join the Wardlings Discord to claim your allocation role.
              </p>

              {/* Waiting / Polling Status */}
              {isPolling && (
                <div className="w-full p-3 rounded-2xl bg-[#F4EEE4] border border-[#2F241D]/15 flex items-center justify-center gap-2 mb-5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#6A6158]" />
                  <span className="font-baloo font-bold text-xs text-[#6A6158]">
                    Waiting for you to join the Sanctuary...
                  </span>
                </div>
              )}

              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={handleJoinClick}
                  style={{ backgroundColor: '#5865F2' }}
                  className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4752C4] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <DiscordIcon className="w-5 h-5 text-white shrink-0" />
                  <span>JOIN THE SANCTUARY</span>
                  <ExternalLink className="w-4 h-4 text-white/80" />
                </button>

                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-full font-baloo font-bold text-sm py-2.5 rounded-full bg-white text-[#6A6158] hover:text-[#2F241D] border border-[#2F241D]/20 hover:bg-stone-100 transition-colors cursor-pointer tracking-wider uppercase"
                >
                  BACK
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: CLAIMING IN PROGRESS */}
          {stage === 'claiming' && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF7E8] border-2 border-[#2F241D] flex items-center justify-center mb-4 shadow-xs">
                <RefreshCw className="w-7 h-7 animate-spin text-[#3D6E29]" />
              </div>

              <h2 className="font-dynapuff font-bold text-2xl text-[#2F241D] tracking-tight">
                ASSIGNING ROLES...
              </h2>
              <p className="font-nunito font-semibold text-sm text-[#6A6158] mt-2 max-w-xs leading-relaxed">
                Verifying your allocation and assigning matching roles in Discord.
              </p>
            </div>
          )}

          {/* STAGE 3: SUCCESS STATE */}
          {stage === 'success' && (
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF7E8] text-[#3D6E29] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#3D6E29]/25 mb-4">
                <Sparkles className="w-4 h-4 text-[#5C8E47]" />
                <span>ROLES CLAIMED</span>
              </div>

              <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
                YOU'RE ALL SET
              </h2>
              <p className="font-nunito font-bold text-sm sm:text-base text-[#3D6E29] mt-2 mb-5">
                Welcome to the Sanctuary.
              </p>

              {/* Assigned Roles Card */}
              <div className="w-full p-4 rounded-2xl bg-[#EEF7E8] border-2 border-[#2F241D] shadow-xs mb-6 text-left">
                <span className="block font-patrick font-bold text-xs text-[#6A6158] uppercase mb-2 text-center">
                  Assigned Discord Roles
                </span>
                <div className="flex flex-col gap-2 w-full">
                  {assignedRoles.length > 0 ? (
                    assignedRoles.map((role) => (
                      <div
                        key={role}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-[#2F241D]/15 text-[#2F241D]"
                      >
                        <span className="font-dynapuff font-bold text-base sm:text-lg text-[#2F241D]">
                          {role}
                        </span>
                        <span className="inline-flex items-center gap-1 font-dynapuff font-bold text-sm text-[#3D6E29]">
                          <CheckCircle2 className="w-4 h-4 text-[#5C8E47]" />
                          <span>✓</span>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-[#2F241D]/15 text-[#2F241D]">
                      <span className="font-dynapuff font-bold text-base text-[#2F241D]">
                        Role Assigned
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-[#5C8E47]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full space-y-3">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#5865F2' }}
                  className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4752C4] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <DiscordIcon className="w-5 h-5 text-white shrink-0" />
                  <span>Open Wardlings Discord</span>
                </a>

                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-full font-baloo font-bold text-sm py-2.5 rounded-full bg-white text-[#2F241D] border border-[#2F241D]/20 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Back to Wardlings
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: EXPIRED STATE */}
          {stage === 'expired' && (
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-[#2F241D] flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>

              <h2 className="font-dynapuff font-bold text-xl sm:text-2xl text-[#2F241D] tracking-tight">
                SESSION EXPIRED
              </h2>
              <p className="font-nunito font-semibold text-sm text-[#6A6158] mt-2 mb-6 max-w-xs leading-relaxed">
                {errorMessage || 'Your Discord session expired. Please verify Discord again.'}
              </p>

              <button
                type="button"
                onClick={onBackToHome}
                style={{ backgroundColor: '#5C8E47' }}
                className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Back to Wardlings</span>
              </button>
            </div>
          )}

          {/* STAGE 5: MISSING TOKEN STATE */}
          {stage === 'missing_token' && (
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-[#2F241D] flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>

              <h2 className="font-dynapuff font-bold text-xl sm:text-2xl text-[#2F241D] tracking-tight">
                DISCORD CLAIM
              </h2>
              <p className="font-nunito font-semibold text-sm text-[#6A6158] mt-2 mb-6 max-w-xs leading-relaxed">
                Discord verification could not be completed.
              </p>

              <button
                type="button"
                onClick={onBackToHome}
                style={{ backgroundColor: '#5C8E47' }}
                className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Back to Wardlings</span>
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#2F241D]/10 py-4 px-4 text-center">
        <p className="font-patrick font-bold text-xs text-[#6A6158]">
          WARDLINGS SANCTUARY © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

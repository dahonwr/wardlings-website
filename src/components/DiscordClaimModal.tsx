import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, X, ArrowRight, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiscordIcon } from './SocialIcons';

const DISCORD_INVITE_URL = 'https://discord.com/invite/AXjAt95DK';
const API_STATUS_URL = 'https://wardlings-og-api.xethrial.workers.dev/api/discord/status';
const API_CLAIM_URL = 'https://wardlings-og-api.xethrial.workers.dev/api/discord/claim';

const CONFETTI_COLORS = ['#82C66A', '#5865F2', '#F7BFD5', '#FDE047', '#DFF4FF', '#2F241D'];

interface DiscordClaimModalProps {
  claimToken: string;
  onClose: () => void;
  onSuccess?: (assignedRoles: string[]) => void;
}

type ModalStage =
  | 'join_prompt'  // User needs to join Discord or is being checked
  | 'checking'     // Checking status / joined
  | 'claiming'     // Joined! Claiming roles...
  | 'success'      // Roles successfully claimed!
  | 'expired'      // Session expired
  | 'error';       // Other non-fatal error

export const DiscordClaimModal: React.FC<DiscordClaimModalProps> = ({
  claimToken,
  onClose,
  onSuccess
}) => {
  const [stage, setStage] = useState<ModalStage>('join_prompt');
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasClickedJoin, setHasClickedJoin] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const isRequestInFlight = useRef(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Confetti celebration
  const triggerCelebration = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: CONFETTI_COLORS,
      zIndex: 99999
    });
  }, []);

  // Claim roles once joined
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
        if (onSuccess) {
          onSuccess(roles);
        }
      } else if (
        data?.error &&
        (data.error.toLowerCase().includes('expired') || data.error.toLowerCase().includes('invalid'))
      ) {
        setStage('expired');
        setErrorMessage('Your Discord session expired. Please verify Discord again.');
      } else {
        setStage('expired');
        setErrorMessage(data?.error || 'Your Discord session expired. Please verify Discord again.');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error claiming Discord role:', err);
      setStage('expired');
      setErrorMessage('Your Discord session expired. Please verify Discord again.');
    }
  }, [onSuccess, triggerCelebration]);

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
        // Stop polling and claim roles immediately
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
      console.warn('Membership polling check failed:', err);
    } finally {
      isRequestInFlight.current = false;
    }
  }, [claimToken, performClaim]);

  // Setup 2-second polling interval after user clicks Join
  useEffect(() => {
    isMountedRef.current = true;

    if (isPolling) {
      // Immediate first check
      checkStatus();

      const interval = setInterval(() => {
        checkStatus();
      }, 2000);

      pollTimerRef.current = interval;

      return () => {
        clearInterval(interval);
      };
    }
  }, [checkStatus, isPolling]);

  const handleJoinClick = () => {
    setHasClickedJoin(true);
    setIsPolling(true);
    window.open(DISCORD_INVITE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F241D]/60 backdrop-blur-xs font-nunito">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-[#FFFDF8] rounded-3xl border-2 border-[#2F241D] shadow-[4px_6px_0px_#2F241D] p-6 sm:p-8 text-[#2F241D] relative overflow-hidden"
      >
        {/* Close / Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-full text-[#6A6158] hover:text-[#2F241D] hover:bg-[#2F241D]/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. JOIN DISCORD PROMPT */}
        {stage === 'join_prompt' && (
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF2FE] text-[#5865F2] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#5865F2]/20 mb-4">
              <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
              <span>DISCORD CONNECTED</span>
            </div>

            <h3 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
              JOIN THE SANCTUARY
            </h3>

            <p className="font-nunito font-bold text-sm sm:text-base text-[#2F241D] mt-3">
              Your Discord account is connected.
            </p>
            <p className="font-nunito font-semibold text-xs sm:text-sm text-[#6A6158] mt-1 mb-6 max-w-xs leading-relaxed">
              Join the Wardlings Discord to claim your allocation role.
            </p>

            {/* Checking Status Pill */}
            <div className="w-full p-3 rounded-2xl bg-[#F4EEE4] border border-[#2F241D]/15 flex items-center justify-center gap-2 mb-5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#6A6158]" />
              <span className="font-baloo font-bold text-xs text-[#6A6158]">
                {hasClickedJoin ? 'Checking Discord membership...' : 'Waiting for you to join...'}
              </span>
            </div>

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
                onClick={onClose}
                className="w-full font-baloo font-bold text-sm py-2.5 rounded-full bg-white text-[#6A6158] hover:text-[#2F241D] border border-[#2F241D]/20 hover:bg-stone-100 transition-colors cursor-pointer tracking-wider"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* 2. CLAIMING IN PROGRESS */}
        {stage === 'claiming' && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF7E8] border-2 border-[#2F241D] flex items-center justify-center mb-4 shadow-xs">
              <RefreshCw className="w-7 h-7 animate-spin text-[#3D6E29]" />
            </div>

            <h3 className="font-dynapuff font-bold text-2xl text-[#2F241D] tracking-tight">
              ASSIGNING ROLES...
            </h3>
            <p className="font-nunito font-semibold text-sm text-[#6A6158] mt-2 max-w-xs">
              We confirmed your membership and are assigning your verified allocation roles in Discord.
            </p>
          </div>
        )}

        {/* 3. SUCCESS STATE */}
        {stage === 'success' && (
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEF7E8] text-[#3D6E29] font-patrick font-bold text-xs sm:text-sm tracking-wide border border-[#3D6E29]/20 mb-4">
              <Sparkles className="w-4 h-4 text-[#5C8E47]" />
              <span>ROLES CLAIMED</span>
            </div>

            <h3 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
              YOU'RE ALL SET
            </h3>
            <p className="font-nunito font-bold text-sm sm:text-base text-[#3D6E29] mt-2 mb-5">
              Welcome to the Sanctuary.
            </p>

            {/* Assigned Roles List */}
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
                onClick={onClose}
                className="w-full font-baloo font-bold text-sm py-2.5 rounded-full bg-white text-[#2F241D] border border-[#2F241D]/20 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* 4. EXPIRED / ERROR STATE */}
        {stage === 'expired' && (
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-[#2F241D] flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>

            <h3 className="font-dynapuff font-bold text-xl sm:text-2xl text-[#2F241D] tracking-tight">
              SESSION EXPIRED
            </h3>
            <p className="font-nunito font-semibold text-sm text-[#6A6158] mt-2 mb-6 max-w-xs leading-relaxed">
              {errorMessage || 'Your Discord session expired. Please verify Discord again.'}
            </p>

            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#5C8E47' }}
              className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer inline-flex items-center justify-center gap-2 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>Verify Discord Again</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

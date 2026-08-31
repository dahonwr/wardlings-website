import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ArrowLeft, Leaf, Sprout } from 'lucide-react';

interface DiscordClaimPageProps {
  onBackToHome: () => void;
}

const LOGO_URL = '/assets/Logo.png';
const DISCORD_INVITE_URL = 'https://discord.com/invite/AXjAt95DK';
const API_BASE_URL = 'https://wardlings-og-api.xethrial.workers.dev';

// Map backend role values strictly to the 3 permitted emoji labels
export const mapBackendRoleToDisplay = (role: string): string => {
  const r = role.trim().toUpperCase();
  if (r === 'OG' || r === 'WARDLINGS' || r.includes('WARDLING')) {
    return '🪨 Wardlings';
  }
  if (r === 'GTD' || r === 'KEEPERS' || r.includes('KEEPER')) {
    return '🌼 Keepers';
  }
  if (r === 'FCFS' || r === 'CHOSEN' || r.includes('CHOSEN')) {
    return '✨ Chosen';
  }
  if (role.includes('🪨') || role.includes('🌼') || role.includes('✨')) {
    return role;
  }
  return role;
};

type ClaimStage =
  | 'no_token'      // No claim param provided
  | 'ready_to_join' // Connected, prompt to Join Discord
  | 'waiting'       // User clicked Join, polling Discord membership
  | 'claiming'      // Membership confirmed (joined === true), assigning role
  | 'success'       // Claimed successfully, show assigned roles
  | 'expired'       // Claim expired
  | 'error';        // General error

export const DiscordClaimPage: React.FC<DiscordClaimPageProps> = ({ onBackToHome }) => {
  const [claimToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
      );
      return params.get('claim') || hashParams.get('claim');
    } catch {
      return null;
    }
  });

  const [roles, setRoles] = useState<string[]>(() => {
    // Attempt to read previous winner allocation from session storage if present
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('wardlings_winner_state');
        if (raw) {
          const parsed = JSON.parse(raw);
          const allocs: string[] = parsed?.allocationResult?.allocations?.length
            ? parsed.allocationResult.allocations
            : parsed?.allocationResult?.allocation
            ? [parsed.allocationResult.allocation]
            : [];
          if (allocs.length > 0) {
            return allocs.map(mapBackendRoleToDisplay);
          }
        }
      } catch {}
    }
    return ['🪨 Wardlings'];
  });

  const [stage, setStage] = useState<ClaimStage>(() => (claimToken ? 'ready_to_join' : 'no_token'));
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isPollingRef = useRef<boolean>(false);
  const isRequestInFlightRef = useRef<boolean>(false);
  const pollIntervalRef = useRef<number | null>(null);

  // Scroll to top immediately when mounted
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Clean up polling timer on unmount
  useEffect(() => {
    return () => {
      isPollingRef.current = false;
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Execute the Role Claim API - strictly ONLY called when joined === true
  const performClaim = useCallback(async (token: string) => {
    setStage('claiming');
    try {
      const res = await fetch(`${API_BASE_URL}/api/discord/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: token })
      });

      const data = await res.json();

      if (res.ok && data.success && data.claimed) {
        const resultRoles = Array.isArray(data.assigned_roles) && data.assigned_roles.length > 0
          ? data.assigned_roles.map(mapBackendRoleToDisplay)
          : roles.length > 0
          ? roles
          : ['🪨 Wardlings'];
        setAssignedRoles(resultRoles);
        setStage('success');
      } else {
        if (data.error && (data.error.includes('expired') || data.error.includes('session'))) {
          setStage('expired');
          setErrorMessage('Your Discord session expired. Please verify Discord again.');
        } else {
          setStage('error');
          setErrorMessage('Something went wrong. Please try again.');
        }
      }
    } catch {
      setStage('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  }, [roles]);

  // Start polling status every 2 seconds without overlapping requests (ONLY after Join button click)
  const startPolling = useCallback((token: string) => {
    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    isPollingRef.current = true;
    setStage('waiting');

    const pollStatus = async () => {
      if (!isPollingRef.current || isRequestInFlightRef.current) return;

      isRequestInFlightRef.current = true;
      try {
        const res = await fetch(`${API_BASE_URL}/api/discord/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claim: token })
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403 || res.status === 410) {
            isPollingRef.current = false;
            if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
            setStage('expired');
            setErrorMessage('Your Discord session expired. Please verify Discord again.');
            return;
          }
        }

        const data = await res.json();

        // Check if session expired
        if (data.error && (data.error.includes('expired') || data.error.includes('session'))) {
          isPollingRef.current = false;
          if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
          setStage('expired');
          setErrorMessage('Your Discord session expired. Please verify Discord again.');
          return;
        }

        // Check user allocation roles from status payload if provided
        if (Array.isArray(data.allocations) && data.allocations.length > 0) {
          setRoles(data.allocations.map(mapBackendRoleToDisplay));
        } else if (Array.isArray(data.roles) && data.roles.length > 0) {
          setRoles(data.roles.map(mapBackendRoleToDisplay));
        }

        // If already claimed before, show success immediately
        if (data.claimed && Array.isArray(data.assigned_roles)) {
          isPollingRef.current = false;
          if (pollIntervalRef.current) {
            window.clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setAssignedRoles(data.assigned_roles.map(mapBackendRoleToDisplay));
          setStage('success');
          return;
        }

        // CRITICAL: ONLY proceed to claim when joined === true
        if (data.success && data.joined === true) {
          isPollingRef.current = false;
          if (pollIntervalRef.current) {
            window.clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          await performClaim(token);
        }
      } catch {
        // Continue polling on transient network hiccups
      } finally {
        isRequestInFlightRef.current = false;
      }
    };

    // Run first check after 1.5s then every 2s
    const initialTimer = window.setTimeout(pollStatus, 1500);
    pollIntervalRef.current = window.setInterval(pollStatus, 2000);

    return () => {
      window.clearTimeout(initialTimer);
    };
  }, [performClaim]);

  // Click Handler for "JOIN THE SANCTUARY"
  const handleJoinClick = () => {
    // Normal user-click navigation to avoid popup blockers
    window.open(DISCORD_INVITE_URL, '_blank', 'noopener,noreferrer');

    if (claimToken) {
      startPolling(claimToken);
    }
  };

  return (
    <div className="min-h-screen text-[#2F241D] relative font-nunito selection:bg-[#F7BFD5] selection:text-[#2F241D] flex flex-col justify-between overflow-x-hidden bg-[#FFFDF8]">
      {/* Background organic decorations */}
      <Leaf
        aria-hidden="true"
        className="hidden sm:block absolute top-16 left-4 lg:left-12 w-7 h-7 text-[#7EBE69]/20 -rotate-12 pointer-events-none"
      />
      <Sprout
        aria-hidden="true"
        className="hidden sm:block absolute top-28 right-4 lg:right-12 w-6 h-6 text-[#7EBE69]/20 rotate-12 pointer-events-none"
      />

      {/* Top Header */}
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

      {/* Centered Main Body */}
      <main className="flex-1 py-8 sm:py-16 px-4 sm:px-6 relative z-10 w-full flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto w-full flex flex-col items-center text-center">
          {/* Main Card Container */}
          <div className="w-full p-6 sm:p-9 rounded-3xl bg-white border-2 border-[#2F241D] shadow-[4px_6px_0px_#2F241D] text-[#2F241D]">
            <AnimatePresence mode="wait">
              {/* STATE 1: NO CLAIM TOKEN */}
              {stage === 'no_token' && (
                <motion.div
                  key="no-token-view"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-col items-center w-full"
                >
                  <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
                    Discord Verification
                  </h2>
                  <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] mt-3 mb-7 max-w-xs leading-relaxed">
                    Discord verification could not be completed.
                  </p>

                  <button
                    type="button"
                    onClick={onBackToHome}
                    style={{ backgroundColor: '#5C8E47' }}
                    className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    BACK TO WARDLINGS
                  </button>
                </motion.div>
              )}

              {/* STATE 2: READY TO JOIN / WAITING / CLAIMING */}
              {(stage === 'ready_to_join' || stage === 'waiting' || stage === 'claiming') && (
                <motion.div
                  key="ready-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Title & Connection description */}
                  <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
                    JOIN THE SANCTUARY
                  </h2>
                  <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] mt-2 mb-1">
                    Your Discord account is connected.
                  </p>
                  <p className="font-nunito font-semibold text-xs sm:text-sm text-[#6A6158] mb-5 max-w-xs leading-relaxed">
                    Join the Wardlings Discord to claim your role.
                  </p>

                  {/* Role Display Section */}
                  <div className="w-full p-4 rounded-2xl bg-[#FFFDF8] border-2 border-[#2F241D] shadow-xs mb-5 space-y-2">
                    <span className="block font-patrick font-bold text-xs text-[#6A6158] uppercase tracking-wider">
                      {roles.length > 1 ? 'YOUR SANCTUARY ROLES' : 'YOUR SANCTUARY ROLE'}
                    </span>

                    <div className="flex flex-col gap-2 w-full">
                      {roles.map((r) => (
                        <div
                          key={r}
                          className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-white border border-[#2F241D]/20 shadow-2xs"
                        >
                          <span className="font-dynapuff font-bold text-lg sm:text-xl text-[#3D6E29] tracking-wide">
                            {r}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WAITING STATE FEEDBACK (shown after user clicks Join) */}
                  {stage === 'waiting' && (
                    <div className="w-full p-4 rounded-2xl bg-[#F4EEE4] border-2 border-[#2F241D] shadow-xs text-center space-y-1 mb-5">
                      <div className="font-dynapuff font-bold text-sm sm:text-base text-[#2F241D] flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#5C8E47]" />
                        <span>WAITING FOR YOU</span>
                      </div>
                      <p className="font-nunito font-semibold text-xs sm:text-sm text-[#6A6158] leading-relaxed max-w-xs mx-auto">
                        Join the Wardlings Discord and we'll finish your role claim automatically.
                      </p>
                    </div>
                  )}

                  {/* ASSIGNING ROLE STATE (strictly only after joined === true) */}
                  {stage === 'claiming' && (
                    <div className="w-full p-4 rounded-2xl bg-[#EEF7E8] border-2 border-[#2F241D] shadow-xs text-center space-y-1 mb-5">
                      <div className="font-dynapuff font-bold text-sm sm:text-base text-[#3D6E29] flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#5C8E47]" />
                        <span>ASSIGNING ROLE</span>
                      </div>
                      <p className="font-nunito font-semibold text-xs sm:text-sm text-[#6A6158] leading-relaxed">
                        Assigning your Sanctuary role...
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="w-full space-y-3 pt-1">
                    <button
                      type="button"
                      onClick={handleJoinClick}
                      disabled={stage === 'claiming'}
                      style={{ backgroundColor: '#5C8E47' }}
                      className="w-full font-dynapuff font-bold text-base py-3.5 sm:py-4 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                      <span>JOIN THE SANCTUARY</span>
                    </button>

                    <button
                      type="button"
                      onClick={onBackToHome}
                      className="w-full font-baloo font-bold text-sm sm:text-base py-2.5 sm:py-3 rounded-full bg-white text-[#2F241D] border-2 border-[#2F241D] hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      BACK TO WARDLINGS
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STATE 3: SUCCESSFUL CLAIM */}
              {stage === 'success' && (
                <motion.div
                  key="success-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#EEF7E8] text-[#3D6E29] border border-[#3D6E29]/20 font-patrick font-bold text-xs sm:text-sm tracking-wide mb-3">
                    YOU'RE ALL SET
                  </div>

                  <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
                    YOU'RE ALL SET
                  </h2>
                  <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] mt-1.5 mb-5 leading-relaxed">
                    Welcome to the Sanctuary.
                  </p>

                  {/* Display Assigned Roles */}
                  <div className="w-full p-4 rounded-2xl bg-[#EEF7E8] border-2 border-[#2F241D] shadow-xs mb-6 space-y-2">
                    <span className="block font-patrick font-bold text-xs text-[#3D6E29] uppercase tracking-wider">
                      {assignedRoles.length > 1 ? 'ASSIGNED SANCTUARY ROLES' : 'ASSIGNED SANCTUARY ROLE'}
                    </span>

                    <div className="flex flex-col gap-2 w-full">
                      {(assignedRoles.length > 0 ? assignedRoles : roles).map((r) => (
                        <div
                          key={r}
                          className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-white border border-[#2F241D]/20 shadow-2xs"
                        >
                          <span className="font-dynapuff font-bold text-lg sm:text-xl text-[#3D6E29] tracking-wide">
                            {r}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onBackToHome}
                    style={{ backgroundColor: '#5C8E47' }}
                    className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    BACK TO WARDLINGS
                  </button>
                </motion.div>
              )}

              {/* STATE 4: SESSION EXPIRED */}
              {stage === 'expired' && (
                <motion.div
                  key="expired-view"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-col items-center w-full"
                >
                  <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
                    Session Expired
                  </h2>
                  <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] mt-3 mb-6 max-w-xs leading-relaxed">
                    {errorMessage || 'Your Discord session expired. Please verify Discord again.'}
                  </p>

                  <button
                    type="button"
                    onClick={onBackToHome}
                    style={{ backgroundColor: '#5C8E47' }}
                    className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    BACK TO WARDLINGS
                  </button>
                </motion.div>
              )}

              {/* STATE 5: GENERAL ERROR */}
              {stage === 'error' && (
                <motion.div
                  key="error-view"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-col items-center w-full"
                >
                  <h2 className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight">
                    Something Went Wrong
                  </h2>
                  <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] mt-3 mb-6 max-w-xs leading-relaxed">
                    {errorMessage || 'Something went wrong. Please try again.'}
                  </p>

                  <button
                    type="button"
                    onClick={onBackToHome}
                    style={{ backgroundColor: '#5C8E47' }}
                    className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#4F7A3D] cursor-pointer flex items-center justify-center transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    BACK TO WARDLINGS
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#2F241D]/10 py-4 px-4 text-center">
        <p className="font-patrick font-bold text-xs sm:text-sm text-[#6A6158]">
          © {new Date().getFullYear()} Wardlings. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

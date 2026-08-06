import React from 'react';
import { motion } from 'motion/react';

const WARDLINGS_LOGO_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Logo.png';

interface WardlingsProgressTrackerProps {
  currentStep: number; // 1, 2, 3, 4, 5
}

export const WardlingsProgressTracker: React.FC<WardlingsProgressTrackerProps> = ({ currentStep }) => {
  // Map currentStep to percentage (0%, 33.33%, 66.66%, 100%)
  const normalizedStep = Math.min(Math.max(currentStep, 1), 4);
  const progressPercent = ((normalizedStep - 1) / 3) * 100;

  const milestonePositions = [0, 33.33, 66.66, 100];

  return (
    <div className="w-full max-w-md mx-auto my-6 relative z-20 px-6 select-none">
      <div className="relative w-full h-10 flex items-center">
        {/* Background Inactive Line (#D8D8D8) */}
        <div className="absolute left-0 right-0 h-[3px] bg-[#D8D8D8] rounded-full z-0 overflow-hidden pointer-events-none">
          {/* Animated Active Line (#78B95B) — animates via GPU-accelerated
              transform (scaleX) instead of width, avoiding layout reflow */}
          <motion.div
            className="h-full w-full bg-[#78B95B] rounded-full origin-left"
            initial={false}
            animate={{ scaleX: progressPercent / 100 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Milestone Position Points (No borders, no circles with numbers, no checkmarks) */}
        {milestonePositions.map((posPercent, index) => {
          const stepNum = index + 1;
          const isPassed = currentStep >= stepNum;

          return (
            <div
              key={stepNum}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 flex flex-col items-center"
              style={{ left: `${posPercent}%` }}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  isPassed ? 'bg-[#78B95B]' : 'bg-[#D8D8D8]'
                }`}
              />
            </div>
          );
        })}

        {/* Wardlings Logo Floating Indicator that moves smoothly to next position.
            Positioned via GPU-accelerated transform (x/y) instead of the
            layout-triggering `left` property. */}
        <motion.div
          className="absolute top-1/2 left-0 w-full h-9 z-20 pointer-events-none"
          initial={false}
          animate={{ x: `${progressPercent}%`, y: '-50%' }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          <div className="absolute left-0 top-0 -translate-x-1/2 w-9 h-9 flex items-center justify-center">
            {/* Idle bob/rotate is a pure CSS animation (animate-wardling-bob)
                instead of a Framer Motion repeat:Infinity loop — see the
                comment in index.css for why: this is exactly what was
                freezing for several seconds after returning from a
                backgrounded tab (e.g. after clicking an X task button). */}
            <img
              src={WARDLINGS_LOGO_URL}
              alt="Wardlings Progress"
              className="animate-wardling-bob w-9 h-9 object-contain drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Step Labels */}
      <div className="flex justify-between items-center mt-1 text-[11px] font-patrick font-bold text-[#6A6158]">
        <span className={currentStep >= 1 ? 'text-[#4D7A39]' : ''}>1. Handle</span>
        <span className={currentStep >= 2 ? 'text-[#4D7A39]' : ''}>2. Tasks</span>
        <span className={currentStep >= 3 ? 'text-[#4D7A39]' : ''}>3. Wallet</span>
        <span className={currentStep >= 4 ? 'text-[#4D7A39]' : ''}>4. Verify</span>
      </div>
    </div>
  );
};

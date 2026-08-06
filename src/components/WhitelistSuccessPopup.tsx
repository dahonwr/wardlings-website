import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share2, X as CloseIcon } from 'lucide-react';
import { SHARE_MESSAGES } from '../config/shareMessages';

// Real Wardlings Ticket artwork, provided by the user.
const TICKET_ARTWORK_URL =
  'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Wardlings_ticket.png';

interface WhitelistSuccessPopupProps {
  open: boolean;
  onClose: () => void;
}

interface FallingParticle {
  id: number;
  emoji: string;
  leftPct: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

interface Butterfly {
  id: number;
  topPct: number;
  delay: number;
  duration: number;
}

const FALLING_EMOJIS = ['🍃', '🍂', '🌸', '🌼'];

function buildParticles(): FallingParticle[] {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    emoji: FALLING_EMOJIS[i % FALLING_EMOJIS.length],
    leftPct: 6 + Math.random() * 86,
    delay: Math.random() * 0.7,
    duration: 1.5 + Math.random() * 0.6,
    size: 14 + Math.random() * 8,
    drift: (Math.random() - 0.5) * 44,
  }));
}

function buildButterflies(): Butterfly[] {
  const count = 2 + Math.round(Math.random()); // 2–3
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    topPct: 12 + Math.random() * 55,
    delay: 0.15 + i * 0.4,
    duration: 1.7 + Math.random() * 0.4,
  }));
}

const CELEBRATION_DURATION_MS = 2100;

export const WhitelistSuccessPopup: React.FC<WhitelistSuccessPopupProps> = ({ open, onClose }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const particles = useMemo(() => buildParticles(), [open]);
  const butterflies = useMemo(() => buildButterflies(), [open]);

  useEffect(() => {
    if (!open) return;
    setShowCelebration(true);
    const timer = setTimeout(() => setShowCelebration(false), CELEBRATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  // Escape closes the popup, same as clicking the backdrop or the close button.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock background scroll while the popup is open (modal convention).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleDownload = async () => {
    try {
      const res = await fetch(TICKET_ARTWORK_URL);
      if (!res.ok) throw new Error('Ticket download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'wardlings-ticket.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Cross-origin or network hiccup — fall back to opening the image so
      // the user can still save it manually (e.g. long-press / right-click).
      window.open(TICKET_ARTWORK_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = () => {
    const post = SHARE_MESSAGES[Math.floor(Math.random() * SHARE_MESSAGES.length)];
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const buttonListVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
  };
  const buttonItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="wl-success-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-[#2F241D]/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            key="wl-success-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wl-success-title"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-full max-w-md rounded-3xl bg-[#FFFDF8] border-2 border-[#2F241D] shadow-2xl overflow-hidden"
          >
            {/* Celebration Layer — falling leaves/flowers + a couple of
                butterflies, contained to the card and gone after ~2s so it
                reads as a flourish rather than a full-screen confetti blast. */}
            {showCelebration && (
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                {particles.map((p) => (
                  <motion.span
                    key={`particle-${p.id}`}
                    initial={{ y: -24, x: 0, opacity: 0, rotate: 0 }}
                    animate={{ y: 340, x: p.drift, opacity: [0, 1, 1, 0], rotate: 180 }}
                    transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
                    style={{ left: `${p.leftPct}%`, fontSize: p.size }}
                    className="absolute top-0 select-none"
                  >
                    {p.emoji}
                  </motion.span>
                ))}
                {butterflies.map((b) => (
                  <motion.span
                    key={`butterfly-${b.id}`}
                    initial={{ x: '-10%', opacity: 0 }}
                    animate={{ x: '110%', y: [0, -14, 6, -10, 0], opacity: [0, 1, 1, 1, 0] }}
                    transition={{ duration: b.duration, delay: b.delay, ease: 'easeInOut' }}
                    style={{ top: `${b.topPct}%` }}
                    className="absolute text-lg select-none"
                  >
                    🦋
                  </motion.span>
                ))}
              </div>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-white/70 hover:bg-white text-[#2F241D] border border-[#2F241D]/20 transition-colors cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>

            <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center text-center">
              <motion.img
                src={TICKET_ARTWORK_URL}
                alt="Your Wardlings Ticket"
                decoding="async"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                className="w-40 sm:w-48 rounded-2xl border-2 border-[#2F241D] shadow-md mb-5 bg-white object-cover"
              />

              <h2 id="wl-success-title" className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#2F241D] tracking-tight mb-3">
                🌿 Your Story Has Taken Root
              </h2>

              <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] leading-relaxed mb-1">
                Your Wardlings Ticket has found its place within the Sanctuary.
              </p>
              <p className="font-nunito font-semibold text-sm sm:text-base text-[#6A6158] leading-relaxed mb-6">
                The Keepers are now reviewing every traveler's journey. We'll reveal the chosen travelers soon.
              </p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={buttonListVariants}
                className="w-full flex flex-col gap-3"
              >
                <motion.button
                  variants={buttonItemVariants}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  onClick={handleDownload}
                  className="w-full font-dynapuff font-bold text-base py-3.5 rounded-full bg-[#82C66A] text-white border-2 border-[#2F241D] shadow-[2px_3px_0px_#2F241D] hover:bg-[#72B65A] cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4.5 h-4.5" />
                  Download My Ticket
                </motion.button>

                <motion.button
                  variants={buttonItemVariants}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  onClick={handleShare}
                  className="w-full font-baloo font-bold text-base py-3.5 rounded-full bg-white text-[#2F241D] border-2 border-[#2F241D] hover:bg-gray-100 cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4.5 h-4.5" />
                  Share My Journey
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

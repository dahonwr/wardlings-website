import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WardlingCharacter } from '../types';
import { IllustrationPlaceholder } from './IllustrationPlaceholder';
import { X, Sparkles, Compass, Heart, Utensils } from 'lucide-react';

interface CharacterModalProps {
  character: WardlingCharacter | null;
  onClose: () => void;
  onJoinWhitelistClick: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  character,
  onClose,
  onJoinWhitelistClick,
}) => {
  if (!character) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2B241F]/40 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] p-6 sm:p-8 border border-[#ECE7DF] wardling-card-shadow z-10 my-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-[#FBF9F5] hover:bg-[#ECE7DF] text-[#2B241F] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            {/* Header Badge & Name */}
            <div className="flex flex-wrap items-center gap-3 pr-8">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#5E7D3A]/10 text-[#5E7D3A] border border-[#5E7D3A]/20">
                {character.element} Spirit
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FBF9F5] text-[#5C544B] border border-[#ECE7DF]">
                {character.rarityTier} Tier
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2B241F] font-heading">
              {character.name}
            </h2>

            {/* Image Placeholder */}
            <div className="w-full rounded-[24px] overflow-hidden border border-[#ECE7DF]">
              <IllustrationPlaceholder
                label={`${character.name} Full Illustration`}
                sublabel={`Sanctuary Archives — ${character.name}`}
                aspectRatio="aspect-[16/9]"
                className="w-full"
              />
            </div>

            {/* Story */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold tracking-wider text-[#5C544B] uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5E7D3A]" />
                Spirit Story
              </h3>
              <p className="text-base text-[#5C544B] leading-relaxed bg-[#FBF9F5] p-4 rounded-2xl border border-[#ECE7DF]/80">
                {character.fullStory}
              </p>
            </div>

            {/* Traits & Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DF] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C544B]">
                  <Heart className="w-3.5 h-3.5 text-[#5E7D3A]" />
                  <span>Personality</span>
                </div>
                <p className="text-xs font-semibold text-[#2B241F]">
                  {character.personality}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DF] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C544B]">
                  <Utensils className="w-3.5 h-3.5 text-[#5E7D3A]" />
                  <span>Favorite Snack</span>
                </div>
                <p className="text-xs font-semibold text-[#2B241F]">
                  {character.favoriteFood}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DF] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5C544B]">
                  <Compass className="w-3.5 h-3.5 text-[#5E7D3A]" />
                  <span>Habitat</span>
                </div>
                <p className="text-xs font-semibold text-[#2B241F]">
                  {character.habitat}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={() => {
                  onClose();
                  onJoinWhitelistClick();
                }}
                className="w-full bg-[#5E7D3A] hover:bg-[#4E6A2E] text-white py-3.5 rounded-full text-sm font-bold transition-colors cursor-pointer text-center shadow-xs"
              >
                Become {character.name}'s Keeper
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={onClose}
                className="w-full sm:w-auto bg-white hover:bg-[#FBF9F5] text-[#5C544B] py-3.5 px-6 rounded-full text-sm font-bold border border-[#ECE7DF] transition-colors cursor-pointer text-center"
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

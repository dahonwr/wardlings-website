import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { WardlingCharacter } from './WardlingCharacter';

interface FinalCtaProps {
  onOpenApply: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onOpenApply }) => {
  return (
    <section className="py-16 px-4 sm:px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 sm:p-12 rounded-3xl bg-white/80 backdrop-blur-sm border border-[#34281F]/10 shadow-sm text-center flex flex-col items-center space-y-6"
        >
          {/* Gentle Floating Illustration */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-28 rounded-full bg-[#FFF9EF] border border-[#34281F]/10 flex items-center justify-center p-2 shadow-xs"
          >
            <WardlingCharacter variant="scout" size={90} />
          </motion.div>

          <div className="space-y-3">
            <h2 className="font-dynapuff font-bold text-3xl sm:text-4xl text-[#34281F]">
              Become a Keeper
            </h2>
            <p className="font-nunito font-semibold text-base sm:text-lg text-[#5E564F] max-w-md mx-auto">
              Applications are now open. Take your first step into the Sanctuary and begin your journey.
            </p>
          </div>

          {/* Join Whitelist Button */}
          <motion.button
            onClick={onOpenApply}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ backgroundColor: '#5C8E47' }}
            className="font-dynapuff font-bold text-base sm:text-lg px-8 py-3.5 rounded-full text-white shadow-md hover:bg-[#4F7A3D] cursor-pointer flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200" />
            <span>Join Whitelist</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

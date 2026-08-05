import React from 'react';
import { motion } from 'motion/react';
import { Heart, Feather, Sparkles, Map } from 'lucide-react';

export const WorldSection: React.FC = () => {
  return (
    <section id="world" className="py-20 px-4 sm:px-6 bg-[#D9F5C2]/40 relative overflow-hidden border-t-3 border-b-3 border-[#2B2B2B]">
      {/* Background foliage elements */}
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF9EF] border-2 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] mb-3"
          >
            <Feather className="w-4 h-4 text-[#7EBE69]" />
            <span className="font-patrick font-bold text-sm text-[#7C5B46]">
              CHAPTER I — THE ANCIENT LORE
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-dynapuff font-bold text-3xl sm:text-5xl text-[#2B2B2B]"
          >
            Welcome to the Sanctuary
          </motion.h2>

          <p className="font-nunito font-semibold text-lg text-[#2B2B2B]/80 mt-3">
            A hidden realm tucked behind morning mist where magic takes root in silence.
          </p>
        </div>

        {/* Storybook Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Large Illustration Frame */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="cozy-card p-4 sm:p-6 bg-[#FFF9EF] relative overflow-hidden">
              <div className="tape-strip absolute top-3 right-6 w-20 h-6 rotate-3 z-20" />
              <div className="w-full h-72 sm:h-80 rounded-2xl bg-gradient-to-br from-[#DFF4FF] via-[#D9F5C2] to-[#F7BFD5] border-3 border-[#2B2B2B] flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                
                {/* Visual Sanctuary Banner */}
                <div className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-700 group-hover:scale-105" />

                {/* Illustrated Sanctuary Tree & Sprout */}
                <div className="relative z-10 text-center flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full bg-[#FFF9EF] border-3 border-[#2B2B2B] shadow-[3px_4px_0px_#2B2B2B] flex items-center justify-center mb-4">
                    <img
                      src="https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Hero.png"
                      alt="Sanctuary Hero"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <span className="font-dynapuff font-bold text-xl text-[#2B2B2B]">
                    The Mother Tree
                  </span>
                  <span className="font-patrick text-base font-bold text-[#7C5B46]">
                    Where all seeds awaken
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Story Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="paper-pinned p-6 relative"
            >
              <div className="tape-strip absolute -top-3 left-6 w-16 h-5 -rotate-2" />
              <h3 className="font-dynapuff font-bold text-xl text-[#2B2B2B] flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#7EBE69]" />
                Hidden Beyond the Mist
              </h3>
              <p className="font-nunito font-semibold text-[#2B2B2B]/90 text-base leading-relaxed">
                For centuries, the Wardlings lived in peaceful harmony, tending to glowing mushrooms, singing to mossy roots, and whispering secrets to passing fireflies.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="paper-pinned p-6 relative"
            >
              <div className="tape-strip absolute -top-3 right-6 w-16 h-5 rotate-2" />
              <h3 className="font-dynapuff font-bold text-xl text-[#2B2B2B] flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-[#F7BFD5] fill-[#F7BFD5]" />
                The Call for Keepers
              </h3>
              <p className="font-nunito font-semibold text-[#2B2B2B]/90 text-base leading-relaxed">
                Now, the Sanctuary is opening its magical gates. The Wardlings are searching for kind-hearted Keepers from the human world to help guard their forest home.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

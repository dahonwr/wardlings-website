import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Leaf } from 'lucide-react';

interface ResidentCategory {
  id: string;
  title: string;
  rarity: string;
  badgeColor: string;
  imageUrl: string;
  description: string;
  handwrittenNote: string;
}

export const ResidentsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const residents: ResidentCategory[] = [
    {
      id: 'hero',
      title: 'Hero Wardlings',
      rarity: '1 of 1 / Heroic',
      badgeColor: 'bg-[#F7BFD5]',
      imageUrl: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Hero1.jpg',
      description: 'Ancient guardians carrying celestial light. Only a handful exist in the deepest heart of the forest.',
      handwrittenNote: 'Spotted under the midnight full moon! ✨'
    },
    {
      id: 'legendary',
      title: 'Legendary Wardlings',
      rarity: 'Legendary Tier',
      badgeColor: 'bg-amber-200',
      imageUrl: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Legendary.jpg',
      description: 'Blessed with golden sunburst antlers and rare blooming petals that never wither.',
      handwrittenNote: 'Very shy! Loves sweet honey sap 🍯'
    },
    {
      id: 'epic',
      title: 'Epic Wardlings',
      rarity: 'Epic Tier',
      badgeColor: 'bg-[#D9F5C2]',
      imageUrl: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Epic.jpg',
      description: 'Adorned in mossy crowns and luminescent fungi, protecting ancient woodland paths.',
      handwrittenNote: 'Guild leader of the Moss Scouts 🌿'
    },
    {
      id: 'uncommon',
      title: 'Uncommon Wardlings',
      rarity: 'Uncommon Tier',
      badgeColor: 'bg-[#DFF4FF]',
      imageUrl: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Uncommon.jpg',
      description: 'Curious explorers carrying river pebble pendants and sprout antennas.',
      handwrittenNote: 'Collects shiny blue stream stones 💎'
    },
    {
      id: 'common',
      title: 'Common Wardlings',
      rarity: 'Common Tier',
      badgeColor: 'bg-stone-200',
      imageUrl: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Common.jpg',
      description: 'Cheerful woodland helpers who plant acorn seeds and water morning sprouts.',
      handwrittenNote: 'Always seen with a tiny watering leaf 🍃'
    }
  ];

  const filtered = activeTab === 'all' ? residents : residents.filter(r => r.id === activeTab);

  return (
    <section id="residents" className="py-20 px-4 sm:px-6 bg-[#7C5B46]/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF9EF] border-2 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] mb-3"
          >
            <BookOpen className="w-4 h-4 text-[#7C5B46]" />
            <span className="font-patrick font-bold text-sm text-[#7C5B46]">
              FIELD NOTEBOOK — SANCTUARY RESIDENTS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-dynapuff font-bold text-3xl sm:text-5xl text-[#2B2B2B]"
          >
            Meet the Wardlings
          </motion.h2>
          <p className="font-nunito font-semibold text-lg text-[#2B2B2B]/80 mt-2">
            Each creature possesses unique woodland traits, glowing seeds, and story lore.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['all', 'hero', 'legendary', 'epic', 'uncommon', 'common'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-baloo font-bold text-sm px-4 py-1.5 rounded-full border-2 border-[#2B2B2B] transition-all capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#7EBE69] text-[#FFF9EF] shadow-[2px_3px_0px_#2B2B2B]'
                    : 'bg-[#FFF9EF] text-[#2B2B2B] hover:bg-[#D9F5C2]'
                }`}
              >
                {tab === 'all' ? 'All Residents' : `${tab}`}
              </button>
            ))}
          </div>
        </div>

        {/* Corkboard Container */}
        <div className="p-6 sm:p-10 rounded-[32px] bg-[#967259] border-4 border-[#2B2B2B] shadow-[6px_10px_0px_#2B2B2B] relative overflow-hidden">
          {/* Subtle Corkboard Texture Pattern */}
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

          {/* Cards Grid Pinned onto Corkboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {filtered.map((resident, idx) => (
              <motion.div
                key={resident.id}
                initial={{ opacity: 0, y: 30, rotate: idx % 2 === 0 ? -1.5 : 1.5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, rotate: 0 }}
                className="paper-pinned p-5 relative flex flex-col justify-between group cursor-pointer"
              >
                {/* Hand drawn tape at top */}
                <div className="tape-strip absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rotate-1 z-20 flex items-center justify-center">
                  <span className="font-patrick text-xs text-[#7C5B46] font-bold">
                    📌 Specimen #{idx + 1}
                  </span>
                </div>

                {/* Tiny Leaf Accent top right */}
                <div className="absolute top-3 right-3 text-[#7EBE69]">
                  <Leaf className="w-5 h-5 drop-shadow-sm rotate-12" />
                </div>

                <div>
                  {/* Image Container */}
                  <div className="w-full aspect-square rounded-2xl bg-[#DFF4FF] border-3 border-[#2B2B2B] p-4 flex items-center justify-center relative overflow-hidden mb-4 mt-2 group-hover:bg-[#D9F5C2] transition-colors">
                    <img
                      src={resident.imageUrl}
                      alt={resident.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback styling if Supabase test URL is blocked
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    {/* Rarity Pill Badge */}
                    <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-full font-patrick font-bold text-xs border-2 border-[#2B2B2B] text-[#2B2B2B] shadow-[1px_2px_0px_#2B2B2B] ${resident.badgeColor}`}>
                      {resident.rarity}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="font-dynapuff font-bold text-2xl text-[#2B2B2B] mb-2">
                    {resident.title}
                  </h3>

                  {/* Description */}
                  <p className="font-nunito font-semibold text-sm text-[#2B2B2B]/85 leading-relaxed">
                    {resident.description}
                  </p>
                </div>

                {/* Handwritten Note at bottom */}
                <div className="mt-4 pt-3 border-t-2 border-dashed border-[#7C5B46]/30">
                  <span className="font-patrick text-base font-bold text-[#7C5B46] italic block">
                    "{resident.handwrittenNote}"
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

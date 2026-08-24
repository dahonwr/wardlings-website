import React from 'react';
import { motion } from 'motion/react';

export const ProjectInfoSection: React.FC = () => {
  const infoCards = [
    {
      title: '4,444',
      subtitle: 'Wardlings',
      accentColor: '#D9F5C2',
      badgeColor: '#7EBE69'
    },
    {
      title: 'Robinhood Chain',
      subtitle: 'Blockchain',
      accentColor: '#DFF4FF',
      badgeColor: '#3B82F6'
    },
    {
      title: 'Coming Soon',
      subtitle: 'Mint',
      accentColor: '#F7BFD5',
      badgeColor: '#EC4899'
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {infoCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#2B2B2B]/10 shadow-sm flex flex-col items-center text-center justify-center transition-all hover:shadow-md"
          >
            <span
              className="font-dynapuff font-bold text-3xl sm:text-4xl text-[#2B2B2B] tracking-tight mb-1"
            >
              {card.title}
            </span>
            <span className="font-patrick font-bold text-base sm:text-lg text-[#7C5B46]">
              {card.subtitle}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

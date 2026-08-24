import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Leaf } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  handwrittenTag: string;
}

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      question: 'What are Wardlings?',
      answer: 'Wardlings are 10,000 unique, hand-crafted digital companions living on the Robinhood Chain blockchain. Each Wardling is generated with distinctive woodland traits, glowing sanctuary seeds, and cozy personalities.',
      handwrittenTag: 'Note #1 — Origin Story 🌿'
    },
    {
      id: 'faq-2',
      question: 'How do I become a Keeper?',
      answer: 'Click the "Become a Keeper" button anywhere on our website to open the application portal. Enter your X username, complete four quick community support steps, and submit your EVM wallet address to plant your seed.',
      handwrittenTag: 'Note #2 — Application Steps 📝'
    },
    {
      id: 'faq-3',
      question: 'What is the mint price and blockchain?',
      answer: 'Wardlings are minted on the Robinhood Chain network. Mint pricing and date will be officially revealed on our official X account (@WardlingsNFT) and Discord announcement channel.',
      handwrittenTag: 'Note #3 — Network Details 🔗'
    },
    {
      id: 'faq-4',
      question: 'What benefits do Keepers receive?',
      answer: 'Keepers gain entry into the sanctuary ecosystem, exclusive high-res vector art files, physical plushie claim eligibility, community lore voting rights, and priority whitelist spots for future sanctuary expansions.',
      handwrittenTag: 'Note #4 — Sanctuary Perks 🎁'
    },
    {
      id: 'faq-5',
      question: 'Is there a Discord or community channel?',
      answer: 'Yes! Our cozy Discord sanctuary is open to all who respect the woodland rules. Join via the link in our footer to chat with fellow Keepers and share fan art.',
      handwrittenTag: 'Note #5 — Community Circle 💬'
    }
  ];

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-[#FFF9EF] relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DFF4FF] border-2 border-[#2B2B2B] shadow-[2px_3px_0px_#2B2B2B] mb-3"
          >
            <HelpCircle className="w-4 h-4 text-[#7C5B46]" />
            <span className="font-patrick font-bold text-sm text-[#7C5B46]">
              EXPLORER JOURNAL — QUESTIONS & ANSWERS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-dynapuff font-bold text-3xl sm:text-5xl text-[#2B2B2B]"
          >
            Frequently Asked Questions
          </motion.h2>
          <p className="font-nunito font-semibold text-lg text-[#2B2B2B]/80 mt-2">
            Punctual answers recorded directly in the sanctuary expedition field log.
          </p>
        </div>

        {/* Explorer Journal Stack */}
        <div className="space-y-5">
          {faqs.map((item, idx) => {
            const isOpen = openId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="paper-pinned p-5 sm:p-6 relative cursor-pointer"
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                {/* Hand drawn tape strip */}
                <div className="tape-strip absolute -top-3 left-8 w-20 h-5 rotate-1 flex items-center justify-center">
                  <span className="font-patrick text-xs text-[#7C5B46] font-bold">
                    {item.handwrittenTag}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-dynapuff font-bold text-xl sm:text-2xl text-[#2B2B2B] flex items-center gap-2.5">
                    <Leaf className="w-5 h-5 text-[#7EBE69] flex-shrink-0" />
                    {item.question}
                  </h3>
                  <div className={`p-2 rounded-full bg-[#D9F5C2] border-2 border-[#2B2B2B] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-[#2B2B2B]" />
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-[#7C5B46]/30">
                        <p className="font-nunito font-semibold text-base sm:text-lg text-[#2B2B2B]/90 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

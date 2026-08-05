import React, { useState } from 'react';
import { motion } from 'motion/react';
import { XIcon, DiscordIcon } from './SocialIcons';

interface FooterProps {
  twitterUrl?: string;
  discordUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  twitterUrl = 'https://x.com/WardlingsNFT',
  discordUrl = 'https://discord.gg/wardlings'
}) => {
  const [activeModal, setActiveModal] = useState<'magicPaper' | 'privacy' | 'terms' | 'contact' | null>(null);

  const LOGO_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Logo.png';

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
      style={{ backgroundColor: '#FFFDF8' }}
      className="py-[64px] md:py-[88px] lg:py-[104px] px-6 relative z-10 text-center"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center space-y-7">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center justify-center">
          <img
            src={LOGO_URL}
            alt="Wardlings Logo"
            className="w-[72px] h-[72px] object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#3C2F28] mt-3 tracking-tight">
            Wardlings
          </span>
        </div>

        {/* Centered Navigation & Social Icons */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 font-baloo font-bold text-base sm:text-lg">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="X (Twitter)"
            className="text-[#6E645C] hover:text-[#4D7A39] transition-colors duration-200 cursor-pointer p-1 flex items-center justify-center"
          >
            <XIcon className="w-5 h-5" />
          </a>
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Discord"
            className="text-[#6E645C] hover:text-[#4D7A39] transition-colors duration-200 cursor-pointer p-1 flex items-center justify-center"
          >
            <DiscordIcon className="w-5 h-5" />
          </a>
          <button
            onClick={() => setActiveModal('magicPaper')}
            className="text-[#6E645C] hover:text-[#4D7A39] transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            Magic Paper
          </button>
          <button
            onClick={() => setActiveModal('privacy')}
            className="text-[#6E645C] hover:text-[#4D7A39] transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveModal('terms')}
            className="text-[#6E645C] hover:text-[#4D7A39] transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            Terms
          </button>
          <button
            onClick={() => setActiveModal('contact')}
            className="text-[#6E645C] hover:text-[#4D7A39] transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            Contact
          </button>
        </div>

        {/* Copyright */}
        <div className="pt-2 font-nunito font-semibold text-xs sm:text-sm text-[#9A938A]">
          © 2026 Wardlings. Crafted with care in the Sanctuary.
        </div>
      </div>

      {/* Modal for Magic Paper, Privacy, Terms, Contact */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-[#3C2F28]/40 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#FFFDF8] border border-[#3C2F28]/10 shadow-xl relative text-left">
            <h3 className="font-dynapuff font-bold text-xl sm:text-2xl text-[#3C2F28] mb-4 capitalize">
              {activeModal === 'magicPaper'
                ? '✨ Magic Paper'
                : activeModal === 'privacy'
                ? 'Privacy Policy'
                : activeModal === 'terms'
                ? 'Terms of Service'
                : 'Contact Keepers'}
            </h3>
            <div className="font-nunito font-semibold text-sm sm:text-base text-[#6E645C] space-y-3 max-h-60 overflow-y-auto pr-2 leading-relaxed">
              {activeModal === 'magicPaper' && (
                <>
                  <p>Welcome to the official Wardlings Magic Paper. The Sanctuary is a peaceful realm dedicated to storybook creativity and woodland digital ownership on Ethereum.</p>
                  <p>All Wardlings metadata and artwork are stored on IPFS & Ethereum smart contracts.</p>
                </>
              )}
              {activeModal === 'privacy' && (
                <p>We respect your privacy. Wardlings Keeper applications only collect your public X handle and EVM wallet address to verify whitelist eligibility. No private keys or personal identifiers are stored.</p>
              )}
              {activeModal === 'terms' && (
                <p>By submitting a Keeper application, you agree to foster a kind, supportive community environment for all woodland guardians.</p>
              )}
              {activeModal === 'contact' && (
                <p>For sanctuary inquiries, partnership proposals, or keeper support, reach out to our team at <strong className="text-[#3C2F28]">keepers@wardlings.io</strong> or join our official Discord.</p>
              )}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setActiveModal(null)}
                style={{ backgroundColor: '#6FAE63' }}
                className="font-dynapuff font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full text-white shadow-sm hover:bg-[#5C9E51] cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.footer>
  );
};

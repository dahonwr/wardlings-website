import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Menu, X as CloseIcon } from 'lucide-react';
import { XIcon, DiscordIcon } from './SocialIcons';

interface NavbarProps {
  onOpenApply: () => void;
  twitterUrl?: string;
  discordUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApply,
  twitterUrl = 'https://x.com/WardlingsNFT',
  discordUrl = 'https://discord.gg/wardlings'
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-40 px-3 sm:px-6 max-w-5xl mx-auto w-full">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          backgroundColor: isScrolled ? 'rgba(248, 243, 233, 0.95)' : 'rgba(248, 243, 233, 0.88)',
          borderColor: 'rgba(53, 44, 38, 0.25)'
        }}
        className={`flex items-center justify-between px-3.5 sm:px-5 py-2.5 rounded-full backdrop-blur-md border shadow-sm transition-all duration-300 w-full whitespace-nowrap ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        {/* Left: Wardlings logo */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer text-left shrink-0"
        >
          <img
            src="https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Logo.png"
            alt="Wardlings"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-dynapuff font-bold text-base sm:text-lg text-[#352C26] tracking-tight group-hover:text-[#4D7A39] transition-colors">
            Wardlings
          </span>
        </button>

        {/* Middle Desktop/Tablet Navigation Links */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7 font-baloo font-bold text-xs lg:text-sm text-[#5E564F] shrink-0">
          <button
            onClick={() => scrollToSection('about')}
            className="hover:text-[#352C26] transition-colors cursor-pointer"
          >
            Sanctuary
          </button>
          <button
            onClick={() => scrollToSection('collection')}
            className="hover:text-[#352C26] transition-colors cursor-pointer"
          >
            Sneak Peek
          </button>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="X (Twitter)"
            className="text-[#5E564F] hover:text-[#352C26] transition-colors p-1 cursor-pointer flex items-center justify-center"
          >
            <XIcon className="w-4 h-4" />
          </a>
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Discord"
            className="text-[#5E564F] hover:text-[#352C26] transition-colors p-1 cursor-pointer flex items-center justify-center"
          >
            <DiscordIcon className="w-4.5 h-4.5" />
          </a>
        </div>

        {/* Right Action: Become a Keeper + Hamburger (Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Become a Keeper Button (always visible, no lock icon) */}
          <motion.button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenApply();
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ backgroundColor: '#5C8E47' }}
            className="font-dynapuff font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 rounded-full text-white shadow-sm hover:bg-[#4F7A3D] cursor-pointer flex items-center gap-1 sm:gap-1.5 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-yellow-200 fill-yellow-200 shrink-0" />
            <span>Become a Keeper</span>
          </motion.button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-full hover:bg-black/5 text-[#352C26] transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="w-5 h-5 text-[#352C26]" />
            ) : (
              <Menu className="w-5 h-5 text-[#352C26]" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 p-5 rounded-3xl bg-[#FFFDF8] border border-[#352C26]/20 shadow-xl flex flex-col space-y-4 font-baloo font-bold text-base text-[#352C26]"
          >
            <button
              onClick={() => scrollToSection('about')}
              className="text-left py-2 border-b border-[#352C26]/10 flex items-center justify-between"
            >
              <span>Sanctuary</span>
              <span className="text-xs font-nunito text-[#6A6158]">About</span>
            </button>
            <button
              onClick={() => scrollToSection('collection')}
              className="text-left py-2 border-b border-[#352C26]/10 flex items-center justify-between"
            >
              <span>Sneak Peek</span>
              <span className="text-xs font-nunito text-[#6A6158]">Gallery</span>
            </button>
            <div className="py-2 border-b border-[#352C26]/10 flex items-center justify-between">
              <span className="text-sm">Follow Community</span>
              <div className="flex items-center gap-4 text-[#352C26]">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X (Twitter)"
                  className="hover:text-[#4D7A39] transition-colors p-1"
                >
                  <XIcon className="w-5 h-5" />
                </a>
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Discord"
                  className="hover:text-[#4D7A39] transition-colors p-1"
                >
                  <DiscordIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

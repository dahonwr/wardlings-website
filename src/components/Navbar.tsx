import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X as CloseIcon } from 'lucide-react';
import { XIcon, DiscordIcon } from './SocialIcons';
import { scrollToId, scrollToY } from '../lib/scroll';
import { useActiveSection } from '../hooks/useActiveSection';

interface NavbarProps {
  onOpenApply: () => void;
  twitterUrl?: string;
  discordUrl?: string;
}

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'Sanctuary' },
  { id: 'collection', label: 'Collection' },
  { id: 'apply', label: 'Apply' }
];

const SECTION_IDS = NAV_LINKS.map((link) => link.id);

const NavbarComponent: React.FC<NavbarProps> = ({
  onOpenApply,
  twitterUrl = 'https://x.com/WardlingsNFT',
  discordUrl = 'https://discord.gg/wardlings'
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeId = useActiveSection(SECTION_IDS, 'home');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      // Batch the read/write into the next animation frame so this listener
      // never forces a synchronous layout while the user is scrolling.
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    // 800ms eased scroll (see src/lib/scroll.ts) — falls within the
    // 700-900ms ease-in-out spec and doesn't fight native wheel scrolling.
    scrollToId(id, 800);
  };

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-40 px-3 sm:px-6 max-w-5xl mx-auto w-full">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          // Bumped opacity up (was 0.88/0.95) to compensate for dropping
          // backdrop-blur below — a fixed, always-mounted element with
          // backdrop-filter forces the browser to recompute a blur layer
          // on every single scroll frame, which is one of the most common
          // causes of janky/laggy scrolling on mobile Safari. A near-opaque
          // solid background reads almost identically but costs nothing
          // during scroll.
          backgroundColor: isScrolled ? 'rgba(248, 243, 233, 0.98)' : 'rgba(248, 243, 233, 0.96)',
          borderColor: 'rgba(53, 44, 38, 0.25)'
        }}
        className={`flex items-center justify-between px-3.5 sm:px-5 py-2.5 rounded-full border shadow-sm transition-all duration-300 w-full whitespace-nowrap ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        {/* Left: Wardlings logo */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            scrollToY(0, 800);
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

        {/* Middle Desktop/Tablet Navigation Links — centered in its own flexible
            column so the header stays balanced now that the header CTA is gone */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-5 lg:gap-7 font-baloo font-bold text-xs lg:text-sm text-[#5E564F]">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`relative pb-1 transition-colors cursor-pointer ${
                activeId === link.id ? 'text-[#352C26]' : 'hover:text-[#352C26]'
              }`}
            >
              {link.label}
              {activeId === link.id && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-[#5C8E47]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: Social Icons (Desktop/Tablet) + Hamburger (Mobile).
            No "Become a Keeper" button here anymore — that CTA lives only in
            the Hero and other intentional CTA sections (e.g. the footer). */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
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
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-left py-2 border-b border-[#352C26]/10 flex items-center justify-between ${
                  activeId === link.id ? 'text-[#4D7A39]' : ''
                }`}
              >
                <span>{link.label}</span>
                {activeId === link.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C8E47]" />
                )}
              </button>
            ))}
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

export const Navbar = React.memo(NavbarComponent);

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onJoinWhitelistClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onJoinWhitelistClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Collection', href: '#collection' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-[#ECE7DF] ${
        scrolled ? 'py-3 shadow-xs' : 'py-4'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Logo image, WARDLINGS title, subtitle */}
        <a href="#home" className="flex items-center gap-3 group focus:outline-hidden">
          <motion.img
            src="https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Logo.png"
            alt="Wardlings Logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#2B241F] font-heading leading-tight">
              WARDLINGS
            </span>
            <span className="text-xs text-[#5C544B] font-medium hidden sm:inline-block">
              Every forest has its keepers.
            </span>
          </div>
        </a>

        {/* Center: Navigation Links with Animated Underline */}
        <nav className="hidden md:flex items-center space-x-8" onMouseLeave={() => setHoveredNav(null)}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onMouseEnter={() => setHoveredNav(link.name)}
              className="text-sm font-semibold text-[#5C544B] hover:text-[#5E7D3A] transition-colors relative py-1.5 focus:outline-hidden"
            >
              <span>{link.name}</span>
              {hoveredNav === link.name && (
                <motion.div
                  layoutId="navUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5E7D3A] rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Right: Whitelist CTA & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            href="https://x.com/wardlingsnft"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-[#FBF9F5] hover:bg-[#5E7D3A] text-[#2B241F] hover:text-white border border-[#ECE7DF] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            aria-label="Follow @wardlingsnft on X"
            title="Follow @wardlingsnft on X"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </motion.a>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onJoinWhitelistClick}
            className="hidden sm:inline-flex items-center justify-center bg-[#5E7D3A] hover:bg-[#4E6A2E] text-white px-6 py-3 rounded-full text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            Join Whitelist
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#2B241F] hover:bg-[#FBF9F5] border border-[#ECE7DF] transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-b border-[#ECE7DF] bg-white px-4 pt-3 pb-6 space-y-4"
          >
            <p className="text-xs text-[#5C544B] font-medium sm:hidden">
              Every forest has its keepers.
            </p>
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-[#2B241F] hover:text-[#5E7D3A] transition-colors py-2 border-b border-[#ECE7DF]/50"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setMobileMenuOpen(false);
                onJoinWhitelistClick();
              }}
              className="w-full bg-[#5E7D3A] hover:bg-[#4E6A2E] text-white py-3 rounded-full text-sm font-bold transition-colors cursor-pointer"
            >
              Join Whitelist
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


import React from 'react';
import { motion } from 'motion/react';

export const Footer: React.FC = () => {
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Collection', href: '#collection' },
  ];

  return (
    <footer className="bg-white border-t border-[#ECE7DF] pt-16 pb-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#ECE7DF]/60 items-start">
          {/* Left Column: Logo & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Logo.png"
                alt="Wardlings Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-[#2B241F] font-heading">
                WARDLINGS
              </span>
            </div>
            <p className="text-sm text-[#5C544B] max-w-sm leading-relaxed">
              Building the cutest forest sanctuary on Ethereum.
            </p>
          </div>

          {/* Center Column: Navigation */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B241F] block">
              Navigation
            </span>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm font-semibold text-[#5C544B] hover:text-[#5E7D3A] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Social Links */}
          <div className="md:col-span-3 space-y-3 md:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B241F] block">
              Community
            </span>
            <div className="flex items-center md:justify-end gap-3">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                href="https://x.com/wardlingsnft"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#FBF9F5] hover:bg-[#5E7D3A] text-[#2B241F] hover:text-white border border-[#ECE7DF] text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X (Twitter)
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#FBF9F5] hover:bg-[#5E7D3A] text-[#2B241F] hover:text-white border border-[#ECE7DF] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Discord
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5C544B] gap-4">
          <p>© 2026 Wardlings. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};


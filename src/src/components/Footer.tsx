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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                href="https://x.com/wardlingsnft"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#FBF9F5] hover:bg-[#5E7D3A] text-[#2B241F] hover:text-white border border-[#ECE7DF] transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                aria-label="X (Twitter)"
                title="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#FBF9F5] hover:bg-[#5E7D3A] text-[#2B241F] hover:text-white border border-[#ECE7DF] transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                aria-label="Discord"
                title="Discord"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
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


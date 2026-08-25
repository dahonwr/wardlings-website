import React from 'react';
import { XIcon, DiscordIcon } from './SocialIcons';

interface FooterProps {
  twitterUrl?: string;
}

// Official Wardlings Discord invite — hardcoded (not a prop, not an env
// var, not settings-driven) so this exact URL is what the footer's
// Discord icon opens, regardless of any default a parent might pass.
const DISCORD_INVITE_URL = 'https://discord.com/invite/AXjAt95DK';

const FooterComponent: React.FC<FooterProps> = ({
  twitterUrl = 'https://x.com/WardlingsNFT'
}) => {
  const LOGO_URL = 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Logo.png';

  return (
    <footer
      id="footer"
      style={{ backgroundColor: '#FFFDF8' }}
      className="reveal-on-scroll py-12 sm:py-16 px-6 relative z-10 text-center"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center space-y-5">
        {/* Logo & Title */}
        <div className="flex flex-col items-center justify-center">
          <img
            src={LOGO_URL}
            alt="Wardlings Logo"
            width="72"
            height="72"
            loading="lazy"
            decoding="async"
            className="w-[72px] h-[72px] object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-dynapuff font-bold text-2xl sm:text-3xl text-[#3C2F28] mt-3 tracking-tight">
            Wardlings
          </span>
        </div>

        {/* Centered Social Icons */}
        <div className="flex items-center justify-center gap-6 sm:gap-8">
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
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="text-[#6E645C] hover:text-[#4D7A39] transition-colors duration-200 cursor-pointer p-1 flex items-center justify-center"
          >
            <DiscordIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export const Footer = React.memo(FooterComponent);

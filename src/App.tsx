import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { CollectionSection } from './components/CollectionSection';
import { OGFreeMintApplicationPage } from './components/OGFreeMintApplicationPage';
import { WalletCheckerPage } from './components/WalletCheckerPage';
import { Footer } from './components/Footer';
import { MagicalForestEffects } from './components/MagicalForestEffects';
import { Settings } from './types';
import { fetchSettings } from './lib/storage';
import { scrollToId } from './lib/scroll';
import { useVisibilityRecovery } from './hooks/useVisibilityRecovery';
import { useScrollReveal } from './hooks/useScrollReveal';
import { DiscordClaimModal } from './components/DiscordClaimModal';

const getInitialDiscordClaim = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    );
    const isDiscordReady = params.get('discord') === 'ready' || hashParams.get('discord') === 'ready';
    const token = params.get('claim') || hashParams.get('claim');
    if (isDiscordReady && token) {
      return token.trim();
    }
  } catch (e) {
    console.warn('Failed parsing query params:', e);
  }
  return null;
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
  );
  const [claimToken, setClaimToken] = useState<string | null>(getInitialDiscordClaim);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(() => Boolean(getInitialDiscordClaim()));

  const shouldReduceMotion = useReducedMotion();

  const [settings, setSettings] = useState<Settings>({
    twitter_follow: 'https://x.com/WardlingsNFT',
    twitter_like: 'https://x.com/wardlingsnft/status/2093096332936491146?s=20',
    twitter_repost: 'https://x.com/wardlingsnft/status/2093096332936491146?s=20',
    twitter_comment: 'https://x.com/wardlingsnft/status/2093096332936491146?s=20',
    application_open: true,
    discord_link: 'https://discord.com/invite/AXjAt95DK',
    website_banner: ''
  });

  // Hook subscriptions for homepage scroll animations and visibility recovery
  useVisibilityRecovery();
  useScrollReveal();

  useEffect(() => {
    // Listen to browser Back/Forward history navigation
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);

    // Prevent the browser from restoring a previous scroll position on
    // refresh/reload — every fresh load should always begin at the top.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);

    // Detect Discord OAuth callback (discord=ready and claim=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
      );
      const isDiscordReady = params.get('discord') === 'ready' || hashParams.get('discord') === 'ready';
      const token = params.get('claim') || hashParams.get('claim');

      if (isDiscordReady && token) {
        setClaimToken(token);
        setIsClaimModalOpen(true);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch (e) {
      console.warn('Failed to parse URL params in App:', e);
    }

    loadSettings();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const loadSettings = async () => {
    const data = await fetchSettings();
    setSettings(data);
  };

  const navigateTo = useCallback((path: string) => {
    if (window.location.pathname.toLowerCase() !== path.toLowerCase()) {
      window.history.pushState({}, '', path);
      setCurrentPath(path.toLowerCase());
      window.scrollTo(0, 0);
    }
  }, []);

  const handleExploreClick = useCallback(() => {
    scrollToId('collection');
  }, []);

  // Subtle page transition variants respecting reduced motion preferences
  const pageVariants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 12,
      scale: shouldReduceMotion ? 1 : 0.995,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.28,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -8,
      scale: shouldReduceMotion ? 1 : 0.995,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.22,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {currentPath === '/applyogfreemint' ? (
          <motion.div
            key="og-free-mint-route"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <OGFreeMintApplicationPage
              onBackToHome={() => navigateTo('/')}
              onOpenChecker={() => navigateTo('/walletchecker')}
              settings={settings}
            />
          </motion.div>
        ) : currentPath === '/walletchecker' ? (
          <motion.div
            key="wallet-checker-route"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <WalletCheckerPage
              onBackToHome={() => navigateTo('/')}
              settings={settings}
            />
          </motion.div>
        ) : (
          <motion.div
            key="homepage-route"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen text-[#34281F] relative font-nunito selection:bg-[#F7BFD5] selection:text-[#34281F] overflow-x-hidden"
            style={{
              backgroundColor: '#FFFDF8',
            }}
          >
            <MagicalForestEffects />

            {/* Header */}
            <Navbar
              onNavigateToWalletChecker={() => navigateTo('/walletchecker')}
              onNavigateToOgApply={() => navigateTo('/applyogfreemint')}
              twitterUrl={settings.twitter_follow}
            />

            {/* Main Single-Page Sections */}
            <main className="relative z-10">
              {/* 1. Hero */}
              <HeroSection
                onNavigateToWalletChecker={() => navigateTo('/walletchecker')}
                onExploreClick={handleExploreClick}
                onNavigateToOgApply={() => navigateTo('/applyogfreemint')}
              />

              {/* 2. Sanctuary */}
              <AboutSection />

              {/* 3. Gallery */}
              <CollectionSection />
            </main>

            {/* 4. Footer */}
            <Footer twitterUrl={settings.twitter_follow} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Discord Claim Modal */}
      {isClaimModalOpen && claimToken && (
        <DiscordClaimModal
          claimToken={claimToken}
          onClose={() => setIsClaimModalOpen(false)}
        />
      )}
    </>
  );
}


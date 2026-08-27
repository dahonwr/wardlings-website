import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { CollectionSection } from './components/CollectionSection';
import { ApplicationSection } from './components/ApplicationSection';
import { OGFreeMintApplicationPage } from './components/OGFreeMintApplicationPage';
import { Footer } from './components/Footer';
import { MagicalForestEffects } from './components/MagicalForestEffects';
import { Settings } from './types';
import { fetchSettings } from './lib/storage';
import { scrollToId } from './lib/scroll';
import { useVisibilityRecovery } from './hooks/useVisibilityRecovery';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
  );

  const shouldReduceMotion = useReducedMotion();

  const [settings, setSettings] = useState<Settings>({
    twitter_follow: 'https://x.com/WardlingsNFT',
    twitter_like: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
    twitter_repost: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
    twitter_comment: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
    application_open: true,
    discord_link: 'https://discord.com/invite/AXjAt95DK',
    website_banner: ''
  });

  const [checkerTrigger, setCheckerTrigger] = useState(0);

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

    if (window.location.pathname.toLowerCase() !== '/applyogfreemint') {
      window.scrollTo(0, 0);
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

  const handleOpenApply = useCallback(() => {
    setCheckerTrigger((prev) => prev + 1);
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
            onOpenApply={handleOpenApply}
            onNavigateToOgApply={() => navigateTo('/applyogfreemint')}
            twitterUrl={settings.twitter_follow}
          />

          {/* Main Single-Page Sections */}
          <main className="relative z-10">
            {/* 1. Hero */}
            <HeroSection
              onOpenApply={handleOpenApply}
              onExploreClick={handleExploreClick}
              onNavigateToOgApply={() => navigateTo('/applyogfreemint')}
            />

            {/* 2. Sanctuary */}
            <AboutSection />

            {/* 3. Gallery */}
            <CollectionSection />

            {/* 4. Find Your Place (Winner Check) */}
            <ApplicationSection
              settings={settings}
              checkerTrigger={checkerTrigger}
            />
          </main>

          {/* 5. Footer */}
          <Footer twitterUrl={settings.twitter_follow} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}


import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { CollectionSection } from './components/CollectionSection';
import { ApplicationSection } from './components/ApplicationSection';
import { Footer } from './components/Footer';
import { MagicalForestEffects } from './components/MagicalForestEffects';
import { Settings } from './types';
import { fetchSettings } from './lib/storage';
import { scrollToId } from './lib/scroll';
import { useVisibilityRecovery } from './hooks/useVisibilityRecovery';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  useVisibilityRecovery();
  useScrollReveal();

  const [settings, setSettings] = useState<Settings>({
    twitter_follow: 'https://x.com/WardlingsNFT',
    twitter_like: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
    twitter_repost: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
    twitter_comment: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
    application_open: true,
    discord_link: 'https://discord.com/invite/AXjAt95DK',
    website_banner: ''
  });

  useEffect(() => {
    // Prevent the browser from restoring a previous scroll position on
    // refresh/reload — every fresh load should always begin at the Hero.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Ignore any URL hash on initial load (e.g. a stale #apply hash from a
    // previous session) and force the page to start at the top.
    window.scrollTo(0, 0);

    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await fetchSettings();
    setSettings(data);
  };

  const [checkerTrigger, setCheckerTrigger] = useState(0);

  // Memoized so children receiving these as props (Navbar, HeroSection)
  // don't see a new function identity — and therefore don't re-render —
  // on every App re-render.
  const handleOpenApply = useCallback(() => {
    setCheckerTrigger((prev) => prev + 1);
    scrollToId('apply');
  }, []);

  const handleExploreClick = useCallback(() => {
    scrollToId('collection');
  }, []);

  // Main Home Landing Page Single-Page Order:
  // 1. Hero
  // 2. Sanctuary (AboutSection)
  // 3. Gallery (CollectionSection)
  // 4. Find Your Place (ApplicationSection)
  // 5. Footer
  return (
    <div
      className="min-h-screen text-[#34281F] relative font-nunito selection:bg-[#F7BFD5] selection:text-[#34281F] overflow-x-hidden"
      style={{
        backgroundColor: '#FFFDF8'
      }}
    >
      <MagicalForestEffects />

      {/* Header */}
      <Navbar
        onOpenApply={handleOpenApply}
        twitterUrl={settings.twitter_follow}
      />

      {/* Main Single-Page Sections */}
      <main className="relative z-10">
        {/* 1. Hero */}
        <HeroSection
          onOpenApply={handleOpenApply}
          onExploreClick={handleExploreClick}
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
      <Footer
        twitterUrl={settings.twitter_follow}
      />
    </div>
  );
}

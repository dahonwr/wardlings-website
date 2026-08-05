import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { CollectionSection } from './components/CollectionSection';
import { ApplicationSection } from './components/ApplicationSection';
import { Footer } from './components/Footer';
import { MagicalForestEffects } from './components/MagicalForestEffects';
import { Settings } from './types';
import { fetchSettings } from './lib/storage';

export default function App() {
  const [settings, setSettings] = useState<Settings>({
    twitter_follow: 'https://x.com/WardlingsNFT',
    twitter_like: 'https://x.com/WardlingsNFT/status/1',
    twitter_repost: 'https://x.com/WardlingsNFT/status/1',
    twitter_comment: 'https://x.com/WardlingsNFT/status/1',
    application_open: true,
    discord_link: 'https://discord.gg/wardlings',
    website_banner: ''
  });

  useEffect(() => {
    loadSettings();

    if (window.location.hash === '#apply' || window.location.pathname === '/apply') {
      setTimeout(() => {
        const el = document.getElementById('apply');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  const loadSettings = async () => {
    const data = await fetchSettings();
    setSettings(data);
  };

  const handleOpenApply = () => {
    const el = document.getElementById('apply');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Main Home Landing Page Single-Page Order:
  // 1. Hero
  // 2. Sanctuary (AboutSection)
  // 3. Gallery (CollectionSection)
  // 4. Become a Keeper (ApplicationSection)
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
        discordUrl={settings.discord_link}
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

        {/* 4. Become a Keeper (Application) */}
        <ApplicationSection settings={settings} />
      </main>

      {/* 5. Footer */}
      <Footer
        twitterUrl={settings.twitter_follow}
        discordUrl={settings.discord_link}
      />
    </div>
  );
}

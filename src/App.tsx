/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MeetWardlings } from './components/MeetWardlings';
import { SanctuaryWorld } from './components/SanctuaryWorld';
import { WhitelistSection } from './components/WhitelistSection';
import { Footer } from './components/Footer';
import { CharacterModal } from './components/CharacterModal';
import { WardlingCharacter } from './types';

export default function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<WardlingCharacter | null>(null);

  const scrollToWhitelist = () => {
    const el = document.getElementById('whitelist');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2B241F] font-sans antialiased selection:bg-[#5E7D3A]/20 selection:text-[#5E7D3A]">
      {/* Sticky Header */}
      <Header onJoinWhitelistClick={scrollToWhitelist} />

      {/* Main Content Sections */}
      <main>
        {/* Section 1: Hero */}
        <Hero
          onJoinWhitelistClick={scrollToWhitelist}
          onExploreCollectionClick={scrollToCollection}
        />

        {/* Section 2: Meet the Wardlings (Collection) */}
        <MeetWardlings onSelectCharacter={(char) => setSelectedCharacter(char)} />

        {/* Section 3: The Sanctuary World (Split layout with Stats) */}
        <SanctuaryWorld />

        {/* Section 4: Whitelist Application */}
        <WhitelistSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Character Modal for "Learn More" */}
      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onJoinWhitelistClick={scrollToWhitelist}
      />
    </div>
  );
}

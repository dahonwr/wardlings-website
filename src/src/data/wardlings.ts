import { WardlingCharacter, RoadmapItem } from '../types';

export const WARDLING_CHARACTERS: WardlingCharacter[] = [
  {
    id: 'mossy',
    name: 'Mossy',
    element: 'Forest',
    shortDescription: 'A gentle creature who sleeps under old oak roots and tends to glowing forest mushrooms.',
    fullStory: 'Mossy was the very first spirit to wake in the Sanctuary. Shy and soft-spoken, Mossy spends sunny afternoons gathering dew drops to water young saplings and humming low tunes that make ferns bloom faster.',
    personality: 'Calm, patient, and deeply nurturing',
    favoriteFood: 'Fresh Dewberry Pancakes',
    habitat: 'Whispering Canopy',
    rarityTier: 'Sprout'
  },
  {
    id: 'pippin',
    name: 'Pippin',
    element: 'Ember',
    shortDescription: 'Curious and energetic, Pippin carries a tiny warm spark that lights up dark forest trails.',
    fullStory: 'Never still for more than a second, Pippin loves race-flying through fallen leaves and kindling campfire stories for nocturnal friends. Despite a fiery tail, Pippin is exceedingly careful not to singed a single acorn.',
    personality: 'Playful, optimistic, and adventurous',
    favoriteFood: 'Toasted Acorn Bites',
    habitat: 'Sunlit Ridge',
    rarityTier: 'Sprout'
  },
  {
    id: 'willow',
    name: 'Willow',
    element: 'Dew',
    shortDescription: 'A quiet guardian of clear streams who weaves lily pads into cozy floating nests.',
    fullStory: 'Willow glides gracefully over tranquil ponds, guiding lost fireflies back home before sunrise. Willow communicates through soft bell-like chimes that ripple across the water surface.',
    personality: 'Serene, thoughtful, and protective',
    favoriteFood: 'Sweet Lotus Nectar',
    habitat: 'Crystal Hollow',
    rarityTier: 'Ancient'
  },
  {
    id: 'bramble',
    name: 'Bramble',
    element: 'Gale',
    shortDescription: 'A mischievous leaf-skimmer who crafts tiny bamboo whistles to play wind melodies.',
    fullStory: 'Bramble rides gentle mountain breezes and loves surprising fellow Wardlings with playful gusts of cherry blossom petals. Beneath the playful nature lies a loyal heart that shields the Sanctuary from heavy storms.',
    personality: 'Cheeky, creative, and brave',
    favoriteFood: 'Cinnamon Cloud Berries',
    habitat: 'Breeze Pines',
    rarityTier: 'Sprout'
  }
];

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    phase: 'Phase 01',
    title: 'The Seedling Stage',
    status: 'In Progress',
    description: 'Establishing the roots of the Wardlings Sanctuary community.',
    deliverables: [
      'Official website launch & whitelist opening',
      'Keeper Sanctuary Discord setup',
      'Character lore reveal & interactive previews',
      'Community cozy gaming nights & art showcases'
    ]
  },
  {
    phase: 'Phase 02',
    title: 'Awakening of the 4,444',
    status: 'Upcoming',
    description: 'The official collection minting event for whitelist Keepers on Ethereum.',
    deliverables: [
      'Fair whitelist minting process',
      'IPFS metadata pinning & high-res artwork reveal',
      'Secondary marketplace verification',
      'Keeper holder role verification'
    ]
  },
  {
    phase: 'Phase 03',
    title: 'Sanctuary Expansion',
    status: 'Upcoming',
    description: 'Nurturing companion perks and physical collectible experiences.',
    deliverables: [
      'Physical plushie & cozy merch rewards',
      'Lore book & digital Sanctuary map release',
      'Community treasury setup for environmental causes',
      'Keeper-only forest meetups & events'
    ]
  },
  {
    phase: 'Phase 04',
    title: 'The Eternal Forest',
    status: 'Upcoming',
    description: 'Cozy interactive virtual space for Wardlings and their Keepers.',
    deliverables: [
      'Interactive cozy desktop companion app',
      'Soundtrack vinyl release & lo-fi audio player',
      'Cross-community sanctuary collaborations',
      'Seasonal forest growth events'
    ]
  }
];

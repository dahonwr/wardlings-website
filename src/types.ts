export interface WardlingCharacter {
  id: string;
  name: string;
  element: 'Forest' | 'Flora' | 'Ember' | 'Dew' | 'Gale';
  shortDescription: string;
  fullStory: string;
  personality: string;
  favoriteFood: string;
  habitat: string;
  rarityTier: 'Sprout' | 'Ancient' | 'Mythic' | 'Celestial';
}

export interface WhitelistFormData {
  walletAddress: string;
  xHandle: string;
  commentLink: string;
  reason: string;
  confirmed: boolean;
}

export interface WhitelistChecklistState {
  followX: boolean;
  likePost: boolean;
  repostPost: boolean;
  commentPost: boolean;
}

export interface RoadmapItem {
  phase: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  description: string;
  deliverables: string[];
}

export type WhitelistStatus = 'pending' | 'approved' | 'rejected' | 'Growing' | 'Selected';

export interface WhitelistApplication {
  id: string;
  created_at: string;
  updated_at?: string;
  x_handle: string;
  wallet_address?: string | null;
  comment_link?: string | null;
  current_step: number;
  completed: boolean;
  status: WhitelistStatus;
}

export interface TaskProgress {
  id?: string;
  application_id: string;
  task_name: 'follow_x' | 'like_pinned' | 'repost_pinned' | 'comment_pinned' | string;
  completed: boolean;
  completed_at?: string;
}

export interface AdminNote {
  id?: string;
  application_id: string;
  notes: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export type ApplicationStatus = WhitelistStatus;

// Legacy Application interface alias for backward compatibility with admin views
export interface Application {
  id: string;
  created_at: string;
  updated_at?: string;
  twitter_username: string; // mapped from x_handle
  x_handle?: string;
  wallet_address: string;
  comment_link?: string;
  status: WhitelistStatus;
  completed_tasks: boolean;
  current_step?: number;
  completed?: boolean;
  review_notes?: string;
  selected?: boolean;
  user_agent?: string;
}

export interface Settings {
  id?: string;
  twitter_follow: string;
  twitter_like: string;
  twitter_repost: string;
  twitter_comment: string;
  application_open: boolean;
  discord_link: string;
  website_banner?: string;
  hero_illustration?: string;
}

export type RarityCategory = 'Hero' | 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common' | 'Mythic' | '1of1';

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: RarityCategory;
  description?: string;
  created_at?: string;
}

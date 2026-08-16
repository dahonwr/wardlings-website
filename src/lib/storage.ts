import { Application, Settings, GalleryItem } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_SETTINGS: Settings = {
  twitter_follow: 'https://x.com/WardlingsNFT',
  twitter_like: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
  twitter_repost: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
  twitter_comment: 'https://x.com/wardlingsnft/status/2085351433776636116?s=20',
  application_open: true,
  discord_link: 'https://discord.com/invite/AXjAt95DK',
  website_banner: '🌿 The Sanctuary gates are now accepting Keeper applications!',
  hero_illustration: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Hero1.jpg'
};

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'g-hero',
    title: 'Elder Sanctuary Hero',
    category: 'Hero',
    url: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Hero1.jpg',
    description: 'Ancient protector of the mother tree, bearing radiant starlight spores.'
  },
  {
    id: 'g-legendary',
    title: 'Sunburst Legendary',
    category: 'Legendary',
    url: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Legendary.jpg',
    description: 'Spotted near the golden streams of the eastern clearing.'
  },
  {
    id: 'g-epic',
    title: 'Mossy Canopy Epic',
    category: 'Epic',
    url: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Epic.jpg',
    description: 'Wears a crown of luminescent mushrooms and ancient fern leaves.'
  },
  {
    id: 'g-uncommon',
    title: 'Pebble Wanderer',
    category: 'Uncommon',
    url: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Uncommon.jpg',
    description: 'Curious explorer with smooth river stone horns.'
  },
  {
    id: 'g-common',
    title: 'Sprout Scout',
    category: 'Common',
    url: 'https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Common.jpg',
    description: 'Friendly woodland resident tending to tiny acorn seedlings.'
  }
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    twitter_username: 'forest_guardian',
    wallet_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    status: 'Selected',
    completed_tasks: true,
    review_notes: 'Active community supporter & art enthusiast!',
    selected: true
  },
  {
    id: 'app-2',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    twitter_username: 'cozy_keeper99',
    wallet_address: '0x2546BcD3D6812329051d95745b37666270b89F0f',
    status: 'Growing',
    completed_tasks: true,
    selected: false
  },
  {
    id: 'app-3',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    twitter_username: 'sanctuary_leaf',
    wallet_address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    status: 'Growing',
    completed_tasks: true,
    selected: false
  }
];

// Local storage keys
const APPS_KEY = 'wardlings_applications';
const SETTINGS_KEY = 'wardlings_settings';
const GALLERY_KEY = 'wardlings_gallery';

export async function fetchSettings(): Promise<Settings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('settings').select('*').limit(1).single();
      if (!error && data) return { ...INITIAL_SETTINGS, ...data };
    } catch (e) {
      console.warn('Supabase fetchSettings error, falling back to local', e);
    }
  }
  const cached = localStorage.getItem(SETTINGS_KEY);
  return cached ? JSON.parse(cached) : INITIAL_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('settings').upsert([settings]);
    } catch (e) {
      console.warn('Supabase saveSettings error', e);
    }
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function fetchApplications(): Promise<Application[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetchApplications error', e);
    }
  }
  const cached = localStorage.getItem(APPS_KEY);
  return cached ? JSON.parse(cached) : INITIAL_APPLICATIONS;
}

export async function submitApplication(appData: {
  twitter_username: string;
  wallet_address: string;
  completed_tasks: boolean;
}): Promise<{ success: boolean; application?: Application; error?: string }> {
  const cleanUsername = appData.twitter_username.trim().replace(/^@/, '').toLowerCase();
  const cleanWallet = appData.wallet_address.trim().toLowerCase();

  const existingApps = await fetchApplications();

  // Validate duplicate usernames
  if (existingApps.some(a => a.twitter_username.toLowerCase() === cleanUsername)) {
    return { success: false, error: 'This X username has already planted a seed in the Sanctuary!' };
  }

  // Validate duplicate wallets
  if (existingApps.some(a => a.wallet_address.toLowerCase() === cleanWallet)) {
    return { success: false, error: 'This wallet address has already been submitted!' };
  }

  const newApp: Application = {
    id: `app-${Date.now()}`,
    created_at: new Date().toISOString(),
    twitter_username: cleanUsername,
    wallet_address: appData.wallet_address.trim(),
    status: 'Growing',
    completed_tasks: appData.completed_tasks,
    selected: false,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser'
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { id: _customId, ...appPayload } = newApp;
      const { data, error } = await supabase.from('applications').insert([appPayload]).select().single();
      if (!error && data) {
        return { success: true, application: data };
      }
    } catch (e) {
      console.warn('Supabase submitApplication error', e);
    }
  }

  const updated = [newApp, ...existingApps];
  localStorage.setItem(APPS_KEY, JSON.stringify(updated));
  return { success: true, application: newApp };
}

export async function updateApplication(id: string, updates: Partial<Application>): Promise<void> {
  const apps = await fetchApplications();
  const updatedApps = apps.map(app => {
    if (app.id === id) {
      return { ...app, ...updates };
    }
    return app;
  });

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('applications').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateApplication error', e);
    }
  }
  localStorage.setItem(APPS_KEY, JSON.stringify(updatedApps));
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetchGallery error', e);
    }
  }
  const cached = localStorage.getItem(GALLERY_KEY);
  return cached ? JSON.parse(cached) : INITIAL_GALLERY;
}

export async function saveGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
  const newItem: GalleryItem = {
    ...item,
    id: `g-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  const gallery = await fetchGallery();
  const updated = [newItem, ...gallery];

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('gallery').insert([newItem]);
    } catch (e) {
      console.warn('Supabase saveGalleryItem error', e);
    }
  }

  localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
  return newItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const gallery = await fetchGallery();
  const updated = gallery.filter(i => i.id !== id);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('gallery').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteGalleryItem error', e);
    }
  }

  localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
}

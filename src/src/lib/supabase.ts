import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://osyvztzqmtimbefklcsn.supabase.co';

const rawKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

// Provide a non-empty fallback key so createClient doesn't throw on app boot
export const supabaseAnonKey =
  rawKey && rawKey !== 'PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE'
    ? rawKey
    : 'sb_publishable_key_placeholder';

export const isSupabaseConfigured = Boolean(
  rawKey && rawKey !== 'PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


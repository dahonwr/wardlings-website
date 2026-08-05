import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://osyvztzqmtimbefklcsn.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_bgGoImIYII8Y2eSC5tDBhg_utnTIL2d';

const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Global in-memory storage — persists across all screens during app session
const memoryStorage: Record<string, string> = {};

const storage = {
  getItem: (key: string) => {
    const value = memoryStorage[key] ?? null;
    return Promise.resolve(value);
  },
  setItem: (key: string, value: string) => {
    memoryStorage[key] = value;
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    delete memoryStorage[key];
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
});

// Debug helper — check if session exists
export async function debugSession() {
  const { data } = await supabase.auth.getSession();
  console.log('[auth] session exists:', !!data.session);
  console.log('[auth] user:', data.session?.user?.id ?? 'none');
  console.log('[auth] storage keys:', Object.keys(memoryStorage));
  return data.session;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// In-memory storage for Expo Go (AsyncStorage crashes in SDK 54)
// Replace with AsyncStorage when using custom dev build
const memoryStorage: Record<string, string> = {};
const storage = {
  getItem: (key: string) => Promise.resolve(memoryStorage[key] ?? null),
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
  },
});

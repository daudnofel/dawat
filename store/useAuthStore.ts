import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isNewUser: boolean;

  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setIsNewUser: (isNew: boolean) => void;

  initialize: () => Promise<void>;
  fetchUser: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  isNewUser: false,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setIsNewUser: (isNew) => set({ isNewUser: isNew }),

  initialize: async () => {
    set({ loading: true });

    const { data: { session } } = await supabase.auth.getSession();
    set({ session });

    if (session?.user?.id) {
      await get().fetchUser(session.user.id);
    }

    set({ loading: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session });

      if (session?.user?.id) {
        await get().fetchUser(session.user.id);
      } else {
        set({ user: null });
      }
    });
  },

  fetchUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      set({ user: null, isNewUser: true });
      return;
    }

    set({ user: data as User, isNewUser: false });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isNewUser: false });
  },
}));

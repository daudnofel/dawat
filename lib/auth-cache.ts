import { supabase } from './supabase';

// Cache the authenticated user so we don't re-fetch every screen
let cachedUserId: string | null = null;

export async function getCurrentUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    cachedUserId = user.id;
  }
  return cachedUserId;
}

export function setCurrentUserId(id: string | null) {
  cachedUserId = id;
}

export function clearCurrentUserId() {
  cachedUserId = null;
}

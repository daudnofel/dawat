import { supabase } from './supabase';

let cachedUserId: string | null = null;

export async function getCurrentUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;

  try {
    // Race against a 3-second timeout — getUser() can hang with in-memory storage
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);

    if (result && 'data' in result && result.data?.user) {
      cachedUserId = result.data.user.id;
    }
  } catch {
    // Auth failed — return null, don't hang
  }

  return cachedUserId;
}

export function setCurrentUserId(id: string | null) {
  cachedUserId = id;
}

export function clearCurrentUserId() {
  cachedUserId = null;
}

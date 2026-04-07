// lib/recently-viewed.ts
// Tracks the last N event IDs the user has visited.
// Stored in AsyncStorage — Phase 1 of Home Tab Refactor (DAW-23).
// Will be migrated to a Supabase event_views table in Phase 2.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@dawat:recently_viewed_event_ids';
const MAX_RECENT = 10;

export async function pushRecentlyViewed(eventId: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    // Move to front, dedupe, cap
    const next = [eventId, ...existing.filter((id) => id !== eventId)].slice(0, MAX_RECENT);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Silently ignore — recently viewed is non-critical
  }
}

export async function getRecentlyViewed(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearRecentlyViewed(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

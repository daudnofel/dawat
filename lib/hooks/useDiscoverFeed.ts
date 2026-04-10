import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { GenderMode } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────
export interface DiscoverEvent {
  id: string;
  title: string;
  theme_id: string;
  poster_url: string | null;
  description: string | null;
  gender_mode: GenderMode;
  is_halal_venue: boolean;
  price: number;
  capacity: number | null;
  date_time: string | null;
  location_name: string | null;
  host_id: string;
  slug: string;
  rsvps:
    | { status: string; children_count?: number; plus_one_names?: string[] }[]
    | null;
  going: number;
}

export type DiscoverFilter = {
  time?: 'tonight' | 'this_week' | 'after_maghrib';
  category?: 'social' | 'food' | 'active' | 'deen' | 'family';
  audience?: 'sisters' | 'brothers' | 'singles';
};

export interface DateGroup {
  date: string; // YYYY-MM-DD
  label: string; // "Today" / "Tomorrow" / "Saturday Apr 11"
  events: DiscoverEvent[];
}

export interface DiscoverFeed {
  tonight: DiscoverEvent[];
  thisWeek: DiscoverEvent[];
  popular: DiscoverEvent[];
  byDate: DateGroup[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ─── Internals ────────────────────────────────────────────────────────
const SELECT =
  'id, title, theme_id, poster_url, description, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status, children_count, plus_one_names)';

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function dateLabel(d: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────
/**
 * Single source of truth for the Discover screen feed.
 *
 * Fetches upcoming published events in one query and slices them into
 * the four sections rendered by Discover: tonight, this week, popular,
 * and a date-grouped catalogue.
 *
 * The optional `filter` parameter feeds the upcoming filter chip bar
 * (DAW-27). For DAW-26 only `audience` is wired through to the query.
 */
export function useDiscoverFeed(filter?: DiscoverFilter): DiscoverFeed {
  const [events, setEvents] = useState<DiscoverEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audienceFilter = filter?.audience;

  const fetchFeed = useCallback(async () => {
    setError(null);
    const now = new Date().toISOString();

    let query = supabase
      .from('events')
      .select(SELECT)
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .gte('date_time', now)
      .order('date_time', { ascending: true })
      .limit(50);

    if (audienceFilter === 'sisters') {
      query = query.eq('gender_mode', 'sisters_only');
    } else if (audienceFilter === 'brothers') {
      query = query.eq('gender_mode', 'brothers_only');
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    const mapped: DiscoverEvent[] = (data ?? []).map((e: any) => ({
      ...e,
      going: (e.rsvps ?? []).filter(
        (r: any) => r.status === 'yes' || r.status === 'inshallah'
      ).length,
    }));

    setEvents(mapped);
    setLoading(false);
  }, [audienceFilter]);

  useEffect(() => {
    setLoading(true);
    fetchFeed();
  }, [fetchFeed]);

  const sliced = useMemo(() => {
    const now = new Date();
    const eod = endOfToday();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const withDate = events.filter((e) => e.date_time != null);

    const tonight = withDate.filter((e) => {
      const d = new Date(e.date_time!);
      return d >= now && d <= eod;
    });

    const thisWeek = withDate.filter((e) => {
      const d = new Date(e.date_time!);
      return d > eod && d <= oneWeek;
    });

    const popular = [...events].sort((a, b) => b.going - a.going).slice(0, 10);

    const groups = new Map<string, DiscoverEvent[]>();
    for (const e of withDate) {
      const d = new Date(e.date_time!);
      const key = dateKey(d);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    const byDate: DateGroup[] = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, evs]) => ({
        date: key,
        label: dateLabel(new Date(evs[0].date_time!)),
        events: evs,
      }));

    return { tonight, thisWeek, popular, byDate };
  }, [events]);

  return {
    ...sliced,
    loading,
    error,
    refresh: fetchFeed,
  };
}

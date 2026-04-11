// lib/hooks/useDiscoverCalendar.ts
// DAW-28 — Pure state hook for Discover's calendar mode.
//
// Manages the current month (first of month, local tz) and the selected date.
// Exposes navigation helpers: goToMonth(delta), goToToday(), selectDate(date).
//
// This is intentionally NOT wrapped around useDiscoverFeed. The parent shell
// (trending.tsx) calls useDiscoverFeed once and passes eventsByDate down so
// one Supabase fetch serves both List and Calendar modes. useDiscoverCalendar
// only owns calendar-specific UI state.

import { useState, useCallback, useMemo } from 'react';

/** First-of-month Date at 00:00:00 local time. */
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

/** Start of day at 00:00:00 local time. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export interface DiscoverCalendarState {
  /** First day of the currently displayed month (local tz). */
  currentMonth: Date;
  /** Currently selected day, or null if nothing is selected. Defaults to today. */
  selectedDate: Date | null;
  /** True when currentMonth === the month that contains today. */
  isCurrentMonth: boolean;
  /** Advance the current month by `delta` months (negative = back). */
  goToMonth: (delta: number) => void;
  /** Jump to today's month and select today. */
  goToToday: () => void;
  /** Select a specific date (also switches month if necessary). */
  selectDate: (date: Date) => void;
}

/**
 * State hook powering calendar mode navigation. Holds no data — data comes
 * from useDiscoverFeed at the parent shell level.
 */
export function useDiscoverCalendar(
  initialDate: Date = new Date()
): DiscoverCalendarState {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(initialDate));
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    startOfDay(initialDate)
  );

  const goToMonth = useCallback((delta: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return startOfMonth(next);
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = startOfDay(new Date());
    setCurrentMonth(startOfMonth(today));
    setSelectedDate(today);
  }, []);

  const selectDate = useCallback((date: Date) => {
    const day = startOfDay(date);
    setSelectedDate(day);
    setCurrentMonth((prev) => (sameMonth(prev, day) ? prev : startOfMonth(day)));
  }, []);

  const isCurrentMonth = useMemo(
    () => sameMonth(currentMonth, new Date()),
    [currentMonth]
  );

  return {
    currentMonth,
    selectedDate,
    isCurrentMonth,
    goToMonth,
    goToToday,
    selectDate,
  };
}

// lib/dayVisuals.ts
// DAW-33 — Shared cell-rendering logic for calendar day circles.
//
// Derives a `DayVisuals` bundle from the events on a given day, so
// MonthGrid (DAW-34) and any future consumer can make consistent
// visual decisions: what tint to paint the day circle, how strong the
// alpha should be, whether to show a count badge.
//
// Pure function — no UI, no hooks, no side effects. Safe to call inside
// render paths.
//
// Design rationale:
//   Poster thumbnails at 32px hurt legibility and performance. Instead
//   we reuse data we already have — each event's theme has an
//   `accents.primary` color (DAW-22) — to tint the day circle with the
//   *feeling* of the event. For days with multiple events we deepen
//   the tint and let the count badge carry the multi-event signal.

import { DiscoverEvent } from './hooks/useDiscoverFeed';
import { getThemeById } from './themes';

// Alpha for the day-circle background tint.
// Kept low so day numbers remain readable on top.
export const SINGLE_EVENT_TINT_ALPHA = 0.22;
export const MULTI_EVENT_TINT_ALPHA = 0.35;

export interface DayVisuals {
  /** Theme accent color to tint the day circle with, or null when no events. */
  tintColor: string | null;
  /** How strongly to paint the tint (0..1). 0 when no events. */
  tintAlpha: number;
  /** Number of events on this day. */
  eventCount: number;
  /** Theme id of the first event — exposed for debugging / future use. */
  primaryThemeId: string | null;
}

const EMPTY_VISUALS: DayVisuals = {
  tintColor: null,
  tintAlpha: 0,
  eventCount: 0,
  primaryThemeId: null,
};

/**
 * Translate an optional array of events on a day into the visual
 * parameters MonthGrid uses to paint its cell.
 *
 * The first event's theme wins the tint — we don't try to blend
 * multiple themes, which gets muddy fast. When multiple events share
 * a day we deepen the alpha instead, then let a count badge carry the
 * multi-event signal.
 */
export function getDayVisuals(
  events: DiscoverEvent[] | undefined
): DayVisuals {
  if (!events || events.length === 0) {
    return EMPTY_VISUALS;
  }

  const primary = events[0];
  const theme = getThemeById(primary.theme_id);
  const tintColor = theme?.accents?.primary ?? null;

  return {
    tintColor,
    tintAlpha:
      events.length >= 2 ? MULTI_EVENT_TINT_ALPHA : SINGLE_EVENT_TINT_ALPHA,
    eventCount: events.length,
    primaryThemeId: primary.theme_id ?? null,
  };
}

/**
 * Helper for styling: converts a hex color like `#C9A84C` to an
 * `rgba(…)` string with the given alpha. Returns `'transparent'` for
 * invalid inputs so callers can pass the result straight into a style.
 */
export function tintBackground(
  hex: string | null,
  alpha: number
): string {
  if (!hex) return 'transparent';
  const clean = hex.replace('#', '');
  if (clean.length !== 3 && clean.length !== 6) return 'transparent';
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return 'transparent';
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

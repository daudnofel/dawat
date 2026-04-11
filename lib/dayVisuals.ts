// lib/dayVisuals.ts
// DAW-33 — Shared cell-rendering logic for calendar day circles.
// DAW-50 — Upgraded to a four-tier tint intensity scale so the tint
//          alone can carry both *presence* and *density*. The corner
//          count badge from DAW-34 is retired in MonthGrid — trust the
//          tint to communicate how packed a day is.
//
// Derives a `DayVisuals` bundle from the events on a given day, so
// MonthGrid and any future consumer can make consistent visual
// decisions: what tint to paint the day circle and how strong the
// alpha should be.
//
// Pure function — no UI, no hooks, no side effects. Safe to call inside
// render paths.
//
// Design rationale:
//   Poster thumbnails at 32px hurt legibility and performance. Instead
//   we reuse data we already have — each event's theme has an
//   `accents.primary` color (DAW-22) — to tint the day circle with the
//   *feeling* of the event. A 4-tier alpha scale (0.22 / 0.32 / 0.42 /
//   0.52) lets the density of a day read at a glance, from "has one
//   thing" to "packed," without any extra UI chrome.

import { DiscoverEvent } from './hooks/useDiscoverFeed';
import { getThemeById } from './themes';

// ─── Tint tiers ───────────────────────────────────────────────────────
// Alpha for the day-circle background tint, scaled by event count.
// Kept modest so day numbers remain readable on top. Step size of ~0.10
// between tiers so adjacent days with 1 vs 2 events read as meaningfully
// different, without any tier becoming opaque.
export const TINT_ALPHA_1 = 0.22;
export const TINT_ALPHA_2 = 0.32;
export const TINT_ALPHA_3_4 = 0.42;
export const TINT_ALPHA_5_PLUS = 0.52;

// Back-compat aliases for any consumer still importing the old names.
// Safe to remove once DAW-34 landmarks are all migrated.
export const SINGLE_EVENT_TINT_ALPHA = TINT_ALPHA_1;
export const MULTI_EVENT_TINT_ALPHA = TINT_ALPHA_2;

/** Maps an event count to the right tint alpha tier. Pure. */
export function tintAlphaForCount(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return TINT_ALPHA_1;
  if (count === 2) return TINT_ALPHA_2;
  if (count <= 4) return TINT_ALPHA_3_4;
  return TINT_ALPHA_5_PLUS;
}

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
 * multiple themes, which gets muddy fast. Density is carried by
 * `tintAlpha`, which scales through `tintAlphaForCount` so a 1-event
 * day, a 2-event day, a 3–4 event day, and a 5+ event day all read as
 * meaningfully different without any badge or dot chrome.
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
    tintAlpha: tintAlphaForCount(events.length),
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

// components/MonthGrid.tsx
// DAW-29 — Month grid for Discover's calendar mode.
// DAW-34 — Day cells upgraded to themed tinted circles + corner count
//          badge, replacing the old 3-dot marker pattern.
// DAW-50 — Polish pass: corner count badge retired in favor of a
//          four-tier tint intensity scale driven by
//          `tintAlphaForCount`. CELL_HEIGHT and DAY_CIRCLE tightened
//          now that the cell no longer carries any sub-circle chrome.
//          Out-of-month days stop applying a full-cell opacity fade
//          and skip tint entirely — their muted day number is enough.
//
// Pure, presentational 6x7 day grid. Parent supplies currentMonth,
// selectedDate, eventsByDate, and onSelectDate. This file owns:
//   • Weekday header (S M T W T F S)
//   • 42 day cells (6 rows × 7 cols, stable layout)
//   • "In-month" vs "adjacent month" styling
//   • Today ring, selected filled circle
//   • Theme-tinted day-circle background via getDayVisuals()
//   • Haptic feedback on cell press
//
// No data fetching or date arithmetic beyond what the grid needs.
// Month/selected state lives in useDiscoverCalendar (DAW-28).
// Day visual logic lives in lib/dayVisuals.ts (DAW-33 / DAW-50).

import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../lib/theme';
import { DiscoverEvent } from '../lib/hooks/useDiscoverFeed';
import { getDayVisuals, tintBackground } from '../lib/dayVisuals';

// ─── Constants ────────────────────────────────────────────────────────
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const CELLS = 42; // 6 rows × 7 cols — stable layout across every month

// ─── Helpers ──────────────────────────────────────────────────────────
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
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

/** Returns 42 day objects covering the 6-row grid for a given month. */
function buildGridDays(monthStart: Date): {
  date: Date;
  inMonth: boolean;
}[] {
  // First visible cell = Sunday on or before the 1st of the month.
  const firstDayOfMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    1
  );
  const firstCell = new Date(firstDayOfMonth);
  firstCell.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  const days: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < CELLS; i++) {
    const d = new Date(firstCell);
    d.setDate(firstCell.getDate() + i);
    days.push({
      date: d,
      inMonth: d.getMonth() === monthStart.getMonth(),
    });
  }
  return days;
}

// ─── Types ────────────────────────────────────────────────────────────
interface Props {
  /** First-of-month (local tz). */
  currentMonth: Date;
  /** Currently selected day (or null). */
  selectedDate: Date | null;
  /** YYYY-MM-DD → events, from useDiscoverFeed. */
  eventsByDate: Map<string, DiscoverEvent[]>;
  /** Fires when a day cell is tapped. */
  onSelectDate: (date: Date) => void;
}

// ─── Component ────────────────────────────────────────────────────────
export default function MonthGrid({
  currentMonth,
  selectedDate,
  eventsByDate,
  onSelectDate,
}: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const days = useMemo(() => buildGridDays(currentMonth), [currentMonth]);

  const handlePress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(date);
  };

  return (
    <View style={styles.wrap}>
      {/* Weekday header */}
      <View style={styles.weekHeader}>
        {WEEKDAYS.map((w, i) => (
          <View key={`${w}-${i}`} style={styles.weekCell}>
            <Text style={styles.weekText}>{w}</Text>
          </View>
        ))}
      </View>

      {/* 6x7 grid */}
      <View style={styles.grid}>
        {days.map(({ date, inMonth }) => {
          const key = dateKey(date);
          const events = eventsByDate.get(key);
          const visuals = getDayVisuals(events);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          // Tint only applies to in-month days that aren't selected.
          // • Out-of-month: skip entirely — the muted day number is
          //   enough; tinting adjacent-month days would stack two mute
          //   treatments and wash the cell out.
          // • Selected: the solid gold fill owns the cell visually.
          const tintStyle =
            inMonth && !isSelected && visuals.tintColor
              ? {
                  backgroundColor: tintBackground(
                    visuals.tintColor,
                    visuals.tintAlpha
                  ),
                }
              : null;

          return (
            <Pressable
              key={key}
              onPress={() => handlePress(date)}
              accessibilityRole="button"
              accessibilityLabel={`${date.toDateString()}${
                visuals.eventCount > 0
                  ? `, ${visuals.eventCount} ${
                      visuals.eventCount === 1 ? 'event' : 'events'
                    }`
                  : ''
              }`}
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.cell,
                pressed && !isSelected && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.dayCircle,
                  tintStyle,
                  isToday && !isSelected && styles.todayRing,
                  isSelected && styles.selectedFill,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !inMonth && styles.dayTextMuted,
                    isToday && !isSelected && styles.todayText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
// DAW-50: tightened rhythm. The old 48px cell accommodated a dot row
// under the day circle; without that, 42px feels right and the grid
// breathes as a single surface. DAY_CIRCLE bumped to 34px so the tint
// has a touch more surface area to read on.
const CELL_HEIGHT = 42;
const DAY_CIRCLE = 34;

const styles = StyleSheet.create({
  wrap: {
    marginTop: SPACING.sm,
  },

  weekHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  weekText: {
    fontSize: 11,
    color: COLORS.muted,
    ...FONTS.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },

  dayCircle: {
    width: DAY_CIRCLE,
    height: DAY_CIRCLE,
    borderRadius: DAY_CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRing: {
    borderWidth: 1.5,
    borderColor: COLORS.gold2,
  },
  selectedFill: {
    backgroundColor: COLORS.gold2,
  },

  dayText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.medium,
  },
  dayTextMuted: {
    color: COLORS.hint,
  },
  todayText: {
    color: COLORS.gold2,
    ...FONTS.bold,
  },
  selectedText: {
    color: COLORS.dark,
    ...FONTS.bold,
  },

});

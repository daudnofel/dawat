// components/MonthGrid.tsx
// DAW-29 — Month grid for Discover's calendar mode.
// DAW-34 — Day cells upgraded to themed tinted circles + corner count
//          badge. Replaces the old 3-dot marker pattern with a richer,
//          more scalable visual language that leans on event theme
//          identity (event.theme.accents.primary) without thumbnails.
//
// Pure, presentational 6x7 day grid. Parent supplies currentMonth,
// selectedDate, eventsByDate, and onSelectDate. This file owns:
//   • Weekday header (S M T W T F S)
//   • 42 day cells (6 rows × 7 cols, stable layout)
//   • "In-month" vs "adjacent month" styling
//   • Today ring, selected filled circle
//   • Theme-tinted day-circle background via getDayVisuals()
//   • Corner count badge for days with 2+ events
//   • Haptic feedback on cell press
//
// No data fetching or date arithmetic beyond what the grid needs.
// Month/selected state lives in useDiscoverCalendar (DAW-28).
// Day visual logic lives in lib/dayVisuals.ts (DAW-33).

import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../lib/theme';
import { DiscoverEvent } from '../lib/hooks/useDiscoverFeed';
import { getDayVisuals, tintBackground } from '../lib/dayVisuals';

// ─── Constants ────────────────────────────────────────────────────────
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const CELLS = 42; // 6 rows × 7 cols — stable layout across every month
const OUT_OF_MONTH_OPACITY = 0.35;

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

          // Tint is only applied when the cell is NOT in the selected state —
          // the selected fill is a solid gold disc and should win visually.
          const tintStyle =
            !isSelected && visuals.tintColor
              ? {
                  backgroundColor: tintBackground(
                    visuals.tintColor,
                    visuals.tintAlpha
                  ),
                }
              : null;

          const showCountBadge = visuals.eventCount >= 2;

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
                !inMonth && { opacity: OUT_OF_MONTH_OPACITY },
                pressed && !isSelected && { opacity: 0.7 },
              ]}
            >
              <View style={styles.dayCircleWrap}>
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

                {showCountBadge && (
                  <View
                    style={[
                      styles.countBadge,
                      isSelected && styles.countBadgeOnSelected,
                    ]}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  >
                    <Text
                      style={[
                        styles.countBadgeText,
                        isSelected && styles.countBadgeTextOnSelected,
                      ]}
                    >
                      {visuals.eventCount > 9 ? '9+' : visuals.eventCount}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const CELL_HEIGHT = 48;
const DAY_CIRCLE = 32;

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

  dayCircleWrap: {
    width: DAY_CIRCLE,
    height: DAY_CIRCLE,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Corner count badge — shown on days with 2+ events.
  countBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    backgroundColor: COLORS.gold2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.dark,
  },
  countBadgeOnSelected: {
    backgroundColor: COLORS.dark,
    borderColor: COLORS.gold2,
  },
  countBadgeText: {
    fontSize: 9,
    color: COLORS.dark,
    ...FONTS.bold,
    lineHeight: 10,
  },
  countBadgeTextOnSelected: {
    color: COLORS.gold2,
  },
});

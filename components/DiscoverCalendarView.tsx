// components/DiscoverCalendarView.tsx
// DAW-27 — Initial shell (stub placeholder)
// DAW-28 — Wires up real calendar state (useDiscoverCalendar) and exposes
//          a sanity-check panel showing the current month, selected date,
//          and event count. Real MonthGrid + AgendaPanel arrive in DAW-29/30.

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import EmptyState from './EmptyState';
import { DiscoverEvent, DiscoverFilter } from '../lib/hooks/useDiscoverFeed';
import { useDiscoverCalendar } from '../lib/hooks/useDiscoverCalendar';

interface Props {
  eventsByDate: Map<string, DiscoverEvent[]>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Passed through for filter-aware calendar UI in DAW-31. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter: DiscoverFilter;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function DiscoverCalendarView({
  eventsByDate,
  error,
}: Props) {
  const {
    currentMonth,
    selectedDate,
    isCurrentMonth,
    goToMonth,
    goToToday,
    selectDate,
  } = useDiscoverCalendar();

  if (error) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="⚠️"
          title="Couldn't load calendar"
          subtitle={error}
        />
      </View>
    );
  }

  const selectedKey = selectedDate ? dateKey(selectedDate) : null;
  const selectedEvents = selectedKey
    ? eventsByDate.get(selectedKey) ?? []
    : [];
  const monthKey = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, '0')}`;
  const monthEventCount = Array.from(eventsByDate.entries())
    .filter(([k]) => k.startsWith(monthKey))
    .reduce((sum, [, evs]) => sum + evs.length, 0);

  return (
    <View style={styles.container}>
      {/* Placeholder month header — real one arrives in DAW-29 */}
      <View style={styles.monthHeader}>
        <Pressable
          onPress={() => goToMonth(-1)}
          style={({ pressed }) => [styles.chev, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Previous month"
        >
          <Text style={styles.chevText}>‹</Text>
        </Pressable>
        <View style={styles.monthLabelWrap}>
          <Text style={styles.monthText}>{monthLabel(currentMonth)}</Text>
          <Text style={styles.monthSubtitle}>
            {monthEventCount} {monthEventCount === 1 ? 'event' : 'events'} this month
          </Text>
        </View>
        <Pressable
          onPress={() => goToMonth(1)}
          style={({ pressed }) => [styles.chev, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Next month"
        >
          <Text style={styles.chevText}>›</Text>
        </Pressable>
      </View>

      {!isCurrentMonth && (
        <Pressable
          onPress={goToToday}
          style={({ pressed }) => [
            styles.todayPill,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Text style={styles.todayText}>Jump to today</Text>
        </Pressable>
      )}

      {/* Sanity-check card — real MonthGrid arrives in DAW-29 */}
      <Pressable
        style={styles.sanityCard}
        onPress={() => selectDate(new Date())}
      >
        <Text style={styles.sanityHeader}>DAW-28 sanity check</Text>
        <Text style={styles.sanityLine}>
          Selected: {selectedDate ? dayLabel(selectedDate) : '—'}
        </Text>
        <Text style={styles.sanityLine}>
          Events on selected day:{' '}
          <Text style={styles.sanityHighlight}>{selectedEvents.length}</Text>
        </Text>
        <Text style={styles.sanityHint}>
          (Tap this card to reset selection to today. MonthGrid UI ships in DAW-29.)
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },

  // Month header (placeholder — real one in DAW-29)
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  chev: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  chevText: {
    fontSize: 22,
    color: COLORS.gold2,
    ...FONTS.bold,
    marginTop: -2,
  },
  monthLabelWrap: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.3,
  },
  monthSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 2,
  },

  todayPill: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.55)',
    backgroundColor: 'rgba(201, 168, 76, 0.18)',
  },
  todayText: {
    color: COLORS.gold2,
    fontSize: 12,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },

  // Sanity-check card (temporary — real content in DAW-29/30)
  sanityCard: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  sanityHeader: {
    fontSize: 11,
    color: COLORS.gold2,
    ...FONTS.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  sanityLine: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.medium,
    marginBottom: 4,
  },
  sanityHighlight: {
    color: COLORS.gold2,
    ...FONTS.bold,
  },
  sanityHint: {
    fontSize: 11,
    color: COLORS.hint,
    ...FONTS.regular,
    marginTop: SPACING.sm,
  },
});

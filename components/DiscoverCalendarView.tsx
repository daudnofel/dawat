// components/DiscoverCalendarView.tsx
// DAW-27 — Initial shell (stub placeholder)
// DAW-28 — Wired real calendar state (useDiscoverCalendar)
// DAW-29 — Drops in MonthGrid with themed dot markers.
// DAW-30 — Mounts DiscoverAgendaPanel beneath the grid for the selected day,
//          with a warm empty state + Create CTA. Wraps contents in ScrollView
//          so agenda cards can extend below the fold.

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import EmptyState from './EmptyState';
import MonthGrid from './MonthGrid';
import DiscoverAgendaPanel from './DiscoverAgendaPanel';
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

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function DiscoverCalendarView({
  eventsByDate,
  loading,
  error,
  refresh,
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
      <View style={styles.errorWrap}>
        <EmptyState
          emoji="⚠️"
          title="Couldn't load calendar"
          subtitle={error}
        />
      </View>
    );
  }

  const monthKey = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, '0')}`;
  const monthEventCount = Array.from(eventsByDate.entries())
    .filter(([k]) => k.startsWith(monthKey))
    .reduce((sum, [, evs]) => sum + evs.length, 0);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || loading}
          onRefresh={onRefresh}
          tintColor={COLORS.gold2}
        />
      }
    >
      {/* Month header — prev/next + month label + event count */}
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

      {/* Month grid (DAW-29) */}
      <MonthGrid
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        eventsByDate={eventsByDate}
        onSelectDate={selectDate}
      />

      {/* Selected-day agenda (DAW-30) */}
      <DiscoverAgendaPanel
        selectedDate={selectedDate}
        eventsByDate={eventsByDate}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 120,
  },
  errorWrap: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },

  // Month header
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
});

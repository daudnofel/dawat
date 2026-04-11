// components/DiscoverCalendarView.tsx
// DAW-27 — Initial shell (stub placeholder)
// DAW-28 — Wired real calendar state (useDiscoverCalendar)
// DAW-29 — Drops in MonthGrid with themed dot markers.
// DAW-30 — Mounts DiscoverAgendaPanel beneath the grid for the selected day,
//          with a warm empty state + Create CTA. Wraps contents in ScrollView
//          so agenda cards can extend below the fold.
// DAW-31 — Respects the DiscoverFilter passed down from the shell: shows a
//          "Filtered by X" pill with a dismiss tap, updates the month subtitle
//          to reflect filtered event counts, and forwards filter context into
//          the agenda panel so empty states stay coherent across modes.
// DAW-32 — QA + polish: calendar-shaped skeleton on first load, retry button
//          on error, and fade-in animation when the month changes.
// DAW-53 — Shell chrome + rhythm pass. Chev buttons go from 36×36 filled-dark
//          circles to 32×32 transparent hairline-gold outlines — lighter, less
//          competitive with the month label. Month subtitle drops to
//          COLORS.hint at 11px. Spacing between month header → pills → grid →
//          agenda trimmed so the calendar breathes as one cohesive surface.

import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import EmptyState from './EmptyState';
import MonthGrid from './MonthGrid';
import DiscoverAgendaPanel from './DiscoverAgendaPanel';
import DiscoverCalendarSkeleton from './DiscoverCalendarSkeleton';
import { DiscoverEvent, DiscoverFilter } from '../lib/hooks/useDiscoverFeed';
import { useDiscoverCalendar } from '../lib/hooks/useDiscoverCalendar';
import { useDiscoverFilterSummary } from '../lib/hooks/useDiscoverFilterSummary';

interface Props {
  eventsByDate: Map<string, DiscoverEvent[]>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  filter: DiscoverFilter;
  onClearFilter: () => void;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function DiscoverCalendarView({
  eventsByDate,
  loading,
  error,
  refresh,
  filter,
  onClearFilter,
}: Props) {
  const {
    currentMonth,
    selectedDate,
    isCurrentMonth,
    goToMonth,
    goToToday,
    selectDate,
  } = useDiscoverCalendar();
  const filterSummary = useDiscoverFilterSummary(filter);
  const [refreshing, setRefreshing] = useState(false);

  // ALL hooks must be above any conditional returns (React Rules of Hooks)
  const monthFade = useSharedValue(1);
  useEffect(() => {
    monthFade.value = 0;
    monthFade.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentMonth, monthFade]);
  const monthFadeStyle = useAnimatedStyle(() => ({
    opacity: monthFade.value,
    transform: [{ translateY: (1 - monthFade.value) * 6 }],
  }));

  const handleClearFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClearFilter();
  };

  // Early returns AFTER all hooks
  if (loading && eventsByDate.size === 0) {
    return <DiscoverCalendarSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.errorWrap}>
        <EmptyState
          emoji="⚠️"
          title="Couldn't load calendar"
          subtitle={error}
        />
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            refresh();
          }}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retry loading calendar"
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const monthKey = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, '0')}`;
  const monthEventCount = Array.from(eventsByDate.entries())
    .filter(([k]) => k.startsWith(monthKey))
    .reduce((sum, [, evs]) => sum + evs.length, 0);

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
            {monthEventCount}{' '}
            {filterSummary.isActive ? 'matching ' : ''}
            {monthEventCount === 1 ? 'event' : 'events'} this month
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

      {/* Pills row — filter summary (if active) + Jump to today (if off-month) */}
      {(filterSummary.isActive || !isCurrentMonth) && (
        <View style={styles.pillsRow}>
          {filterSummary.isActive && (
            <Pressable
              onPress={handleClearFilter}
              style={({ pressed }) => [
                styles.filterPill,
                pressed && { opacity: 0.75 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Clear filter: ${filterSummary.combined}`}
            >
              <Text style={styles.filterPillText}>
                Filtered · {filterSummary.combined}
              </Text>
              <Text style={styles.filterPillX}>  ✕</Text>
            </Pressable>
          )}
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
        </View>
      )}

      {/* Month grid (DAW-29) + agenda panel — fade on month change (DAW-32) */}
      <Animated.View style={monthFadeStyle}>
        <MonthGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          eventsByDate={eventsByDate}
          onSelectDate={selectDate}
        />

        <DiscoverAgendaPanel
          selectedDate={selectedDate}
          eventsByDate={eventsByDate}
          isFiltered={filterSummary.isActive}
          onClearFilter={onClearFilter}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    // DAW-53: trimmed top padding so the month header sits closer to
    // the DiscoverFilterBar above it. Bottom stays at 120 for the tab bar.
    paddingTop: SPACING.md,
    paddingBottom: 120,
  },
  errorWrap: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    alignItems: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold2,
  },
  retryText: {
    fontSize: 14,
    color: COLORS.dark,
    ...FONTS.bold,
    letterSpacing: 0.2,
  },

  // DAW-53 — Month header: tighter rhythm, lighter chev chrome.
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  chev: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // DAW-53: transparent bg, hairline gold-tinted border. Lighter
    // visual weight so the eye lands on the month label, not the
    // navigation affordance.
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.22)',
  },
  chevText: {
    fontSize: 20,
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
    // DAW-53: quieter secondary line — hint color, 11px.
    fontSize: 11,
    color: COLORS.hint,
    ...FONTS.regular,
    marginTop: 2,
    letterSpacing: 0.1,
  },

  // DAW-53 — Pills row rhythm: tighter margin above the grid.
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  todayPill: {
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
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.35)',
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
  },
  filterPillText: {
    color: COLORS.white,
    fontSize: 12,
    ...FONTS.bold,
    letterSpacing: 0.2,
  },
  filterPillX: {
    color: COLORS.gold2,
    fontSize: 13,
    ...FONTS.bold,
  },
});

// components/DiscoverCalendarSkeleton.tsx
// DAW-32 — Skeleton shaped like the calendar view: month header bar,
// weekday row, a 6x7 grid of circle placeholders, and a stub agenda
// card. Same shimmer pattern as DiscoverFeedSkeleton so loading feels
// consistent across modes.

import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../lib/theme';

const CELLS = 42;
const DAY_CIRCLE = 32;

export default function DiscoverCalendarSkeleton() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.25, 0.55]),
  }));

  return (
    <View style={styles.container}>
      {/* Month header bar */}
      <View style={styles.headerRow}>
        <Animated.View style={[styles.chev, shimmerStyle]} />
        <Animated.View style={[styles.monthTitle, shimmerStyle]} />
        <Animated.View style={[styles.chev, shimmerStyle]} />
      </View>

      {/* Weekday row */}
      <View style={styles.weekRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Animated.View key={i} style={[styles.weekTick, shimmerStyle]} />
        ))}
      </View>

      {/* 6x7 day circles */}
      <View style={styles.grid}>
        {Array.from({ length: CELLS }).map((_, i) => (
          <View key={i} style={styles.cell}>
            <Animated.View style={[styles.dayCircle, shimmerStyle]} />
            <Animated.View style={[styles.dotLine, shimmerStyle]} />
          </View>
        ))}
      </View>

      {/* Agenda stub */}
      <View style={styles.agendaHeader}>
        <Animated.View style={[styles.agendaLabel, shimmerStyle]} />
        <Animated.View style={[styles.agendaChip, shimmerStyle]} />
      </View>
      <Animated.View style={[styles.agendaCard, shimmerStyle]} />
      <Animated.View style={[styles.agendaCard, shimmerStyle]} />
    </View>
  );
}

const BAR = COLORS.card2;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  chev: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BAR,
  },
  monthTitle: {
    width: 150,
    height: 24,
    borderRadius: RADIUS.sm,
    backgroundColor: BAR,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekTick: {
    flex: 1,
    height: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: BAR,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  dayCircle: {
    width: DAY_CIRCLE,
    height: DAY_CIRCLE,
    borderRadius: DAY_CIRCLE / 2,
    backgroundColor: BAR,
  },
  dotLine: {
    marginTop: 5,
    width: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: BAR,
  },

  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  agendaLabel: {
    width: 120,
    height: 20,
    borderRadius: RADIUS.sm,
    backgroundColor: BAR,
  },
  agendaChip: {
    width: 70,
    height: 18,
    borderRadius: RADIUS.full,
    backgroundColor: BAR,
  },
  agendaCard: {
    height: 120,
    borderRadius: RADIUS.xl,
    backgroundColor: BAR,
    marginBottom: SPACING.md,
  },
});

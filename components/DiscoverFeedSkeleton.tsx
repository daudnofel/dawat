// components/DiscoverFeedSkeleton.tsx
// DAW-33 — Skeleton placeholder shaped like the live Discover layout:
// a Tonight section header + hero block + 2-col tile pair + a few horizontal
// card placeholders. Replaces the old generic SkeletonCard column so the
// loading state visually matches what's about to render.

import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_PADDING = SPACING.xl;
const COL_GAP = SPACING.md;
const AVAILABLE = SCREEN_WIDTH - SCREEN_PADDING * 2;
const TILE_W = (AVAILABLE - COL_GAP) / 2;
const HERO_H = 280;

export default function DiscoverFeedSkeleton() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.25, 0.55]),
  }));

  return (
    <View style={styles.container}>
      {/* Tonight section header placeholder */}
      <View style={styles.headerWrap}>
        <Animated.View style={[styles.titleBar, shimmerStyle]} />
        <Animated.View style={[styles.subtitleBar, shimmerStyle]} />
      </View>

      {/* Hero placeholder */}
      <Animated.View style={[styles.hero, shimmerStyle]} />

      {/* 2-col tile pair placeholder */}
      <View style={styles.pairRow}>
        <Animated.View style={[styles.tile, shimmerStyle]} />
        <Animated.View style={[styles.tile, shimmerStyle]} />
      </View>

      {/* Horizontal list section header placeholder */}
      <View style={styles.headerWrap}>
        <Animated.View style={[styles.titleBar, shimmerStyle]} />
      </View>

      {/* Horizontal cards */}
      <Animated.View style={[styles.horizontalCard, shimmerStyle]} />
      <Animated.View style={[styles.horizontalCard, shimmerStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: SPACING.lg,
  },
  headerWrap: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: 6,
  },
  titleBar: {
    width: 140,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.card2,
  },
  subtitleBar: {
    width: 90,
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.card2,
  },
  hero: {
    width: AVAILABLE,
    height: HERO_H,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card2,
    marginBottom: SPACING.md,
  },
  pairRow: {
    flexDirection: 'row',
    gap: COL_GAP,
    marginBottom: SPACING.md,
  },
  tile: {
    width: TILE_W,
    height: TILE_W + 90,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card2,
  },
  horizontalCard: {
    width: '100%',
    height: 130,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card2,
    marginBottom: SPACING.md,
  },
});

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

export default function SkeletonCard() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.banner, shimmerStyle]} />
      <View style={styles.body}>
        <Animated.View style={[styles.line, { width: '70%', height: 14 }, shimmerStyle]} />
        <Animated.View style={[styles.line, { width: '40%', height: 11, marginTop: 10 }, shimmerStyle]} />
        <Animated.View style={[styles.line, { width: '55%', height: 11, marginTop: 10 }, shimmerStyle]} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Animated.View style={[styles.pill, shimmerStyle]} />
          <Animated.View style={[styles.pill, { width: 50 }, shimmerStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: SPACING.md, overflow: 'hidden',
  },
  banner: { height: 90, backgroundColor: COLORS.card2 },
  body: { padding: SPACING.md },
  line: { backgroundColor: COLORS.card2, borderRadius: 4 },
  pill: { width: 65, height: 22, borderRadius: 11, backgroundColor: COLORS.card2 },
});

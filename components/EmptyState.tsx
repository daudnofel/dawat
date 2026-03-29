import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../lib/theme';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
}

export default function EmptyState({ emoji, title, subtitle }: EmptyStateProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.emoji, emojiStyle]}>{emoji}</Animated.Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 80 },
  emoji: { fontSize: 52, marginBottom: SPACING.lg },
  title: { fontSize: 18, color: COLORS.white, ...FONTS.semibold, marginBottom: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, textAlign: 'center', paddingHorizontal: SPACING.xxl },
});

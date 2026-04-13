// components/ProgressiveBlurHeader.tsx
// Progressive blur header — content scrolls underneath with increasing
// blur + tint, like Apple Music / Partiful. Drop-in wrapper.
//
// Usage:
//   <ProgressiveBlurHeader
//     scrollY={scrollY}           // Reanimated SharedValue from onScroll
//     headerContent={<Text>Title</Text>}
//     height={100}                // optional, default 100
//     tintColor={pageBg}          // optional, matches page bg
//   />

import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { COLORS, SPACING } from '../lib/theme';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface ProgressiveBlurHeaderProps {
  /** Reanimated SharedValue tracking scroll offset (from onScroll) */
  scrollY: SharedValue<number>;
  /** Content rendered inside the header (title, buttons, etc.) */
  headerContent: React.ReactNode;
  /** Header height in px. Default 100. */
  height?: number;
  /** Tint color that fades in as user scrolls. Defaults to COLORS.dark. */
  tintColor?: string;
  /** Scroll distance over which blur ramps from 0 to max. Default 80. */
  scrollRange?: number;
}

export default function ProgressiveBlurHeader({
  scrollY,
  headerContent,
  height = 100,
  tintColor = COLORS.dark,
  scrollRange = 80,
}: ProgressiveBlurHeaderProps) {
  // Blur intensity: 0 at top → 50 after scrollRange px
  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, scrollRange],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  // Tint overlay: transparent at top → semi-opaque after scroll
  const tintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, scrollRange],
      [0, 0.85],
      Extrapolation.CLAMP,
    ),
  }));

  // Bottom border: invisible at top → visible after scroll
  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, scrollRange * 0.5],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[styles.container, { height }]} pointerEvents="box-none">
      {/* Layer 1: Blur (fades in on scroll) */}
      <AnimatedBlurView
        intensity={50}
        tint="dark"
        style={[StyleSheet.absoluteFill, blurStyle]}
      />

      {/* Layer 2: Tint overlay (matches page bg so blur isn't grey) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tintColor },
          tintStyle,
        ]}
        pointerEvents="none"
      />

      {/* Layer 3: Bottom border */}
      <Animated.View
        style={[
          styles.border,
          borderStyle,
        ]}
        pointerEvents="none"
      />

      {/* Layer 4: Header content (always visible) */}
      <Animated.View style={styles.content} pointerEvents="box-none">
        {headerContent}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  border: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

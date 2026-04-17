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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  /** Header content height in px (excludes safe area inset). Default 52. */
  contentHeight?: number;
  /** Tint color that fades in as user scrolls. Defaults to COLORS.dark. */
  tintColor?: string;
  /** Scroll distance over which blur ramps from 0 to max. Default 80. */
  scrollRange?: number;
}

/**
 * Returns the total header height (safe area top + content) so the parent
 * can set paddingTop on its ScrollView content.
 */
export function useBlurHeaderHeight(contentHeight = 52): number {
  const { top } = useSafeAreaInsets();
  return top + contentHeight;
}

export default function ProgressiveBlurHeader({
  scrollY,
  headerContent,
  contentHeight = 52,
  tintColor = COLORS.dark,
  scrollRange = 80,
}: ProgressiveBlurHeaderProps) {
  const { top: safeTop } = useSafeAreaInsets();
  const totalHeight = safeTop + contentHeight;

  // Blur: invisible at top → fully opaque after scrollRange px
  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, scrollRange],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  // Tint: transparent at top → 85% opaque after scroll
  const tintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, scrollRange],
      [0, 0.85],
      Extrapolation.CLAMP,
    ),
  }));

  // Border: invisible at top → visible halfway through scroll
  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, scrollRange * 0.5],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      style={[styles.container, { height: totalHeight }]}
      pointerEvents="box-none"
    >
      {/* Layer 1: Blur (fades in on scroll) */}
      <AnimatedBlurView
        intensity={60}
        tint="dark"
        style={[StyleSheet.absoluteFill, blurStyle]}
      />

      {/* Layer 2: Tint (matches page bg so blur reads as the right color) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tintColor },
          tintStyle,
        ]}
        pointerEvents="none"
      />

      {/* Layer 3: Bottom border */}
      <Animated.View style={[styles.border, borderStyle]} pointerEvents="none" />

      {/* Layer 4: Header content — pushed below the safe area inset */}
      <Animated.View
        style={[styles.content, { marginTop: safeTop }]}
        pointerEvents="box-none"
      >
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
    justifyContent: 'center',
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

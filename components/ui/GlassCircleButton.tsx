/**
 * GlassCircleButton — a small circular liquid-glass button with an icon.
 *
 * Same visual language as the main-app GlassTabBar / EditorDock:
 *   - `expo-glass-effect` GlassView background
 *   - subtle dark tint overlay for legibility
 *   - white hairline border
 *   - soft drop shadow
 *
 * Used for back, close, and other standard top-bar actions across the
 * app so the chrome reads as a set.
 *
 * Icons are passed as an SVG `path` d-string so we can tune stroke/fill
 * per caller without shipping a bunch of dedicated icon components.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GlassView } from 'expo-glass-effect';
import AnimatedPress from '../AnimatedPress';

export interface GlassCircleButtonProps {
  onPress: () => void;
  /**
   * One of the preset icons, OR `custom` with your own SVG d-string.
   */
  icon: 'back' | 'close' | 'custom';
  /** Required when icon === 'custom' — SVG d attribute. */
  customPath?: string;
  /** Icon stroke color. Defaults to white. */
  iconColor?: string;
  /** Outer diameter. Default 40. */
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const PATHS = {
  // Chevron-left — matches Partiful's back pill
  back: 'M15 6L9 12L15 18',
  // Clean X
  close: 'M18 6L6 18M6 6L18 18',
};

export default function GlassCircleButton({
  onPress,
  icon,
  customPath,
  iconColor = '#FFFFFF',
  size = 40,
  style,
  accessibilityLabel,
}: GlassCircleButtonProps) {
  const pathD =
    icon === 'custom' ? customPath ?? '' : PATHS[icon];
  const label =
    accessibilityLabel ?? (icon === 'back' ? 'Back' : icon === 'close' ? 'Close' : undefined);

  return (
    <AnimatedPress
      style={[styles.shadow, { width: size, height: size, borderRadius: size / 2 }, style]}
      scaleValue={0.92}
      haptic="light"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <GlassView
        style={[
          styles.glass,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        glassEffectStyle="clear"
        colorScheme="dark"
      >
        <View style={styles.tint} pointerEvents="none" />
        <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <Path
            d={pathD}
            stroke={iconColor}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </GlassView>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  glass: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
});

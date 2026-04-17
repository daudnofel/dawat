// components/ui/DButton.tsx
// Dawat button primitive — 4 variants matching the design system.
// Wraps AnimatedPress for haptics + scale animation on every button.

import { Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import AnimatedPress from '../AnimatedPress';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';

export type DButtonVariant = 'gold' | 'glass' | 'outline' | 'pill';

interface DButtonProps {
  title: string;
  variant?: DButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function DButton({
  title,
  variant = 'gold',
  onPress,
  disabled = false,
  style,
}: DButtonProps) {
  if (variant === 'gold') {
    return (
      <AnimatedPress
        style={[styles.base, styles.gold, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled}
        haptic="medium"
      >
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="dBtnGold" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFDFA1" />
              <Stop offset="0.5" stopColor="#E6C27A" />
              <Stop offset="1" stopColor="#FFDFA1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" rx={RADIUS.md} fill="url(#dBtnGold)" />
        </Svg>
        <Text style={[styles.goldText, { zIndex: 1 }]}>{title}</Text>
      </AnimatedPress>
    );
  }

  const variantStyle = {
    glass: styles.glass,
    outline: styles.outline,
    pill: styles.pill,
  }[variant];

  const textStyle = {
    glass: styles.glassText,
    outline: styles.outlineText,
    pill: styles.pillText,
  }[variant];

  return (
    <AnimatedPress
      style={[styles.base, variantStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      haptic="light"
    >
      <Text style={textStyle}>{title}</Text>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    overflow: 'hidden',
  },
  disabled: { opacity: 0.4 },

  // Gold gradient CTA
  gold: {},
  goldText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },

  // Glass — dark translucent with subtle border
  glass: {
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  glassText: { color: COLORS.white, fontSize: 16, ...FONTS.semibold },

  // Outline — transparent with gold border
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  outlineText: { color: COLORS.gold, fontSize: 16, ...FONTS.semibold },

  // Pill — small, rounded, for chips/tags
  pill: {
    height: 36,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillText: { color: COLORS.muted, fontSize: 13, ...FONTS.medium },
});

// components/ui/DCard.tsx
// Dawat card primitive — 3 surface variants.

import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import AnimatedPress from '../AnimatedPress';
import { COLORS, RADIUS, SPACING } from '../../lib/theme';

export type DCardVariant = 'surface' | 'elevated' | 'glass';

interface DCardProps extends ViewProps {
  variant?: DCardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function DCard({
  variant = 'surface',
  onPress,
  style,
  children,
  ...props
}: DCardProps) {
  const variantStyle = {
    surface: styles.surface,
    elevated: styles.elevated,
    glass: styles.glass,
  }[variant];

  if (onPress) {
    return (
      <AnimatedPress style={[styles.base, variantStyle, style]} onPress={onPress}>
        {children}
      </AnimatedPress>
    );
  }

  return (
    <View style={[styles.base, variantStyle, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  surface: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevated: {
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  glass: {
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
});

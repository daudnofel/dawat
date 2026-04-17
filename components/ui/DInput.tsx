// components/ui/DInput.tsx
// Dawat input primitive — consistent styling for all text inputs.

import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';

export type DInputVariant = 'standard' | 'title';

interface DInputProps extends TextInputProps {
  variant?: DInputVariant;
}

export default function DInput({
  variant = 'standard',
  style,
  ...props
}: DInputProps) {
  return (
    <TextInput
      style={[styles.base, variant === 'title' && styles.title, style]}
      placeholderTextColor={COLORS.hint}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.medium,
  },
  title: {
    fontSize: 22,
    ...FONTS.bold,
    paddingVertical: SPACING.lg,
  },
});

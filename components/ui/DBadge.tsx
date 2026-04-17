// components/ui/DBadge.tsx
// Dawat badge primitive — color-tinted pill.
// Replaces the old GenderBadge + HalalBadge pattern.

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';

interface DBadgeProps {
  label: string;
  color?: string;
  emoji?: string;
}

export default function DBadge({
  label,
  color = COLORS.gold,
  emoji,
}: DBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 4,
  },
  emoji: { fontSize: 12 },
  label: {
    fontSize: 12,
    ...FONTS.semibold,
  },
});

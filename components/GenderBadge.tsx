import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { GenderMode } from '../types';

const CONFIG = {
  [GenderMode.Mixed]: { label: 'Mixed', color: COLORS.gold, emoji: '🌟' },
  [GenderMode.SistersOnly]: { label: 'Sisters', color: COLORS.purple, emoji: '🌸' },
  [GenderMode.BrothersOnly]: { label: 'Brothers', color: COLORS.blue, emoji: '💪' },
  [GenderMode.Family]: { label: 'Family', color: COLORS.teal, emoji: '👨‍👩‍👧' },
};

export default function GenderBadge({ mode }: { mode: GenderMode }) {
  const { label, color, emoji } = CONFIG[mode];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm + 2, paddingVertical: 3,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  emoji: { fontSize: 10 },
  text: { fontSize: 11, ...FONTS.semibold },
});

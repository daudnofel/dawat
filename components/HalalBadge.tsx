import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

export default function HalalBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>✅ Halal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: `${COLORS.green}20`, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 2, paddingVertical: 3,
    borderWidth: 1, borderColor: `${COLORS.green}40`,
  },
  text: { fontSize: 11, color: COLORS.green, ...FONTS.semibold },
});

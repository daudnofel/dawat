import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

interface PrayerTimeWarningProps {
  message: string;
}

export default function PrayerTimeWarning({ message }: PrayerTimeWarningProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1F0A',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#4A3510',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    flex: 1,
    color: COLORS.amber,
    fontSize: 13,
    ...FONTS.regular,
    lineHeight: 18,
  },
});

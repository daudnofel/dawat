import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../lib/theme';

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.banner} />
      <View style={styles.body}>
        <View style={[styles.line, { width: '70%', height: 14 }]} />
        <View style={[styles.line, { width: '40%', height: 11, marginTop: 8 }]} />
        <View style={[styles.line, { width: '55%', height: 11, marginTop: 8 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: SPACING.md, overflow: 'hidden',
  },
  banner: { height: 90, backgroundColor: COLORS.card2 },
  body: { padding: SPACING.md },
  line: { backgroundColor: COLORS.card2, borderRadius: 4 },
});

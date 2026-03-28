import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../lib/theme';

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📅</Text>
        <Text style={styles.emptyTitle}>No events yet</Text>
        <Text style={styles.emptySubtitle}>Events you're attending or hosting will appear here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 18, color: COLORS.white, ...FONTS.semibold, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular },
});

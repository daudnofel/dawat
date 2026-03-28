import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../lib/theme';

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Event</Text>
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>✨</Text>
        <Text style={styles.emptyTitle}>Create your first event</Text>
        <Text style={styles.emptySubtitle}>The 4-step creation flow is coming in Sprint 2</Text>
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

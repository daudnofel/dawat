import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';
import ThemePicker from '../../components/ThemePicker';

export default function Step1Theme() {
  const { draft, updateDraft, nextStep, reset } = useEventStore();

  const canContinue = draft.theme_id !== '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 50 }} />
        <Text style={styles.stepLabel}>Step 1 of 4</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.dot, s === 1 && styles.dotActive]} />
        ))}
      </View>

      <Text style={styles.title}>Choose a theme</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemePicker
          selectedId={draft.theme_id}
          onSelect={(theme) => updateDraft({ theme_id: theme.id })}
        />
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.button, !canContinue && styles.buttonDisabled,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          onPress={() => nextStep()}
          disabled={!canContinue}
        >
          <Text style={styles.buttonText}>Use This Theme</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  stepLabel: { color: COLORS.muted, fontSize: 13, ...FONTS.medium },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.gold, width: 24 },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold, paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  scroll: { flex: 1 },
  bottomBar: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  button: { backgroundColor: COLORS.gold, borderRadius: RADIUS.md, paddingVertical: SPACING.lg, alignItems: 'center', height: 52, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
});

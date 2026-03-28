import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';

export default function Step2Basics() {
  const { draft, updateDraft } = useEventStore();
  const router = useRouter();

  const canContinue = draft.title.trim().length >= 2 && draft.host_name.trim().length >= 2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.stepLabel}>Step 2 of 4</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.dot, s <= 2 && styles.dotActive, s === 2 && styles.dotCurrent]} />
        ))}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Name your event</Text>
          <TextInput
            style={styles.titleInput}
            value={draft.title}
            onChangeText={(t) => updateDraft({ title: t })}
            placeholder="Eid Gala, Sisters Halaqa, Nikah Walima..."
            placeholderTextColor={COLORS.hint}
            maxLength={60}
            autoFocus
          />
          <Text style={styles.charCount}>{draft.title.length}/60</Text>

          <Text style={styles.label}>Hosting as</Text>
          <TextInput
            style={styles.input}
            value={draft.host_name}
            onChangeText={(t) => updateDraft({ host_name: t })}
            placeholder="Islamic Center of Dallas, or your name"
            placeholderTextColor={COLORS.hint}
            maxLength={60}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={draft.description}
            onChangeText={(t) => updateDraft({ description: t })}
            placeholder="What's happening? Include any important details..."
            placeholderTextColor={COLORS.hint}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{draft.description.length}/500</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !canContinue && styles.buttonDisabled,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          onPress={() => router.push('/create/step3-details')}
          disabled={!canContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
  progressRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.gold },
  dotCurrent: { width: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 40 },
  label: {
    fontSize: 16, color: COLORS.white, ...FONTS.semibold,
    marginBottom: SPACING.sm, marginTop: SPACING.xl,
  },
  titleInput: {
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    color: COLORS.white, fontSize: 20, ...FONTS.semibold,
  },
  input: {
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 2,
    color: COLORS.white, fontSize: 16, ...FONTS.medium,
  },
  textArea: { minHeight: 100, paddingTop: SPACING.md },
  charCount: {
    color: COLORS.hint, fontSize: 12, ...FONTS.regular, textAlign: 'right', marginTop: SPACING.xs,
  },
  bottomBar: {
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, alignItems: 'center', height: 52, justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
});

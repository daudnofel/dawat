import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';

export default function Step2Basics() {
  const { draft, updateDraft, nextStep } = useEventStore();
  const canContinue = draft.title.trim().length >= 2 && draft.host_name.trim().length >= 2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 50 }} />
        <Text style={styles.stepLabel}>Step 1 of 6</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={styles.progressRow}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View key={s} style={[styles.dot, s <= 1 && styles.dotActive, s === 1 && styles.dotCurrent]} />
        ))}
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Name your event</Text>
          <TextInput style={styles.titleInput} value={draft.title} onChangeText={(t) => updateDraft({ title: t })} placeholder="Eid Gala, Sisters Halaqa..." placeholderTextColor={COLORS.hint} maxLength={60} />
          <Text style={styles.charCount}>{draft.title.length}/60</Text>
          <Text style={styles.label}>Hosting as</Text>
          <TextInput style={styles.input} value={draft.host_name} onChangeText={(t) => updateDraft({ host_name: t })} placeholder="Your name or organisation" placeholderTextColor={COLORS.hint} maxLength={60} />
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, { minHeight: 100, paddingTop: SPACING.md }]} value={draft.description} onChangeText={(t) => updateDraft({ description: t })} placeholder="What's happening?" placeholderTextColor={COLORS.hint} multiline maxLength={500} textAlignVertical="top" />
          <Text style={styles.charCount}>{draft.description.length}/500</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomBar}>
        <Pressable style={({ pressed }) => [styles.button, !canContinue && styles.buttonDisabled, pressed && { transform: [{ scale: 0.97 }] }]} onPress={() => nextStep()} disabled={!canContinue}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="ctaGrad2" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFDFA1" />
                <Stop offset="0.5" stopColor="#E6C27A" />
                <Stop offset="1" stopColor="#FFDFA1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" rx={RADIUS.md} fill="url(#ctaGrad2)" />
          </Svg>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  stepLabel: { color: COLORS.muted, fontSize: 13, ...FONTS.medium },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.gold },
  dotCurrent: { width: 24 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 40 },
  label: { fontSize: 16, color: COLORS.white, ...FONTS.semibold, marginBottom: SPACING.sm, marginTop: SPACING.xl },
  titleInput: { backgroundColor: COLORS.input, borderRadius: RADIUS.md, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255, 223, 161, 0.10)', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 2, color: COLORS.white, fontSize: 16, ...FONTS.medium },
  input: { backgroundColor: COLORS.input, borderRadius: RADIUS.md, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255, 223, 161, 0.10)', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 2, color: COLORS.white, fontSize: 16, ...FONTS.medium },
  charCount: { color: COLORS.hint, fontSize: 12, ...FONTS.regular, textAlign: 'right', marginTop: SPACING.xs },
  bottomBar: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255, 223, 161, 0.10)', marginBottom: 90 },
  button: { borderRadius: RADIUS.md, alignItems: 'center', height: 52, justifyContent: 'center', overflow: 'hidden' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
});

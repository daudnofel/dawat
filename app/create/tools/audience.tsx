/**
 * Audience tool sheet (DAW-54).
 *
 * Gender mode (2×2 grid), plus-ones toggle + spinner, and ID verification
 * switch. Controls are ported from the legacy `step4-settings.tsx` with
 * the publish logic stripped out — publish lives in DAW-55's publish
 * sheet, not here. Sisters/Brothers-only modes show a contextual hint
 * recommending ID verification.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import ToolSheet from '../../../components/ToolSheet';
import { useEventStore } from '../../../store/useEventStore';
import { GenderMode } from '../../../types';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../lib/theme';

interface GenderOption {
  label: string;
  subtitle: string;
  emoji: string;
  value: GenderMode;
}

const GENDER_OPTIONS: GenderOption[] = [
  {
    label: 'Mixed',
    subtitle: 'Open to all',
    emoji: '🌟',
    value: GenderMode.Mixed,
  },
  {
    label: 'Sisters Only',
    subtitle: 'Women only',
    emoji: '🌸',
    value: GenderMode.SistersOnly,
  },
  {
    label: 'Brothers',
    subtitle: 'Men only',
    emoji: '💪',
    value: GenderMode.BrothersOnly,
  },
  {
    label: 'Family',
    subtitle: 'Parents + kids',
    emoji: '👨\u200d👩\u200d👧',
    value: GenderMode.Family,
  },
];

export default function AudienceToolScreen() {
  const router = useRouter();
  const { draft, updateDraft, closeTool } = useEventStore();

  const handleClose = () => {
    closeTool();
    router.back();
  };

  const handleSelectMode = (mode: GenderMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateDraft({ gender_mode: mode });
  };

  const togglePlusOnes = (value: boolean) => {
    Haptics.selectionAsync();
    updateDraft({
      allow_plus_ones: value,
      max_plus_ones: value ? 1 : 0,
    });
  };

  const bumpPlusOnes = (delta: number) => {
    Haptics.selectionAsync();
    const next = Math.min(10, Math.max(1, draft.max_plus_ones + delta));
    updateDraft({ max_plus_ones: next });
  };

  const toggleId = (value: boolean) => {
    Haptics.selectionAsync();
    updateDraft({ is_id_required: value });
  };

  const needsIdNote =
    draft.gender_mode === GenderMode.SistersOnly ||
    draft.gender_mode === GenderMode.BrothersOnly;

  return (
    <ToolSheet title="Audience" onClose={handleClose}>
      <Text style={styles.sectionLabel}>Who's this gathering for?</Text>

      <View style={styles.genderGrid}>
        {GENDER_OPTIONS.map((opt) => {
          const selected = draft.gender_mode === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handleSelectMode(opt.value)}
              style={({ pressed }) => [
                styles.genderCard,
                selected && styles.genderCardSelected,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${opt.label} — ${opt.subtitle}`}
              accessibilityState={{ selected }}
            >
              <Text style={styles.genderEmoji}>{opt.emoji}</Text>
              <Text
                style={[
                  styles.genderLabel,
                  selected && styles.genderLabelSelected,
                ]}
              >
                {opt.label}
              </Text>
              <Text style={styles.genderSubtitle}>{opt.subtitle}</Text>
              {selected && (
                <View style={styles.check}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {needsIdNote && (
        <Text style={styles.idNote}>
          ID verification recommended for gender-only events
        </Text>
      )}

      {/* ── Plus ones ── */}
      <View style={styles.sectionDivider} />

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleLabel}>Allow plus-ones?</Text>
          <Text style={styles.toggleHint}>
            Guests can bring additional people
          </Text>
        </View>
        <Switch
          value={draft.allow_plus_ones}
          onValueChange={togglePlusOnes}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>

      {draft.allow_plus_ones && (
        <View style={styles.spinnerRow}>
          <Text style={styles.spinnerLabel}>Max plus-ones per guest</Text>
          <View style={styles.spinnerControls}>
            <Pressable
              onPress={() => bumpPlusOnes(-1)}
              disabled={draft.max_plus_ones <= 1}
              style={[
                styles.spinnerBtn,
                draft.max_plus_ones <= 1 && styles.spinnerBtnDisabled,
              ]}
            >
              <Text style={styles.spinnerBtnText}>−</Text>
            </Pressable>
            <Text style={styles.spinnerCount}>{draft.max_plus_ones}</Text>
            <Pressable
              onPress={() => bumpPlusOnes(1)}
              disabled={draft.max_plus_ones >= 10}
              style={[
                styles.spinnerBtn,
                draft.max_plus_ones >= 10 && styles.spinnerBtnDisabled,
              ]}
            >
              <Text style={styles.spinnerBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── ID verification ── */}
      <View style={styles.sectionDivider} />

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleLabel}>Require ID verification?</Text>
          <Text style={styles.toggleHint}>
            Guests must verify government ID via Stripe Identity
          </Text>
        </View>
        <Switch
          value={draft.is_id_required}
          onValueChange={toggleId}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>
    </ToolSheet>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semibold,
    marginBottom: SPACING.lg,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  genderCard: {
    width: '47%',
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,223,161,0.08)',
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  genderCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201,168,76,0.14)',
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  genderEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  genderLabel: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  genderLabelSelected: { color: COLORS.gold },
  genderSubtitle: { fontSize: 12, color: COLORS.muted, ...FONTS.regular },
  check: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: COLORS.dark, fontSize: 12, ...FONTS.bold },
  idNote: {
    color: COLORS.amber,
    fontSize: 13,
    ...FONTS.regular,
    marginTop: SPACING.lg,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,223,161,0.10)',
    marginTop: SPACING.xl,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  toggleTextWrap: { flex: 1 },
  toggleLabel: { color: COLORS.white, fontSize: 15, ...FONTS.medium },
  toggleHint: {
    color: COLORS.hint,
    fontSize: 12,
    ...FONTS.regular,
    marginTop: SPACING.xs,
  },
  spinnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  spinnerLabel: { color: COLORS.white, fontSize: 14, ...FONTS.medium },
  spinnerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  spinnerBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,223,161,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerBtnDisabled: { opacity: 0.3 },
  spinnerBtnText: { fontSize: 18, color: COLORS.gold, ...FONTS.bold },
  spinnerCount: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    minWidth: 24,
    textAlign: 'center',
  },
});

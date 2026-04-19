/**
 * Audience tool sheet (DAW-54).
 *
 * Gender mode (2×2 grid), plus-ones toggle + spinner, and ID verification
 * switch. Controls are ported from the legacy `step4-settings.tsx` with
 * the publish logic stripped out — publish lives in DAW-55's publish
 * sheet, not here. Sisters/Brothers-only modes show a contextual hint
 * recommending ID verification.
 *
 * DAW-61 — migrated to Dawat primitives (DText).
 */

import React from 'react';
import { View, Pressable, StyleSheet, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';

import ToolSheet from '../../../components/ToolSheet';
import { useEventStore } from '../../../store/useEventStore';
import { GenderMode } from '../../../types';
import { DText } from '../../../components/ui';
import {
  AUDIENCE_ICON,
  AudienceIconProps,
} from '../../../components/AudienceIcons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../lib/theme';

interface Props {
  onClose?: () => void;
}

interface GenderOption {
  label: string;
  subtitle: string;
  Icon: React.ComponentType<AudienceIconProps>;
  value: GenderMode;
}

const GENDER_OPTIONS: GenderOption[] = [
  { label: 'Mixed', subtitle: 'Open to all', Icon: AUDIENCE_ICON[GenderMode.Mixed], value: GenderMode.Mixed },
  { label: 'Sisters Only', subtitle: 'Women only', Icon: AUDIENCE_ICON[GenderMode.SistersOnly], value: GenderMode.SistersOnly },
  { label: 'Brothers', subtitle: 'Men only', Icon: AUDIENCE_ICON[GenderMode.BrothersOnly], value: GenderMode.BrothersOnly },
  { label: 'Family', subtitle: 'Parents + kids', Icon: AUDIENCE_ICON[GenderMode.Family], value: GenderMode.Family },
];

export default function AudienceToolScreen({ onClose }: Props = {}) {
  const { draft, updateDraft, closeTool } = useEventStore();

  const handleClose = () => {
    closeTool();
    onClose?.();
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
      <DText variant="label" style={{ marginBottom: SPACING.lg }}>
        Who's this gathering for?
      </DText>

      <View style={styles.genderGrid}>
        {GENDER_OPTIONS.map((opt) => {
          const selected = draft.gender_mode === opt.value;
          const Icon = opt.Icon;
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
              <View style={styles.iconWrap}>
                <Icon active={selected} />
              </View>
              <DText
                color={selected ? COLORS.gold : COLORS.white}
                style={styles.genderLabel}
              >
                {opt.label}
              </DText>
              <DText variant="hint" color={COLORS.muted}>{opt.subtitle}</DText>
              {selected && (
                <View style={styles.check}>
                  <DText color={COLORS.dark} style={styles.checkMark}>✓</DText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {needsIdNote && (
        <DText
          variant="meta"
          color={COLORS.amber}
          style={{ marginTop: SPACING.lg }}
        >
          ID verification recommended for gender-only events
        </DText>
      )}

      {/* ── Plus ones ── */}
      <View style={styles.sectionDivider} />

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <DText variant="meta" color={COLORS.white} style={{ fontSize: 15 }}>
            Allow plus-ones?
          </DText>
          <DText variant="hint" style={{ marginTop: SPACING.xs }}>
            Guests can bring additional people
          </DText>
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
          <DText variant="meta" color={COLORS.white}>Max plus-ones per guest</DText>
          <View style={styles.spinnerControls}>
            <Pressable
              onPress={() => bumpPlusOnes(-1)}
              disabled={draft.max_plus_ones <= 1}
              style={[
                styles.spinnerBtn,
                draft.max_plus_ones <= 1 && styles.spinnerBtnDisabled,
              ]}
            >
              <DText color={COLORS.gold} style={styles.spinnerBtnText}>−</DText>
            </Pressable>
            <DText style={styles.spinnerCount}>{draft.max_plus_ones}</DText>
            <Pressable
              onPress={() => bumpPlusOnes(1)}
              disabled={draft.max_plus_ones >= 10}
              style={[
                styles.spinnerBtn,
                draft.max_plus_ones >= 10 && styles.spinnerBtnDisabled,
              ]}
            >
              <DText color={COLORS.gold} style={styles.spinnerBtnText}>+</DText>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── ID verification ── */}
      <View style={styles.sectionDivider} />

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <DText variant="meta" color={COLORS.white} style={{ fontSize: 15 }}>
            Require ID verification?
          </DText>
          <DText variant="hint" style={{ marginTop: SPACING.xs }}>
            Guests must verify government ID via Stripe Identity
          </DText>
        </View>
        <Switch
          value={draft.is_id_required}
          onValueChange={toggleId}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>

      {/* ── Host approval mode (DAW-6) ── */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <DText variant="meta" color={COLORS.white} style={{ fontSize: 15 }}>
            Require host approval?
          </DText>
          <DText variant="hint" style={{ marginTop: SPACING.xs }}>
            You approve each RSVP before it's confirmed. Like a doorlist.
          </DText>
        </View>
        <Switch
          value={draft.requires_approval}
          onValueChange={(v) => {
            Haptics.selectionAsync();
            updateDraft({ requires_approval: v });
          }}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>

      {/* ── Guest list privacy (DAW-6) ── */}
      <View style={styles.sectionDivider} />

      <DText variant="kicker" color={COLORS.muted} style={{ marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
        GUEST LIST PRIVACY
      </DText>

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <DText variant="meta" color={COLORS.white} style={{ fontSize: 15 }}>
            Hide guest list
          </DText>
          <DText variant="hint" style={{ marginTop: SPACING.xs }}>
            Only you see who's going
          </DText>
        </View>
        <Switch
          value={draft.hide_guest_list}
          onValueChange={(v) => {
            Haptics.selectionAsync();
            updateDraft({ hide_guest_list: v });
          }}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <DText variant="meta" color={COLORS.white} style={{ fontSize: 15 }}>
            Hide headcount
          </DText>
          <DText variant="hint" style={{ marginTop: SPACING.xs }}>
            Don't show the "X going" count to guests
          </DText>
        </View>
        <Switch
          value={draft.hide_headcount}
          onValueChange={(v) => {
            Haptics.selectionAsync();
            updateDraft({ hide_headcount: v });
          }}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <DText variant="meta" color={COLORS.white} style={{ fontSize: 15 }}>
            Anonymize names
          </DText>
          <DText variant="hint" style={{ marginTop: SPACING.xs }}>
            Show first names + last initial to other guests
          </DText>
        </View>
        <Switch
          value={draft.anonymize_guests}
          onValueChange={(v) => {
            Haptics.selectionAsync();
            updateDraft({ anonymize_guests: v });
          }}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>
    </ToolSheet>
  );
}

const styles = StyleSheet.create({
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
  iconWrap: {
    height: 32,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderLabel: {
    fontSize: 15,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
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
  checkMark: { fontSize: 12, ...FONTS.bold },
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
  spinnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
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
  spinnerBtnText: { fontSize: 18, ...FONTS.bold },
  spinnerCount: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    minWidth: 24,
    textAlign: 'center',
  },
});

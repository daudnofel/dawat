/**
 * Essentials — the first and only form step of the new preview-led
 * creation flow (DAW-37). Captures the absolute minimum needed to land in
 * the editor:
 *
 *   - Event title
 *   - Date & time (or "Date TBD")
 *   - Host name
 *   - Audience (gender mode)
 *
 * Everything else — poster, theme, effect, location, price, description,
 * settings — happens *inside* the editor via tool sheets (DAW-54). That's
 * the whole point: name it, then design it.
 *
 * Presented as a bottom-sheet modal (see app/create/_layout.tsx) so it
 * floats over the tab layer. On submit we replace the route with
 * /create/editor so the back gesture never returns here — users should
 * re-open the editor to tweak essentials, not this sheet.
 *
 * DAW-61 — migrated to Dawat primitives (DText, DInput, DButton).
 */

import { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { DText, DInput, DButton } from '../../components/ui';
import { useEventStore } from '../../store/useEventStore';
import { GenderMode } from '../../types';

interface AudienceOption {
  value: GenderMode;
  label: string;
  emoji: string;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  { value: GenderMode.Mixed, label: 'Mixed', emoji: '🌟' },
  { value: GenderMode.SistersOnly, label: 'Sisters', emoji: '🌸' },
  { value: GenderMode.BrothersOnly, label: 'Brothers', emoji: '💪' },
  { value: GenderMode.Family, label: 'Family', emoji: '👨\u200d👩\u200d👧' },
];

export default function EssentialsScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useEventStore();
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(draft.date_time ?? new Date());

  const titleOk = draft.title.trim().length >= 2;
  const hostOk = draft.host_name.trim().length >= 2;
  const dateOk = draft.date_tbd || !!draft.date_time;
  const canContinue = titleOk && hostOk && dateOk;

  const openPicker = (mode: 'date' | 'time') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempDate(draft.date_time ?? new Date());
    setPickerMode(mode);
  };

  const confirmPicker = () => {
    updateDraft({ date_time: tempDate, date_tbd: false });
    setPickerMode(null);
  };

  const toggleTbd = (value: boolean) => {
    Haptics.selectionAsync();
    if (value) {
      updateDraft({ date_tbd: true, date_time: null });
    } else {
      updateDraft({ date_tbd: false });
    }
  };

  const selectAudience = (mode: GenderMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateDraft({ gender_mode: mode });
  };

  const handleContinue = () => {
    if (!canContinue) return;
    router.replace('/create/editor');
  };

  const dateLabel = draft.date_tbd
    ? 'Date TBD'
    : draft.date_time
      ? format(draft.date_time, 'EEE, MMM d')
      : 'Pick a date';

  const timeLabel = draft.date_tbd
    ? '—'
    : draft.date_time
      ? format(draft.date_time, 'h:mm a')
      : 'Pick a time';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <DText variant="label" color={COLORS.gold} style={FONTS.medium}>
            Cancel
          </DText>
        </Pressable>
        <DText variant="kicker" color={COLORS.muted}>NEW EVENT</DText>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DText variant="headline" style={{ marginTop: SPACING.md }}>
            Name the gathering
          </DText>
          <DText variant="meta" style={{ marginTop: SPACING.xs, lineHeight: 20 }}>
            A few essentials and we'll drop you into the editor.
          </DText>

          {/* ── Title ── */}
          <DText variant="kicker" color={COLORS.muted} style={styles.fieldLabel}>
            EVENT TITLE
          </DText>
          <DInput
            variant="title"
            value={draft.title}
            onChangeText={(t) => updateDraft({ title: t })}
            placeholder="Eid Gala, Sisters Halaqa…"
            maxLength={60}
          />

          {/* ── Date & time ── */}
          <DText variant="kicker" color={COLORS.muted} style={styles.fieldLabel}>
            DATE & TIME
          </DText>
          <View style={styles.dateRow}>
            <Pressable
              onPress={() => openPicker('date')}
              disabled={draft.date_tbd}
              style={({ pressed }) => [
                styles.dateButton,
                draft.date_tbd && styles.dateButtonDisabled,
                pressed && !draft.date_tbd && styles.pressed,
              ]}
            >
              <DText variant="kicker" color={COLORS.muted}>DATE</DText>
              <DText variant="label" style={styles.dateButtonValue} numberOfLines={1}>
                {dateLabel}
              </DText>
            </Pressable>

            <Pressable
              onPress={() => openPicker('time')}
              disabled={draft.date_tbd}
              style={({ pressed }) => [
                styles.dateButton,
                draft.date_tbd && styles.dateButtonDisabled,
                pressed && !draft.date_tbd && styles.pressed,
              ]}
            >
              <DText variant="kicker" color={COLORS.muted}>TIME</DText>
              <DText variant="label" style={styles.dateButtonValue} numberOfLines={1}>
                {timeLabel}
              </DText>
            </Pressable>
          </View>

          <View style={styles.tbdRow}>
            <DText variant="meta" color={COLORS.muted}>Date not set yet</DText>
            <Switch
              value={draft.date_tbd}
              onValueChange={toggleTbd}
              trackColor={{ false: COLORS.border, true: COLORS.gold }}
              thumbColor={COLORS.white}
            />
          </View>

          {/* ── Host ── */}
          <DText variant="kicker" color={COLORS.muted} style={styles.fieldLabel}>
            HOSTING AS
          </DText>
          <DInput
            value={draft.host_name}
            onChangeText={(t) => updateDraft({ host_name: t })}
            placeholder="Your name or community"
            maxLength={60}
          />

          {/* ── Audience ── */}
          <DText variant="kicker" color={COLORS.muted} style={styles.fieldLabel}>
            AUDIENCE
          </DText>
          <View style={styles.audienceGrid}>
            {AUDIENCE_OPTIONS.map((opt) => {
              const selected = draft.gender_mode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => selectAudience(opt.value)}
                  style={({ pressed }) => [
                    styles.audiencePill,
                    selected && styles.audiencePillSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <DText style={styles.audienceEmoji}>{opt.emoji}</DText>
                  <DText
                    variant="meta"
                    color={selected ? COLORS.white : COLORS.muted}
                  >
                    {opt.label}
                  </DText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── CTA ── */}
      <View style={styles.bottomBar}>
        <DButton
          title="Start designing"
          variant="gold"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>

      {/* ── Date/time picker modal ── */}
      <Modal
        visible={pickerMode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerMode(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setPickerMode(null)}>
                <DText variant="label" color={COLORS.muted}>Cancel</DText>
              </Pressable>
              <DText variant="label">
                {pickerMode === 'date' ? 'Pick a date' : 'Pick a time'}
              </DText>
              <Pressable onPress={confirmPicker}>
                <DText variant="label" color={COLORS.gold}>Done</DText>
              </Pressable>
            </View>
            {pickerMode && (
              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                display="spinner"
                textColor={COLORS.white}
                themeVariant="dark"
                onChange={(_, d) => d && setTempDate(d)}
                minimumDate={pickerMode === 'date' ? new Date() : undefined}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  fieldLabel: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dateButton: {
    flex: 1,
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,223,161,0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: 4,
  },
  dateButtonDisabled: { opacity: 0.4 },
  dateButtonValue: { fontSize: 16 },
  tbdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  audiencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,223,161,0.12)',
  },
  audiencePillSelected: {
    backgroundColor: 'rgba(201,168,76,0.14)',
    borderColor: COLORS.gold,
  },
  audienceEmoji: { fontSize: 18 },
  bottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,223,161,0.10)',
  },
  pressed: { opacity: 0.85 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
});

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
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.kicker}>NEW EVENT</Text>
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
          <Text style={styles.headline}>Name the gathering</Text>
          <Text style={styles.subhead}>
            A few essentials and we'll drop you into the editor.
          </Text>

          {/* ── Title ── */}
          <Text style={styles.label}>Event title</Text>
          <TextInput
            style={styles.titleInput}
            value={draft.title}
            onChangeText={(t) => updateDraft({ title: t })}
            placeholder="Eid Gala, Sisters Halaqa…"
            placeholderTextColor={COLORS.hint}
            maxLength={60}
            autoFocus
          />

          {/* ── Date & time ── */}
          <Text style={styles.label}>Date & time</Text>
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
              <Text style={styles.dateButtonLabel}>Date</Text>
              <Text style={styles.dateButtonValue} numberOfLines={1}>
                {dateLabel}
              </Text>
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
              <Text style={styles.dateButtonLabel}>Time</Text>
              <Text style={styles.dateButtonValue} numberOfLines={1}>
                {timeLabel}
              </Text>
            </Pressable>
          </View>

          <View style={styles.tbdRow}>
            <Text style={styles.tbdLabel}>Date not set yet</Text>
            <Switch
              value={draft.date_tbd}
              onValueChange={toggleTbd}
              trackColor={{ false: COLORS.border, true: COLORS.gold }}
              thumbColor={COLORS.white}
            />
          </View>

          {/* ── Host ── */}
          <Text style={styles.label}>Hosting as</Text>
          <TextInput
            style={styles.input}
            value={draft.host_name}
            onChangeText={(t) => updateDraft({ host_name: t })}
            placeholder="Your name or community"
            placeholderTextColor={COLORS.hint}
            maxLength={60}
          />

          {/* ── Audience ── */}
          <Text style={styles.label}>Audience</Text>
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
                  <Text style={styles.audienceEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      styles.audienceLabel,
                      selected && styles.audienceLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── CTA ── */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          style={({ pressed }) => [
            styles.cta,
            !canContinue && styles.ctaDisabled,
            pressed && canContinue && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="essentialsCta" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFDFA1" />
                <Stop offset="0.5" stopColor="#E6C27A" />
                <Stop offset="1" stopColor="#FFDFA1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" rx={RADIUS.md} fill="url(#essentialsCta)" />
          </Svg>
          <Text style={styles.ctaLabel}>Start designing</Text>
        </Pressable>
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
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>
                {pickerMode === 'date' ? 'Pick a date' : 'Pick a time'}
              </Text>
              <Pressable onPress={confirmPicker}>
                <Text style={styles.modalDone}>Done</Text>
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
  cancelText: { color: COLORS.gold, fontSize: 15, ...FONTS.medium },
  kicker: {
    color: COLORS.muted,
    fontSize: 11,
    ...FONTS.bold,
    letterSpacing: 1.5,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  headline: {
    fontSize: 28,
    ...FONTS.bold,
    color: COLORS.white,
    letterSpacing: -0.4,
    marginTop: SPACING.md,
  },
  subhead: {
    fontSize: 15,
    ...FONTS.regular,
    color: COLORS.muted,
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
  },
  titleInput: {
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,223,161,0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.bold,
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,223,161,0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.medium,
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
  },
  dateButtonDisabled: { opacity: 0.4 },
  dateButtonLabel: {
    fontSize: 11,
    ...FONTS.medium,
    color: COLORS.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateButtonValue: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.white,
  },
  tbdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  tbdLabel: {
    fontSize: 14,
    ...FONTS.medium,
    color: COLORS.muted,
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
  audienceLabel: {
    fontSize: 14,
    ...FONTS.medium,
    color: COLORS.muted,
  },
  audienceLabelSelected: {
    color: COLORS.white,
  },
  bottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,223,161,0.10)',
  },
  cta: {
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaLabel: {
    color: COLORS.dark,
    fontSize: 16,
    ...FONTS.bold,
    letterSpacing: 0.3,
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
  modalCancel: { color: COLORS.muted, fontSize: 15, ...FONTS.medium },
  modalTitle: { color: COLORS.white, fontSize: 15, ...FONTS.bold },
  modalDone: { color: COLORS.gold, fontSize: 15, ...FONTS.bold },
});

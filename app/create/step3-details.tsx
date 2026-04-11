import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Switch, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';
import { Toast } from '../../components/Toast';

const PRICE_OPTIONS = [
  { label: 'Free', value: 0 },
  { label: '$10', value: 1000 },
  { label: '$25', value: 2500 },
  { label: '$45', value: 4500 },
  { label: '$100', value: 10000 },
];

export default function Step3Details() {
  const { draft, updateDraft, nextStep, prevStep } = useEventStore();
  const [customPrice, setCustomPrice] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | 'deadline' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const canContinue = draft.location_name.trim().length >= 2 || draft.date_tbd;
  const selectedDate = draft.date_time ?? new Date();

  const openPicker = (mode: 'date' | 'time') => {
    setTempDate(draft.date_time ?? new Date());
    setPickerMode(mode);
  };

  const confirmPicker = () => {
    if (pickerMode === 'deadline') {
      // RSVP deadline must be at least 1 hour before event
      if (draft.date_time) {
        const oneHourBefore = new Date(draft.date_time.getTime() - 60 * 60 * 1000);
        if (tempDate >= oneHourBefore) {
          Toast.error('RSVP deadline must be at least 1 hour before the event starts.');
          return;
        }
      }
      updateDraft({ rsvp_deadline: tempDate });
    } else {
      // If event date moved earlier and existing RSVP deadline is now invalid, auto-adjust
      if (draft.rsvp_deadline) {
        const oneHourBefore = new Date(tempDate.getTime() - 60 * 60 * 1000);
        if (draft.rsvp_deadline >= oneHourBefore) {
          updateDraft({ date_time: tempDate, rsvp_deadline: oneHourBefore });
          setPickerMode(null);
          Toast.info('RSVP deadline was moved to 1 hour before the new event time.');
          return;
        }
      }
      updateDraft({ date_time: tempDate });
    }
    setPickerMode(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => prevStep()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.stepLabel}>Step 4 of 6</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View key={s} style={[styles.dot, s <= 4 && styles.dotActive, s === 4 && styles.dotCurrent]} />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>When is it?</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Date TBD</Text>
          <Switch
            value={draft.date_tbd}
            onValueChange={(v) => updateDraft({ date_tbd: v })}
            trackColor={{ false: COLORS.border, true: COLORS.gold }}
            thumbColor={COLORS.white}
          />
        </View>

        {!draft.date_tbd && (
          <View style={{ gap: SPACING.sm }}>
            <Pressable style={({ pressed }) => [styles.dateButton, pressed && { opacity: 0.8 }]} onPress={() => openPicker('date')}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>
                {draft.date_time ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select date'}
              </Text>
              <Text style={styles.dateChevron}>›</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.dateButton, pressed && { opacity: 0.8 }]} onPress={() => openPicker('time')}>
              <Text style={styles.dateIcon}>⏰</Text>
              <Text style={styles.dateText}>
                {draft.date_time ? format(selectedDate, 'h:mm a') : 'Select time'}
              </Text>
              <Text style={styles.dateChevron}>›</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.label}>Where?</Text>
        <TextInput
          style={styles.input} value={draft.location_name}
          onChangeText={(t) => updateDraft({ location_name: t })}
          placeholder="Venue or address" placeholderTextColor={COLORS.hint}
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Hide address from non-RSVPs</Text>
          <Switch value={draft.is_location_hidden} onValueChange={(v) => updateDraft({ is_location_hidden: v })} trackColor={{ false: COLORS.border, true: COLORS.gold }} thumbColor={COLORS.white} />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Halal-certified venue</Text>
          <Switch value={draft.is_halal_venue} onValueChange={(v) => updateDraft({ is_halal_venue: v })} trackColor={{ false: COLORS.border, true: COLORS.green }} thumbColor={COLORS.white} />
        </View>

        <Text style={styles.label}>Virtual event link (optional)</Text>
        <TextInput
          style={styles.input} value={draft.virtual_link}
          onChangeText={(t) => updateDraft({ virtual_link: t })}
          placeholder="Zoom, Google Meet, etc."
          placeholderTextColor={COLORS.hint}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>How much?</Text>
        <View style={styles.priceRow}>
          {PRICE_OPTIONS.map((opt) => (
            <Pressable key={opt.value} style={[styles.pricePill, draft.price === opt.value && !showCustom && styles.pricePillActive]}
              onPress={() => { setShowCustom(false); updateDraft({ price: opt.value }); }}>
              <Text style={[styles.priceText, draft.price === opt.value && !showCustom && styles.priceTextActive]}>{opt.label}</Text>
            </Pressable>
          ))}
          <Pressable style={[styles.pricePill, showCustom && styles.pricePillActive]} onPress={() => setShowCustom(true)}>
            <Text style={[styles.priceText, showCustom && styles.priceTextActive]}>Custom</Text>
          </Pressable>
        </View>

        {showCustom && (
          <TextInput style={[styles.input, { marginTop: SPACING.sm }]} value={customPrice}
            onChangeText={(t) => { setCustomPrice(t); const cents = Math.round(parseFloat(t || '0') * 100); updateDraft({ price: isNaN(cents) ? 0 : cents }); }}
            placeholder="Enter price" placeholderTextColor={COLORS.hint} keyboardType="decimal-pad" />
        )}

        <Text style={styles.label}>How many spots? (optional)</Text>
        <TextInput style={styles.input} value={draft.capacity ? String(draft.capacity) : ''}
          onChangeText={(t) => { const num = parseInt(t, 10); updateDraft({ capacity: isNaN(num) ? null : num }); }}
          placeholder="Leave empty for unlimited" placeholderTextColor={COLORS.hint} keyboardType="number-pad" />

        <Text style={styles.label}>RSVP deadline (optional)</Text>
        <Pressable
          style={({ pressed }) => [styles.dateButton, pressed && { opacity: 0.8 }]}
          onPress={() => {
            const d = draft.rsvp_deadline instanceof Date ? draft.rsvp_deadline : new Date();
            setTempDate(d);
            setPickerMode('deadline');
          }}
        >
          <Text style={styles.dateIcon}>⏳</Text>
          <Text style={styles.dateText}>
            {draft.rsvp_deadline ? format(draft.rsvp_deadline, 'MMM d, yyyy h:mm a') : 'No deadline'}
          </Text>
          {draft.rsvp_deadline && (
            <Pressable onPress={() => updateDraft({ rsvp_deadline: null })}>
              <Text style={{ color: COLORS.red, fontSize: 14 }}>✕</Text>
            </Pressable>
          )}
          <Text style={styles.dateChevron}>›</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={({ pressed }) => [styles.button, !canContinue && styles.buttonDisabled, pressed && { transform: [{ scale: 0.97 }] }]}
          onPress={() => nextStep()} disabled={!canContinue}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="ctaGrad3" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFDFA1" />
                <Stop offset="0.5" stopColor="#E6C27A" />
                <Stop offset="1" stopColor="#FFDFA1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" rx={RADIUS.md} fill="url(#ctaGrad3)" />
          </Svg>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>

      {/* Date/Time Picker Modal */}
      <Modal visible={pickerMode !== null} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerMode(null)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {pickerMode === 'date' ? 'Select Date' : pickerMode === 'deadline' ? 'RSVP Deadline' : 'Select Time'}
            </Text>
            <Pressable onPress={confirmPicker}>
              <Text style={styles.modalDone}>Done</Text>
            </Pressable>
          </View>
          {pickerMode && (
            <DateTimePicker
              value={tempDate}
              mode={pickerMode === 'deadline' ? 'date' : pickerMode}
              display="spinner"
              onChange={(_, date) => { if (date) setTempDate(date); }}
              minimumDate={pickerMode === 'date' || pickerMode === 'deadline' ? new Date() : undefined}
              themeVariant="dark"
              style={{ height: 200 }}
            />
          )}
        </View>
      </Modal>
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 40 },
  label: { fontSize: 16, color: COLORS.white, ...FONTS.semibold, marginBottom: SPACING.sm, marginTop: SPACING.xl },
  input: { backgroundColor: COLORS.input, borderRadius: RADIUS.md, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255, 223, 161, 0.10)', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 2, color: COLORS.white, fontSize: 16, ...FONTS.medium },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
  },
  dateIcon: { fontSize: 18 },
  dateText: { flex: 1, fontSize: 16, color: COLORS.white, ...FONTS.medium },
  dateChevron: { fontSize: 20, color: COLORS.hint, ...FONTS.regular },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, marginTop: SPACING.sm },
  toggleLabel: { color: COLORS.white, fontSize: 15, ...FONTS.medium },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pricePill: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.full, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255, 223, 161, 0.10)', backgroundColor: COLORS.input },
  pricePillActive: { borderColor: COLORS.gold, backgroundColor: COLORS.card2 },
  priceText: { color: COLORS.muted, fontSize: 14, ...FONTS.medium },
  priceTextActive: { color: COLORS.gold },
  bottomBar: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255, 223, 161, 0.10)', marginBottom: 90 },
  button: { borderRadius: RADIUS.md, alignItems: 'center', height: 52, justifyContent: 'center', overflow: 'hidden' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255, 223, 161, 0.10)',
  },
  modalTitle: { fontSize: 17, color: COLORS.white, ...FONTS.bold },
  modalDone: { fontSize: 17, color: COLORS.gold, ...FONTS.bold },
});

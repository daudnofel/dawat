import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const canContinue = draft.location_name.trim().length >= 2 || draft.date_tbd;

  const selectedDate = draft.date_time ?? new Date();

  const onDateChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) updateDraft({ date_time: date });
  };

  const onTimeChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (date) updateDraft({ date_time: date });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => prevStep()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.dot, s <= 3 && styles.dotActive, s === 3 && styles.dotCurrent]} />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Date & Time */}
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
          <View>
            <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>
                {draft.date_time ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select date'}
              </Text>
            </Pressable>

            <Pressable style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.dateIcon}>⏰</Text>
              <Text style={styles.dateText}>
                {draft.date_time ? format(selectedDate, 'h:mm a') : 'Select time'}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
                themeVariant="dark"
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                themeVariant="dark"
              />
            )}
          </View>
        )}

        {/* Location */}
        <Text style={styles.label}>Where?</Text>
        <TextInput
          style={styles.input}
          value={draft.location_name}
          onChangeText={(t) => updateDraft({ location_name: t })}
          placeholder="Venue or address"
          placeholderTextColor={COLORS.hint}
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Hide address from non-RSVPs</Text>
          <Switch
            value={draft.is_location_hidden}
            onValueChange={(v) => updateDraft({ is_location_hidden: v })}
            trackColor={{ false: COLORS.border, true: COLORS.gold }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Halal-certified venue</Text>
          <Switch
            value={draft.is_halal_venue}
            onValueChange={(v) => updateDraft({ is_halal_venue: v })}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* Price */}
        <Text style={styles.label}>How much?</Text>
        <View style={styles.priceRow}>
          {PRICE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.pricePill, draft.price === opt.value && !showCustom && styles.pricePillActive]}
              onPress={() => { setShowCustom(false); updateDraft({ price: opt.value }); }}
            >
              <Text style={[styles.priceText, draft.price === opt.value && !showCustom && styles.priceTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.pricePill, showCustom && styles.pricePillActive]}
            onPress={() => setShowCustom(true)}
          >
            <Text style={[styles.priceText, showCustom && styles.priceTextActive]}>Custom</Text>
          </Pressable>
        </View>

        {showCustom && (
          <TextInput
            style={[styles.input, { marginTop: SPACING.sm }]}
            value={customPrice}
            onChangeText={(t) => {
              setCustomPrice(t);
              const cents = Math.round(parseFloat(t || '0') * 100);
              updateDraft({ price: isNaN(cents) ? 0 : cents });
            }}
            placeholder="Enter price"
            placeholderTextColor={COLORS.hint}
            keyboardType="decimal-pad"
          />
        )}

        {/* Capacity */}
        <Text style={styles.label}>How many spots? (optional)</Text>
        <TextInput
          style={styles.input}
          value={draft.capacity ? String(draft.capacity) : ''}
          onChangeText={(t) => {
            const num = parseInt(t, 10);
            updateDraft({ capacity: isNaN(num) ? null : num });
          }}
          placeholder="Leave empty for unlimited"
          placeholderTextColor={COLORS.hint}
          keyboardType="number-pad"
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [styles.button, !canContinue && styles.buttonDisabled, pressed && { transform: [{ scale: 0.97 }] }]}
          onPress={() => nextStep()}
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
  input: { backgroundColor: COLORS.input, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 2, color: COLORS.white, fontSize: 16, ...FONTS.medium },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 2, marginBottom: SPACING.sm,
  },
  dateIcon: { fontSize: 18 },
  dateText: { fontSize: 16, color: COLORS.white, ...FONTS.medium },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, marginTop: SPACING.sm },
  toggleLabel: { color: COLORS.white, fontSize: 15, ...FONTS.medium },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pricePill: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.input },
  pricePillActive: { borderColor: COLORS.gold, backgroundColor: COLORS.card2 },
  priceText: { color: COLORS.muted, fontSize: 14, ...FONTS.medium },
  priceTextActive: { color: COLORS.gold },
  bottomBar: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  button: { backgroundColor: COLORS.gold, borderRadius: RADIUS.md, paddingVertical: SPACING.lg, alignItems: 'center', height: 52, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
});

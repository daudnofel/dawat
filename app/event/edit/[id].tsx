import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  Switch, Alert, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../lib/theme';
import { GenderMode } from '../../../types';
import { supabase } from '../../../lib/supabase';
import { generateSlug } from '../../../lib/slugify';

const PRICE_OPTIONS = [
  { label: 'Free', value: 0 },
  { label: '$10', value: 1000 },
  { label: '$25', value: 2500 },
  { label: '$45', value: 4500 },
  { label: '$100', value: 10000 },
];

const GENDER_OPTIONS = [
  { label: 'Mixed', subtitle: 'Open to all', emoji: '🌟', value: GenderMode.Mixed },
  { label: 'Sisters Only', subtitle: 'Women only', emoji: '🌸', value: GenderMode.SistersOnly },
  { label: 'Brothers', subtitle: 'Men only', emoji: '💪', value: GenderMode.BrothersOnly },
  { label: 'Family', subtitle: 'Parents + kids', emoji: '👨‍👩‍👧', value: GenderMode.Family },
];

interface EditableEvent {
  title: string;
  description: string;
  date_time: Date | null;
  date_tbd: boolean;
  location_name: string;
  is_location_hidden: boolean;
  is_halal_venue: boolean;
  price: number;
  capacity: number | null;
  gender_mode: GenderMode;
  is_id_required: boolean;
}

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalTitle, setOriginalTitle] = useState('');
  const [event, setEvent] = useState<EditableEvent>({
    title: '',
    description: '',
    date_time: null,
    date_tbd: false,
    location_name: '',
    is_location_hidden: false,
    is_halal_venue: false,
    price: 0,
    capacity: null,
    gender_mode: GenderMode.Mixed,
    is_id_required: false,
  });
  const [customPrice, setCustomPrice] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      Alert.alert('Error', 'Could not load event');
      router.back();
      return;
    }

    // Check host ownership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || data.host_id !== user.id) {
      Alert.alert('Error', 'You can only edit your own events');
      router.back();
      return;
    }

    setOriginalTitle(data.title);

    const isPreset = PRICE_OPTIONS.some((o) => o.value === data.price);
    if (!isPreset && data.price > 0) {
      setShowCustom(true);
      setCustomPrice((data.price / 100).toString());
    }

    setEvent({
      title: data.title ?? '',
      description: data.description ?? '',
      date_time: data.date_time ? new Date(data.date_time) : null,
      date_tbd: data.date_tbd ?? false,
      location_name: data.location_name ?? '',
      is_location_hidden: data.is_location_hidden ?? false,
      is_halal_venue: data.is_halal_venue ?? false,
      price: data.price ?? 0,
      capacity: data.capacity ?? null,
      gender_mode: (data.gender_mode as GenderMode) ?? GenderMode.Mixed,
      is_id_required: data.is_id_required ?? false,
    });

    setLoading(false);
  };

  const update = (fields: Partial<EditableEvent>) => {
    setEvent((prev) => ({ ...prev, ...fields }));
  };

  const openPicker = (mode: 'date' | 'time') => {
    setTempDate(event.date_time ?? new Date());
    setPickerMode(mode);
  };

  const confirmPicker = () => {
    update({ date_time: tempDate });
    setPickerMode(null);
  };

  const handleSave = async () => {
    if (event.title.trim().length < 2) {
      Alert.alert('Error', 'Title must be at least 2 characters');
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const updates: Record<string, unknown> = {
      title: event.title,
      description: event.description || null,
      date_time: event.date_time?.toISOString() ?? null,
      date_tbd: event.date_tbd,
      location_name: event.location_name || null,
      is_location_hidden: event.is_location_hidden,
      is_halal_venue: event.is_halal_venue,
      price: event.price,
      capacity: event.capacity,
      gender_mode: event.gender_mode,
      is_id_required: event.is_id_required,
      updated_at: new Date().toISOString(),
    };

    // Regenerate slug if title changed
    if (event.title !== originalTitle) {
      updates.slug = generateSlug(event.title);
    }

    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id);

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const canSave = event.title.trim().length >= 2;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Event</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={styles.label}>Event name</Text>
        <TextInput
          style={styles.titleInput}
          value={event.title}
          onChangeText={(t) => update({ title: t })}
          placeholder="Eid Gala, Sisters Halaqa..."
          placeholderTextColor={COLORS.hint}
          maxLength={60}
        />
        <Text style={styles.charCount}>{event.title.length}/60</Text>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { minHeight: 100, paddingTop: SPACING.md }]}
          value={event.description}
          onChangeText={(t) => update({ description: t })}
          placeholder="What's happening?"
          placeholderTextColor={COLORS.hint}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{event.description.length}/500</Text>

        {/* Date & Time */}
        <Text style={styles.label}>When</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Date TBD</Text>
          <Switch
            value={event.date_tbd}
            onValueChange={(v) => update({ date_tbd: v })}
            trackColor={{ false: COLORS.border, true: COLORS.gold }}
            thumbColor={COLORS.white}
          />
        </View>

        {!event.date_tbd && (
          <View style={{ gap: SPACING.sm }}>
            <Pressable
              style={({ pressed }) => [styles.dateButton, pressed && { opacity: 0.8 }]}
              onPress={() => openPicker('date')}
            >
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>
                {event.date_time ? format(event.date_time, 'EEEE, MMMM d, yyyy') : 'Select date'}
              </Text>
              <Text style={styles.dateChevron}>›</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.dateButton, pressed && { opacity: 0.8 }]}
              onPress={() => openPicker('time')}
            >
              <Text style={styles.dateIcon}>⏰</Text>
              <Text style={styles.dateText}>
                {event.date_time ? format(event.date_time, 'h:mm a') : 'Select time'}
              </Text>
              <Text style={styles.dateChevron}>›</Text>
            </Pressable>
          </View>
        )}

        {/* Location */}
        <Text style={styles.label}>Where</Text>
        <TextInput
          style={styles.input}
          value={event.location_name}
          onChangeText={(t) => update({ location_name: t })}
          placeholder="Venue or address"
          placeholderTextColor={COLORS.hint}
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Hide address from non-RSVPs</Text>
          <Switch
            value={event.is_location_hidden}
            onValueChange={(v) => update({ is_location_hidden: v })}
            trackColor={{ false: COLORS.border, true: COLORS.gold }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Halal-certified venue</Text>
          <Switch
            value={event.is_halal_venue}
            onValueChange={(v) => update({ is_halal_venue: v })}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* Price */}
        <Text style={styles.label}>Price</Text>
        <View style={styles.priceRow}>
          {PRICE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.pricePill, event.price === opt.value && !showCustom && styles.pricePillActive]}
              onPress={() => { setShowCustom(false); update({ price: opt.value }); }}
            >
              <Text style={[styles.priceText, event.price === opt.value && !showCustom && styles.priceTextActive]}>
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
              update({ price: isNaN(cents) ? 0 : cents });
            }}
            placeholder="Enter price"
            placeholderTextColor={COLORS.hint}
            keyboardType="decimal-pad"
          />
        )}

        {/* Capacity */}
        <Text style={styles.label}>Capacity (optional)</Text>
        <TextInput
          style={styles.input}
          value={event.capacity ? String(event.capacity) : ''}
          onChangeText={(t) => {
            const num = parseInt(t, 10);
            update({ capacity: isNaN(num) ? null : num });
          }}
          placeholder="Leave empty for unlimited"
          placeholderTextColor={COLORS.hint}
          keyboardType="number-pad"
        />

        {/* Gender Mode */}
        <Text style={styles.label}>Who's this gathering for?</Text>
        <View style={styles.genderGrid}>
          {GENDER_OPTIONS.map((opt) => {
            const isSelected = event.gender_mode === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[styles.genderCard, isSelected && styles.genderCardSelected]}
                onPress={() => update({ gender_mode: opt.value })}
              >
                <Text style={styles.genderEmoji}>{opt.emoji}</Text>
                <Text style={[styles.genderLabel, isSelected && styles.genderLabelActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.genderSubtitle}>{opt.subtitle}</Text>
                {isSelected && (
                  <View style={styles.genderCheck}>
                    <Text style={styles.genderCheckText}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ID Verification */}
        <View style={[styles.toggleRow, { marginTop: SPACING.xl, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Require ID verification?</Text>
            <Text style={styles.toggleHint}>Guests verify government ID via Stripe Identity</Text>
          </View>
          <Switch
            value={event.is_id_required}
            onValueChange={(v) => update({ is_id_required: v })}
            trackColor={{ false: COLORS.border, true: COLORS.gold }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Bottom Save Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            !canSave && styles.buttonDisabled,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.dark} />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </Pressable>
      </View>

      {/* Date/Time Picker Modal */}
      <Modal visible={pickerMode !== null} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerMode(null)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {pickerMode === 'date' ? 'Select Date' : 'Select Time'}
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
              onChange={(_, date) => { if (date) setTempDate(date); }}
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
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  cancelText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  headerTitle: { fontSize: 17, color: COLORS.white, ...FONTS.bold },
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
  charCount: { color: COLORS.hint, fontSize: 12, ...FONTS.regular, textAlign: 'right', marginTop: SPACING.xs },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.md, marginTop: SPACING.sm,
  },
  toggleLabel: { color: COLORS.white, fontSize: 15, ...FONTS.medium },
  toggleHint: { color: COLORS.hint, fontSize: 12, ...FONTS.regular, marginTop: SPACING.xs },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
  },
  dateIcon: { fontSize: 18 },
  dateText: { flex: 1, fontSize: 16, color: COLORS.white, ...FONTS.medium },
  dateChevron: { fontSize: 20, color: COLORS.hint, ...FONTS.regular },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pricePill: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.input,
  },
  pricePillActive: { borderColor: COLORS.gold, backgroundColor: COLORS.card2 },
  priceText: { color: COLORS.muted, fontSize: 14, ...FONTS.medium },
  priceTextActive: { color: COLORS.gold },
  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  genderCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: SPACING.xl, alignItems: 'center',
  },
  genderCardSelected: { borderColor: COLORS.gold, backgroundColor: COLORS.card2 },
  genderEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  genderLabel: { fontSize: 15, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.xs },
  genderLabelActive: { color: COLORS.gold },
  genderSubtitle: { fontSize: 12, color: COLORS.muted, ...FONTS.regular },
  genderCheck: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center',
  },
  genderCheckText: { color: COLORS.dark, fontSize: 13, ...FONTS.bold },
  bottomBar: {
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: 30,
  },
  saveButton: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, alignItems: 'center', height: 52, justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  saveText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, color: COLORS.white, ...FONTS.bold },
  modalDone: { fontSize: 17, color: COLORS.gold, ...FONTS.bold },
});

/**
 * Details tool sheet (DAW-54).
 *
 * Everything about the *logistics* of the event lives here: date/time
 * (plus TBD toggle), location name + hide-address toggle, halal venue
 * toggle, virtual link, price, capacity, RSVP deadline. Controls are
 * ported directly from the legacy `step3-details.tsx` (DAW-55 removes
 * that file) so wiring and validation rules stay identical — only the
 * chrome is replaced by `ToolSheet`.
 *
 * Title + host + audience are deliberately NOT here — those live in the
 * essentials sheet and are considered "already committed" by the time a
 * host reaches the editor. If they change their mind, they re-open
 * essentials (via the editor's title zone tap, eventually).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Switch,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

import ToolSheet from '../../../components/ToolSheet';
import { useEventStore } from '../../../store/useEventStore';
import { Toast } from '../../../components/Toast';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../lib/theme';

const PRICE_OPTIONS = [
  { label: 'Free', value: 0 },
  { label: '$10', value: 1000 },
  { label: '$25', value: 2500 },
  { label: '$45', value: 4500 },
  { label: '$100', value: 10000 },
];

type PickerMode = 'date' | 'time' | 'deadline' | null;

export default function DetailsToolScreen() {
  const router = useRouter();
  const { draft, updateDraft, closeTool } = useEventStore();
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [customPriceText, setCustomPriceText] = useState('');

  const handleClose = () => {
    closeTool();
    router.back();
  };

  const openPicker = (mode: 'date' | 'time') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempDate(draft.date_time ?? new Date());
    setPickerMode(mode);
  };

  const openDeadlinePicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const start =
      draft.rsvp_deadline instanceof Date ? draft.rsvp_deadline : new Date();
    setTempDate(start);
    setPickerMode('deadline');
  };

  const confirmPicker = () => {
    if (pickerMode === 'deadline') {
      if (draft.date_time) {
        const oneHourBefore = new Date(
          draft.date_time.getTime() - 60 * 60 * 1000,
        );
        if (tempDate >= oneHourBefore) {
          Toast.error(
            'RSVP deadline must be at least 1 hour before the event starts.',
          );
          return;
        }
      }
      updateDraft({ rsvp_deadline: tempDate });
    } else {
      // If event moves earlier and deadline is now invalid, auto-adjust.
      if (draft.rsvp_deadline) {
        const oneHourBefore = new Date(tempDate.getTime() - 60 * 60 * 1000);
        if (draft.rsvp_deadline >= oneHourBefore) {
          updateDraft({
            date_time: tempDate,
            rsvp_deadline: oneHourBefore,
            date_tbd: false,
          });
          setPickerMode(null);
          Toast.info(
            'RSVP deadline was moved to 1 hour before the new event time.',
          );
          return;
        }
      }
      updateDraft({ date_time: tempDate, date_tbd: false });
    }
    setPickerMode(null);
  };

  const handlePriceSelect = (value: number) => {
    Haptics.selectionAsync();
    setShowCustomPrice(false);
    updateDraft({ price: value });
  };

  const handleCustomPrice = (text: string) => {
    setCustomPriceText(text);
    const cents = Math.round(parseFloat(text || '0') * 100);
    updateDraft({ price: isNaN(cents) ? 0 : cents });
  };

  const handleCapacity = (text: string) => {
    const num = parseInt(text, 10);
    updateDraft({ capacity: isNaN(num) ? null : num });
  };

  return (
    <ToolSheet title="Details" onClose={handleClose}>
      {/* ── Date & time ── */}
      <Text style={styles.label}>When is it?</Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Date TBD</Text>
        <Switch
          value={draft.date_tbd}
          onValueChange={(v) => {
            Haptics.selectionAsync();
            if (v) {
              updateDraft({ date_tbd: true, date_time: null });
            } else {
              updateDraft({ date_tbd: false });
            }
          }}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>

      {!draft.date_tbd && (
        <View style={{ gap: SPACING.sm }}>
          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.pressed,
            ]}
            onPress={() => openPicker('date')}
          >
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>
              {draft.date_time
                ? format(draft.date_time, 'EEEE, MMMM d, yyyy')
                : 'Select date'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.pressed,
            ]}
            onPress={() => openPicker('time')}
          >
            <Text style={styles.dateIcon}>⏰</Text>
            <Text style={styles.dateText}>
              {draft.date_time
                ? format(draft.date_time, 'h:mm a')
                : 'Select time'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>
      )}

      {/* ── Location ── */}
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

      {/* ── Virtual link ── */}
      <Text style={styles.label}>Virtual event link (optional)</Text>
      <TextInput
        style={styles.input}
        value={draft.virtual_link}
        onChangeText={(t) => updateDraft({ virtual_link: t })}
        placeholder="Zoom, Google Meet, etc."
        placeholderTextColor={COLORS.hint}
        autoCapitalize="none"
        keyboardType="url"
      />

      {/* ── Price ── */}
      <Text style={styles.label}>How much?</Text>
      <View style={styles.priceRow}>
        {PRICE_OPTIONS.map((opt) => {
          const active = draft.price === opt.value && !showCustomPrice;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handlePriceSelect(opt.value)}
              style={[styles.pricePill, active && styles.pricePillActive]}
            >
              <Text
                style={[styles.priceText, active && styles.priceTextActive]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setShowCustomPrice(true);
          }}
          style={[
            styles.pricePill,
            showCustomPrice && styles.pricePillActive,
          ]}
        >
          <Text
            style={[
              styles.priceText,
              showCustomPrice && styles.priceTextActive,
            ]}
          >
            Custom
          </Text>
        </Pressable>
      </View>

      {showCustomPrice && (
        <TextInput
          style={[styles.input, { marginTop: SPACING.sm }]}
          value={customPriceText}
          onChangeText={handleCustomPrice}
          placeholder="Enter price"
          placeholderTextColor={COLORS.hint}
          keyboardType="decimal-pad"
        />
      )}

      {/* ── Capacity ── */}
      <Text style={styles.label}>How many spots? (optional)</Text>
      <TextInput
        style={styles.input}
        value={draft.capacity ? String(draft.capacity) : ''}
        onChangeText={handleCapacity}
        placeholder="Leave empty for unlimited"
        placeholderTextColor={COLORS.hint}
        keyboardType="number-pad"
      />

      {/* ── RSVP deadline ── */}
      <Text style={styles.label}>RSVP deadline (optional)</Text>
      <Pressable
        style={({ pressed }) => [
          styles.dateButton,
          pressed && styles.pressed,
        ]}
        onPress={openDeadlinePicker}
      >
        <Text style={styles.dateIcon}>⏳</Text>
        <Text style={styles.dateText}>
          {draft.rsvp_deadline
            ? format(draft.rsvp_deadline, 'MMM d, yyyy h:mm a')
            : 'No deadline'}
        </Text>
        {draft.rsvp_deadline && (
          <Pressable
            onPress={() => updateDraft({ rsvp_deadline: null })}
            hitSlop={8}
          >
            <Text style={styles.clearX}>✕</Text>
          </Pressable>
        )}
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      {/* Date/time picker modal */}
      <Modal
        visible={pickerMode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerMode(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPickerMode(null)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setPickerMode(null)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {pickerMode === 'date'
                ? 'Select Date'
                : pickerMode === 'deadline'
                  ? 'RSVP Deadline'
                  : 'Select Time'}
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
              themeVariant="dark"
              textColor={COLORS.white}
              onChange={(_, date) => {
                if (date) setTempDate(date);
              }}
              minimumDate={
                pickerMode === 'date' || pickerMode === 'deadline'
                  ? new Date()
                  : undefined
              }
              style={{ height: 200 }}
            />
          )}
        </View>
      </Modal>
    </ToolSheet>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semibold,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.medium,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  dateIcon: { fontSize: 18 },
  dateText: { flex: 1, fontSize: 15, color: COLORS.white, ...FONTS.medium },
  chevron: { fontSize: 20, color: COLORS.hint, ...FONTS.regular },
  clearX: { color: COLORS.red, fontSize: 14, ...FONTS.bold },
  pressed: { opacity: 0.85 },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  toggleLabel: { color: COLORS.white, fontSize: 14, ...FONTS.medium },

  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pricePill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    backgroundColor: COLORS.input,
  },
  pricePillActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.card2,
  },
  priceText: { color: COLORS.muted, fontSize: 14, ...FONTS.medium },
  priceTextActive: { color: COLORS.gold },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 223, 161, 0.10)',
  },
  modalCancel: { color: COLORS.muted, fontSize: 15, ...FONTS.medium },
  modalTitle: { fontSize: 17, color: COLORS.white, ...FONTS.bold },
  modalDone: { fontSize: 15, color: COLORS.gold, ...FONTS.bold },
});

/**
 * Details tool sheet (DAW-54).
 *
 * Everything about the *logistics* of the event lives here: date/time
 * (plus TBD toggle), location name + hide-address toggle, halal venue
 * toggle, virtual link, price, capacity, RSVP deadline. Controls are
 * ported directly from the legacy `step3-details.tsx` (deleted in
 * DAW-55) so wiring and validation rules stay identical — only the
 * chrome is replaced by `ToolSheet`.
 *
 * Title + host + audience are deliberately NOT here — those live in the
 * essentials sheet and are considered "already committed" by the time a
 * host reaches the editor. If they change their mind, they re-open
 * essentials (via the editor's title zone tap, eventually).
 *
 * DAW-61 — migrated to Dawat primitives (DText, DInput).
 */

import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Switch,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

import ToolSheet from '../../../components/ToolSheet';
import { useEventStore } from '../../../store/useEventStore';
import { Toast } from '../../../components/Toast';
import { DText, DInput } from '../../../components/ui';
import { COLORS, SPACING, RADIUS } from '../../../lib/theme';

interface Props {
  onClose?: () => void;
}

const PRICE_OPTIONS = [
  { label: 'Free', value: 0 },
  { label: '$10', value: 1000 },
  { label: '$25', value: 2500 },
  { label: '$45', value: 4500 },
  { label: '$100', value: 10000 },
];

type PickerMode = 'date' | 'time' | 'deadline' | null;

export default function DetailsToolScreen({ onClose }: Props = {}) {
  const { draft, updateDraft, closeTool } = useEventStore();
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [customPriceText, setCustomPriceText] = useState('');

  const handleClose = () => {
    closeTool();
    onClose?.();
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
      <DText variant="label" style={styles.sectionLabel}>When is it?</DText>
      <View style={styles.toggleRow}>
        <DText variant="meta" color={COLORS.white}>Date TBD</DText>
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
            <DText style={styles.dateIcon}>📅</DText>
            <DText variant="meta" color={COLORS.white} style={{ flex: 1, fontSize: 15 }}>
              {draft.date_time
                ? format(draft.date_time, 'EEEE, MMMM d, yyyy')
                : 'Select date'}
            </DText>
            <DText color={COLORS.hint} style={styles.chevron}>›</DText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.pressed,
            ]}
            onPress={() => openPicker('time')}
          >
            <DText style={styles.dateIcon}>⏰</DText>
            <DText variant="meta" color={COLORS.white} style={{ flex: 1, fontSize: 15 }}>
              {draft.date_time
                ? format(draft.date_time, 'h:mm a')
                : 'Select time'}
            </DText>
            <DText color={COLORS.hint} style={styles.chevron}>›</DText>
          </Pressable>
        </View>
      )}

      {/* ── Location ── */}
      <DText variant="label" style={styles.sectionLabel}>Where?</DText>
      <DInput
        value={draft.location_name}
        onChangeText={(t) => updateDraft({ location_name: t })}
        placeholder="Venue or address"
      />

      <View style={styles.toggleRow}>
        <DText variant="meta" color={COLORS.white}>Hide address from non-RSVPs</DText>
        <Switch
          value={draft.is_location_hidden}
          onValueChange={(v) => updateDraft({ is_location_hidden: v })}
          trackColor={{ false: COLORS.border, true: COLORS.gold }}
          thumbColor={COLORS.white}
        />
      </View>

      <View style={styles.toggleRow}>
        <DText variant="meta" color={COLORS.white}>Halal-certified venue</DText>
        <Switch
          value={draft.is_halal_venue}
          onValueChange={(v) => updateDraft({ is_halal_venue: v })}
          trackColor={{ false: COLORS.border, true: COLORS.green }}
          thumbColor={COLORS.white}
        />
      </View>

      {/* ── Virtual link ── */}
      <DText variant="label" style={styles.sectionLabel}>Virtual event link (optional)</DText>
      <DInput
        value={draft.virtual_link}
        onChangeText={(t) => updateDraft({ virtual_link: t })}
        placeholder="Zoom, Google Meet, etc."
        autoCapitalize="none"
        keyboardType="url"
      />

      {/* ── Price ── */}
      <DText variant="label" style={styles.sectionLabel}>How much?</DText>
      <View style={styles.priceRow}>
        {PRICE_OPTIONS.map((opt) => {
          const active = draft.price === opt.value && !showCustomPrice;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handlePriceSelect(opt.value)}
              style={[styles.pricePill, active && styles.pricePillActive]}
            >
              <DText
                variant="meta"
                color={active ? COLORS.gold : COLORS.muted}
                style={{ fontSize: 14 }}
              >
                {opt.label}
              </DText>
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
          <DText
            variant="meta"
            color={showCustomPrice ? COLORS.gold : COLORS.muted}
            style={{ fontSize: 14 }}
          >
            Custom
          </DText>
        </Pressable>
      </View>

      {showCustomPrice && (
        <DInput
          style={{ marginTop: SPACING.sm }}
          value={customPriceText}
          onChangeText={handleCustomPrice}
          placeholder="Enter price"
          keyboardType="decimal-pad"
        />
      )}

      {/* ── Payment link ── */}
      <DText variant="label" style={styles.sectionLabel}>Payment link (optional)</DText>
      <DInput
        value={draft.payment_link}
        onChangeText={(t) => updateDraft({ payment_link: t })}
        placeholder="Venmo, CashApp, PayPal URL"
        autoCapitalize="none"
        keyboardType="url"
      />

      {/* ── Capacity ── */}
      <DText variant="label" style={styles.sectionLabel}>How many spots? (optional)</DText>
      <DInput
        value={draft.capacity ? String(draft.capacity) : ''}
        onChangeText={handleCapacity}
        placeholder="Leave empty for unlimited"
        keyboardType="number-pad"
      />

      {/* ── RSVP deadline ── */}
      <DText variant="label" style={styles.sectionLabel}>RSVP deadline (optional)</DText>
      <Pressable
        style={({ pressed }) => [
          styles.dateButton,
          pressed && styles.pressed,
        ]}
        onPress={openDeadlinePicker}
      >
        <DText style={styles.dateIcon}>⏳</DText>
        <DText variant="meta" color={COLORS.white} style={{ flex: 1, fontSize: 15 }}>
          {draft.rsvp_deadline
            ? format(draft.rsvp_deadline, 'MMM d, yyyy h:mm a')
            : 'No deadline'}
        </DText>
        {draft.rsvp_deadline && (
          <Pressable
            onPress={() => updateDraft({ rsvp_deadline: null })}
            hitSlop={8}
          >
            <DText color={COLORS.red} style={{ fontSize: 14 }}>✕</DText>
          </Pressable>
        )}
        <DText color={COLORS.hint} style={styles.chevron}>›</DText>
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
              <DText variant="meta" color={COLORS.muted} style={{ fontSize: 15 }}>Cancel</DText>
            </Pressable>
            <DText variant="label" style={{ fontSize: 17 }}>
              {pickerMode === 'date'
                ? 'Select Date'
                : pickerMode === 'deadline'
                  ? 'RSVP Deadline'
                  : 'Select Time'}
            </DText>
            <Pressable onPress={confirmPicker}>
              <DText variant="label" color={COLORS.gold} style={{ fontSize: 15 }}>Done</DText>
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
  sectionLabel: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
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
  chevron: { fontSize: 20 },
  pressed: { opacity: 0.85 },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },

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

  // Transparent — keeps the tap-to-dismiss gesture but doesn't visually
  // dim the editor canvas behind the date/time picker.
  modalOverlay: { flex: 1, backgroundColor: 'transparent' },
  modalSheet: {
    // Slightly lighter than the Details sheet (COLORS.card) so the picker
    // reads as elevated on top of it. Subtle gold-tinted top border adds
    // a hairline separator for the same purpose.
    backgroundColor: COLORS.card2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201,168,76,0.20)',
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
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
});

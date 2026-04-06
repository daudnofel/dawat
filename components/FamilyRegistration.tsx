import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

interface Guest {
  name: string;
  isChild: boolean;
}

interface FamilyRegistrationProps {
  visible: boolean;
  maxGuests: number;
  onSubmit: (childrenCount: number, namedGuests: string[]) => void;
  onSkip: () => void;
}

export default function FamilyRegistration({
  visible,
  maxGuests,
  onSubmit,
  onSkip,
}: FamilyRegistrationProps) {
  const [guests, setGuests] = useState<Guest[]>([]);

  const addGuest = () => {
    if (guests.length >= maxGuests) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGuests([...guests, { name: '', isChild: false }]);
  };

  const removeGuest = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGuests(guests.filter((_, i) => i !== index));
  };

  const updateGuestName = (index: number, name: string) => {
    const updated = [...guests];
    updated[index] = { ...updated[index], name };
    setGuests(updated);
  };

  const toggleChild = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = [...guests];
    updated[index] = { ...updated[index], isChild: !updated[index].isChild };
    setGuests(updated);
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Children = guests marked as child (named or unnamed)
    const childrenCount = guests.filter((g) => g.isChild).length;
    // Named guests = adults with a name (not children, not unnamed)
    const namedGuests = guests
      .filter((g) => !g.isChild && g.name.trim().length > 0)
      .map((g) => g.name.trim());
    // Unnamed adult guests need to count too
    const unnamedAdults = guests.filter((g) => !g.isChild && g.name.trim().length === 0).length;
    // Pad named guests with empty placeholders for unnamed adults
    const allAdultEntries = [...namedGuests, ...Array(unnamedAdults).fill('Guest')];
    onSubmit(childrenCount, allAdultEntries);
    reset();
  };

  const handleSkip = () => {
    onSkip();
    reset();
  };

  const reset = () => {
    setGuests([]);
  };

  const totalGuests = guests.length;
  const confirmLabel = totalGuests > 0
    ? `Confirm — bringing ${totalGuests}`
    : 'Just me';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleSkip}
    >
      <Pressable style={styles.backdrop} onPress={handleSkip}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Who's coming? 👨‍👩‍👧‍👦</Text>
            <Text style={styles.subtitle}>
              {maxGuests > 0
                ? `Add up to ${maxGuests} guests. Names are optional.`
                : `Let the host know who you're bringing`}
            </Text>

            {/* Guest list */}
            {guests.map((guest, index) => (
              <View key={index} style={styles.guestRow}>
                <TextInput
                  style={styles.guestInput}
                  value={guest.name}
                  onChangeText={(text) => updateGuestName(index, text)}
                  placeholder={`Guest ${index + 1} name (optional)`}
                  placeholderTextColor={COLORS.hint}
                  maxLength={40}
                />
                <Pressable
                  style={[styles.childChip, guest.isChild && styles.childChipActive]}
                  onPress={() => toggleChild(index)}
                >
                  <Text style={[styles.childChipText, guest.isChild && styles.childChipTextActive]}>
                    Child
                  </Text>
                </Pressable>
                <Pressable style={styles.removeBtn} onPress={() => removeGuest(index)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            ))}

            {/* Add guest button */}
            {(maxGuests === 0 || guests.length < maxGuests) && (
              <Pressable style={styles.addGuestBtn} onPress={addGuest}>
                <Text style={styles.addGuestText}>+ Add a guest</Text>
              </Pressable>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.confirmBtn, pressed && styles.btnPressed]}
                onPress={handleSubmit}
              >
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </Pressable>

              <Pressable style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl + 8,
    paddingTop: SPACING.md,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },

  // Guest rows
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  guestInput: {
    flex: 1,
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.white,
    fontSize: 15,
    ...FONTS.medium,
  },
  childChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
  },
  childChipActive: {
    backgroundColor: `${COLORS.teal}20`,
    borderColor: `${COLORS.teal}50`,
  },
  childChipText: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.medium,
  },
  childChipTextActive: {
    color: COLORS.teal,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 13, color: COLORS.muted },

  // Add guest button
  addGuestBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  addGuestText: { fontSize: 14, color: COLORS.gold, ...FONTS.medium },

  // Actions
  actions: { marginTop: SPACING.lg, gap: SPACING.sm },
  confirmBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  btnPressed: { transform: [{ scale: 0.97 }] },
  confirmText: { fontSize: 16, color: COLORS.dark, ...FONTS.bold },
  skipBtn: { paddingVertical: SPACING.md, alignItems: 'center' },
  skipText: { fontSize: 14, color: COLORS.muted, ...FONTS.medium },
});

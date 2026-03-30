import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

interface FamilyRegistrationProps {
  visible: boolean;
  onSubmit: (childrenCount: number) => void;
  onSkip: () => void;
}

const MAX_CHILDREN = 10;

export default function FamilyRegistration({
  visible,
  onSubmit,
  onSkip,
}: FamilyRegistrationProps) {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    if (count >= MAX_CHILDREN) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount(count + 1);
  };

  const handleDecrement = () => {
    if (count <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount(count - 1);
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(count);
    setCount(0);
  };

  const handleSkip = () => {
    onSkip();
    setCount(0);
  };

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

          <Text style={styles.title}>Bringing family? 👨‍👩‍👧‍👦</Text>
          <Text style={styles.subtitle}>
            Let the host know how many children you're bringing
          </Text>

          {/* Counter */}
          <View style={styles.counterRow}>
            <Pressable
              style={[styles.counterBtn, count <= 0 && styles.counterBtnDisabled]}
              onPress={handleDecrement}
              disabled={count <= 0}
            >
              <Text
                style={[
                  styles.counterBtnText,
                  count <= 0 && styles.counterBtnTextDisabled,
                ]}
              >
                −
              </Text>
            </Pressable>

            <View style={styles.countDisplay}>
              <Text style={styles.countNumber}>{count}</Text>
              <Text style={styles.countLabel}>
                {count === 1 ? 'child' : 'children'}
              </Text>
            </View>

            <Pressable
              style={[
                styles.counterBtn,
                count >= MAX_CHILDREN && styles.counterBtnDisabled,
              ]}
              onPress={handleIncrement}
              disabled={count >= MAX_CHILDREN}
            >
              <Text
                style={[
                  styles.counterBtnText,
                  count >= MAX_CHILDREN && styles.counterBtnTextDisabled,
                ]}
              >
                +
              </Text>
            </Pressable>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.confirmBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.confirmText}>
                {count > 0 ? `Confirm — ${count} ${count === 1 ? 'child' : 'children'}` : 'Just me'}
              </Text>
            </Pressable>

            <Pressable style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
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
    maxHeight: '80%',
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
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.3,
  },
  counterBtnText: {
    fontSize: 24,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  counterBtnTextDisabled: {
    color: COLORS.hint,
  },
  countDisplay: {
    alignItems: 'center',
    minWidth: 60,
  },
  countNumber: {
    fontSize: 36,
    color: COLORS.white,
    ...FONTS.bold,
  },
  countLabel: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.medium,
    marginTop: -2,
  },
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  confirmBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
  },
  confirmText: {
    fontSize: 16,
    color: COLORS.dark,
    ...FONTS.bold,
  },
  skipBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.medium,
  },
});

/**
 * EditorChrome — the top bar that sits above the live EventPreview inside
 * the creation editor (DAW-37). Two elements only:
 *
 *   - Back arrow (left): pops the editor back to the essentials sheet (or
 *     the tabs, depending on history). We leave the navigation decision to
 *     the screen that mounts us — the chrome just fires `onBack`.
 *
 *   - Publish pill (right): opens the publish tool sheet. Renders as a
 *     gold pill with "Publish" to keep it visually prominent. Disabled when
 *     essentials haven't been met.
 *
 * The chrome is rendered as the `topBar` slot of `EventPreview`, so it
 * inherits the event's theme text color naturally. We don't paint a
 * background — the chrome floats over the theme gradient.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';

export interface EditorChromeProps {
  onBack: () => void;
  onPublish: () => void;
  canPublish?: boolean;
  /** Text color to use for the Back label (passed by caller to match theme). */
  textColor?: string;
}

export default function EditorChrome({
  onBack,
  onPublish,
  canPublish = true,
  textColor = COLORS.white,
}: EditorChromeProps) {
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handlePublish = () => {
    if (!canPublish) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPublish();
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [styles.backHit, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text style={[styles.backLabel, { color: textColor }]}>← Back</Text>
      </Pressable>

      <Pressable
        onPress={handlePublish}
        disabled={!canPublish}
        style={({ pressed }) => [
          styles.publishPill,
          !canPublish && styles.publishPillDisabled,
          pressed && canPublish && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Publish event"
        accessibilityState={{ disabled: !canPublish }}
      >
        <Text
          style={[
            styles.publishLabel,
            !canPublish && styles.publishLabelDisabled,
          ]}
        >
          Publish
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  backHit: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.md,
  },
  backLabel: {
    fontSize: 16,
    ...FONTS.medium,
  },
  publishPill: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  publishPillDisabled: {
    backgroundColor: 'rgba(201,168,76,0.35)',
  },
  publishLabel: {
    color: COLORS.dark,
    fontSize: 15,
    ...FONTS.bold,
    letterSpacing: 0.2,
  },
  publishLabelDisabled: {
    color: 'rgba(13,13,13,0.5)',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});

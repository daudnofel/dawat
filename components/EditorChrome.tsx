/**
 * EditorChrome — top bar above the live EventPreview in the creation
 * editor. Two elements only:
 *
 *   - Back (left): circular liquid-glass button with a chevron. Pops the
 *     editor back to essentials / tabs. The chrome fires `onBack`; the
 *     screen that mounts us decides where to go.
 *
 *   - Publish pill (right): opens the publish tool sheet. Gold pill,
 *     disabled when essentials haven't been met.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';
import { GlassCircleButton } from './ui';

export interface EditorChromeProps {
  onBack: () => void;
  onPublish: () => void;
  canPublish?: boolean;
  /** Text color to use for the Back label — unused now that Back is a
   *  glass circle, kept in the signature for caller compat. */
  textColor?: string;
}

export default function EditorChrome({
  onBack,
  onPublish,
  canPublish = true,
}: EditorChromeProps) {
  const handlePublish = () => {
    if (!canPublish) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPublish();
  };

  return (
    <View style={styles.wrap}>
      <GlassCircleButton icon="back" onPress={onBack} />

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

/**
 * EffectGrid — reusable 3-column grid of the 9 ambient effects (DAW-54).
 *
 * Lifted out of the legacy `app/create/step-effect.tsx` so the effect tool
 * sheet can mount it without dragging wizard chrome (progress dots, CTA
 * bar, header nav). Pure `value` + `onChange` — the live preview of the
 * selected effect is handled by the editor canvas underneath the sheet,
 * not by this grid.
 *
 * Options include a "None" tile (id: null) because "no effect" is a
 * first-class, selectable choice.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';
import { EffectId } from '../types';

interface EffectOption {
  id: EffectId | null;
  label: string;
  emoji: string;
}

const EFFECTS: EffectOption[] = [
  { id: null, label: 'None', emoji: '—' },
  { id: 'rose-petals', label: 'Rose Petals', emoji: '🌹' },
  { id: 'lanterns', label: 'Lanterns', emoji: '🏮' },
  { id: 'gold-sparkles', label: 'Gold Sparkles', emoji: '✨' },
  { id: 'crescents', label: 'Crescents', emoji: '☪️' },
  { id: 'geometric-rays', label: 'Geometric', emoji: '◇' },
  { id: 'date-palms', label: 'Date Palms', emoji: '🌴' },
  { id: 'bubbles', label: 'Bubbles', emoji: '🫧' },
  { id: 'floating-dua', label: 'Dua', emoji: '🤲' },
];

// Width is computed against the tool sheet's horizontal padding
// (SPACING.xl on each side). `Math.floor - 1` leaves a pixel of breathing
// room so subpixel rounding can't knock the last column onto its own row.
const SCREEN_WIDTH = Dimensions.get('window').width;
const TILE_GAP = SPACING.sm;
const COLS = 3;
const TILE_WIDTH =
  Math.floor(
    (SCREEN_WIDTH - SPACING.xl * 2 - TILE_GAP * (COLS - 1)) / COLS,
  ) - 1;

export interface EffectGridProps {
  value: EffectId | null;
  onChange: (effect: EffectId | null) => void;
}

export default function EffectGrid({ value, onChange }: EffectGridProps) {
  const handleSelect = (effectId: EffectId | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(effectId);
  };

  return (
    <View style={styles.grid}>
      {EFFECTS.map((effect) => {
        const isSelected = effect.id === value;
        return (
          <Pressable
            key={effect.id ?? 'none'}
            onPress={() => handleSelect(effect.id)}
            style={({ pressed }) => [
              styles.tile,
              isSelected && styles.tileSelected,
              pressed && styles.tilePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={effect.label}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={styles.emoji}>{effect.emoji}</Text>
            <Text
              style={[
                styles.label,
                isSelected && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {effect.label}
            </Text>
            {isSelected && (
              <View style={styles.checkWrap}>
                <Text style={styles.check}>✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    gap: SPACING.sm,
  },
  tileSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201, 168, 76, 0.14)',
  },
  tilePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  emoji: { fontSize: 28 },
  label: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.semibold,
  },
  labelActive: { color: COLORS.gold },
  checkWrap: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: COLORS.dark,
    fontSize: 11,
    ...FONTS.bold,
    lineHeight: 13,
  },
});

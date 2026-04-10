import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';
import { EffectId } from '../../types';
import EventEffect from '../../components/EventEffect';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const TILE_GAP = SPACING.sm;
const COLS = 3;
const TILE_WIDTH = (SCREEN_WIDTH - SPACING.xl * 2 - TILE_GAP * (COLS - 1)) / COLS;

export default function StepEffect() {
  const { draft, updateDraft, nextStep, prevStep } = useEventStore();
  const selectedEffect = draft.effect_id as EffectId | null;

  const handleSelect = (effectId: EffectId | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateDraft({ effect_id: effectId });
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Live preview of the selected effect behind everything */}
      {selectedEffect && (
        <View style={styles.previewOverlay} pointerEvents="none">
          <EventEffect effectId={selectedEffect} />
        </View>
      )}

      <View style={styles.header}>
        <Pressable onPress={() => prevStep()} hitSlop={10}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.stepLabel}>Step 5 of 6</Text>
        <Pressable onPress={handleContinue} hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View
            key={s}
            style={[
              styles.dot,
              s <= 5 && styles.dotActive,
              s === 5 && styles.dotCurrent,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Add an effect</Text>
        <Text style={styles.subtitle}>
          A subtle ambient animation on your event page. Optional — "None" is always fine.
        </Text>

        <View style={styles.grid}>
          {EFFECTS.map((effect) => {
            const isSelected = effect.id === selectedEffect;
            return (
              <Pressable
                key={effect.id ?? 'none'}
                style={[styles.tile, isSelected && styles.tileSelected]}
                onPress={() => handleSelect(effect.id)}
              >
                <Text style={styles.tileEmoji}>{effect.emoji}</Text>
                <Text
                  style={[styles.tileLabel, isSelected && styles.tileLabelActive]}
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

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleContinue}
        >
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="ctaEffect" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFDFA1" />
                <Stop offset="0.5" stopColor="#E6C27A" />
                <Stop offset="1" stopColor="#FFDFA1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" rx={RADIUS.md} fill="url(#ctaEffect)" />
          </Svg>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },

  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    zIndex: 10,
  },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  skipText: { color: COLORS.muted, fontSize: 14, ...FONTS.medium },
  stepLabel: { color: COLORS.muted, fontSize: 13, ...FONTS.medium },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    zIndex: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.gold },
  dotCurrent: { width: 24 },

  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 32 },

  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.xs },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: SPACING.xl,
  },

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
    borderColor: '#FFDFA1',
    backgroundColor: 'rgba(255, 223, 161, 0.08)',
  },
  tileEmoji: { fontSize: 28 },
  tileLabel: { fontSize: 12, color: COLORS.muted, ...FONTS.semibold },
  tileLabelActive: { color: COLORS.gold },

  checkWrap: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFDFA1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#0D0D0D', fontSize: 11, ...FONTS.bold, lineHeight: 13 },

  bottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 223, 161, 0.10)',
    marginBottom: 90,
    zIndex: 10,
  },
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold, zIndex: 1 },
});

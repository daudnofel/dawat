/**
 * TitleStylePicker (DAW-56).
 *
 * Horizontal scroll of style cards. Each card renders the host's actual
 * event title in that font so the choice is immediately tangible — not a
 * static "Aa" placeholder. Selected card gets a gold border + subtle
 * checkmark. Haptic on every tap.
 *
 * Used inside `app/create/tools/title-style.tsx` via ToolSheet.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';
import {
  TITLE_STYLES,
  getTitleTextStyle,
  TitleStyleId,
} from '../lib/title-styles';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.68;
const CARD_HEIGHT = 140;

interface TitleStylePickerProps {
  /** The host's actual event title, rendered in each card. */
  title: string;
  /** Currently selected style ID. */
  selectedId: TitleStyleId | string | null;
  /** Fires when the host taps a style card. */
  onSelect: (id: TitleStyleId) => void;
}

export default function TitleStylePicker({
  title,
  selectedId,
  onSelect,
}: TitleStylePickerProps) {
  const displayTitle = title.trim() || 'Your Event Title';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + SPACING.md}
      snapToAlignment="start"
    >
      {TITLE_STYLES.map((style) => {
        const isSelected =
          (selectedId ?? 'classic') === style.id;
        const titleTextStyle = getTitleTextStyle(style.id);

        return (
          <Pressable
            key={style.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(style.id);
            }}
            style={({ pressed }) => [
              styles.card,
              isSelected && styles.cardSelected,
              pressed && styles.cardPressed,
            ]}
          >
            {/* Title preview */}
            <View style={styles.titleWrap}>
              <Text
                style={[
                  styles.previewText,
                  titleTextStyle,
                  // Cap the preview size for cards
                  { fontSize: Math.min(titleTextStyle.fontSize ?? 32, 26) },
                ]}
                numberOfLines={2}
              >
                {displayTitle}
              </Text>
            </View>

            {/* Label + vibe */}
            <View style={styles.labelRow}>
              <View style={styles.labelLeft}>
                <Text style={styles.labelText}>{style.label}</Text>
                <Text style={styles.vibeText}>{style.vibe}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkMark}>{'✓'}</Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    justifyContent: 'center',
  },
  previewText: {
    color: COLORS.white,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  labelLeft: {
    flex: 1,
  },
  labelText: {
    fontSize: 13,
    color: COLORS.gold,
    ...FONTS.semibold,
    letterSpacing: 0.3,
  },
  vibeText: {
    fontSize: 11,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 1,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 13,
    color: COLORS.dark,
    ...FONTS.bold,
    lineHeight: 15,
  },
});

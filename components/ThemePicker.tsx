import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AnimatedPress from './AnimatedPress';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { THEMES, THEME_CATEGORIES, getThemesByCategory } from '../lib/themes';
import { DawatTheme } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = SPACING.sm;
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.xl * 2 - CARD_GAP * 2) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface ThemePickerProps {
  selectedId: string;
  onSelect: (theme: DawatTheme) => void;
}

export default function ThemePicker({ selectedId, onSelect }: ThemePickerProps) {
  const [activeCategory, setActiveCategory] = useState('Trending');

  const filteredThemes = activeCategory === 'All'
    ? THEMES
    : getThemesByCategory(activeCategory);

  return (
    <View style={styles.container}>
      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {THEME_CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.pill, activeCategory === cat && styles.pillActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveCategory(cat);
            }}
          >
            <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Theme Grid */}
      <View style={styles.grid}>
        {filteredThemes.map((t) => {
          const isSelected = t.id === selectedId;
          return (
            <AnimatedPress
              key={t.id}
              style={[
                styles.card,
                { backgroundColor: t.bannerBg },
                isSelected && styles.cardSelected,
              ]}
              scaleValue={0.95}
              onPress={() => onSelect(t)}
            >
              <Text style={styles.cardEmoji}>{t.defaultEmoji}</Text>
              <Text style={[styles.cardName, { color: t.textColor }]} numberOfLines={1}>
                {t.name}
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </AnimatedPress>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillRow: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  pillText: {
    color: COLORS.muted,
    fontSize: 13,
    ...FONTS.medium,
  },
  pillTextActive: {
    color: COLORS.dark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.xl,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: COLORS.gold,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  cardName: {
    fontSize: 11,
    ...FONTS.semibold,
    textAlign: 'center',
    paddingHorizontal: SPACING.xs,
  },
  checkBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: COLORS.dark,
    fontSize: 13,
    ...FONTS.bold,
  },
});

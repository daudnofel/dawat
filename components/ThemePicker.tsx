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

      {/* Theme Grid — uniform dark glass */}
      <View style={styles.grid}>
        {filteredThemes.map((t) => {
          const isSelected = t.id === selectedId;
          return (
            <AnimatedPress
              key={t.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
              scaleValue={0.95}
              onPress={() => onSelect(t)}
            >
              {/* Golden glow behind selected card */}
              {isSelected && <View style={styles.selectedGlow} />}
              <Text style={styles.cardEmoji}>{t.defaultEmoji}</Text>
              <Text style={styles.cardName} numberOfLines={1}>
                {t.name}
              </Text>
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
    backgroundColor: 'rgba(53, 53, 52, 0.30)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: `${COLORS.gold}25`,
    borderColor: `${COLORS.gold}50`,
  },
  pillText: {
    color: COLORS.muted,
    fontSize: 13,
    ...FONTS.medium,
  },
  pillTextActive: {
    color: COLORS.gold,
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
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    // Subtle glass edge glow — unselected
    shadowColor: 'rgba(255, 255, 255, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 223, 161, 0.40)',
    // Bright golden glow — selected
    shadowColor: '#FFDFA1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 223, 161, 0.05)',
    borderRadius: RADIUS.lg,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  cardName: {
    fontSize: 11,
    color: COLORS.white,
    ...FONTS.semibold,
    textAlign: 'center',
    paddingHorizontal: SPACING.xs,
  },
});

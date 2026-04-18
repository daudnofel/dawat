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
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import AnimatedPress from './AnimatedPress';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { THEMES, THEME_CATEGORIES, getThemesByCategory } from '../lib/themes';
import { DawatTheme } from '../types';

// ─── Sizing ──────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = SPACING.sm;
const CARD_WIDTH =
  Math.floor((SCREEN_WIDTH - SPACING.xl * 2 - CARD_GAP) / 2) - 1;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.25);

// ─── ThemeCategoryPills — exported for use in the ToolSheet subheader ──

interface PillsProps {
  activeCategory: string;
  onChange: (category: string) => void;
}

export function ThemeCategoryPills({ activeCategory, onChange }: PillsProps) {
  return (
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
            onChange(cat);
          }}
        >
          <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
            {cat}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── ThemePicker — the grid. Category state can be lifted to parent ──

interface ThemePickerProps {
  selectedId: string;
  onSelect: (theme: DawatTheme) => void;
  /** Lift state to parent if you want the pills rendered elsewhere. */
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  /** Render the pills inline above the grid (default: true). Set false
   *  when parent renders the pills itself (e.g. as a ToolSheet subheader). */
  showPills?: boolean;
}

export default function ThemePicker({
  selectedId,
  onSelect,
  activeCategory: externalActive,
  onCategoryChange,
  showPills = true,
}: ThemePickerProps) {
  const [internalActive, setInternalActive] = useState('Trending');

  const activeCategory = externalActive ?? internalActive;
  const setActiveCategory = onCategoryChange ?? setInternalActive;

  const filteredThemes = activeCategory === 'All'
    ? THEMES
    : getThemesByCategory(activeCategory);

  return (
    <View style={styles.container}>
      {showPills && (
        <ThemeCategoryPills
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      )}

      <View style={styles.grid}>
        {filteredThemes.map((t) => (
          <ThemeTile
            key={t.id}
            theme={t}
            selected={t.id === selectedId}
            onPress={() => onSelect(t)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Tile ────────────────────────────────────────────────────

interface ThemeTileProps {
  theme: DawatTheme;
  selected: boolean;
  onPress: () => void;
}

function ThemeTile({ theme, selected, onPress }: ThemeTileProps) {
  const stops = theme.background?.stops ?? [theme.bannerBg, theme.bannerBg];
  const primary = theme.accents?.primary ?? theme.accentColor;
  const onAccent = theme.accents?.onAccent ?? '#FFFFFF';
  const titleColor = theme.textColor;

  const gradId = `themeTile_${theme.id}`;

  return (
    <AnimatedPress
      style={[styles.tile, selected && styles.tileSelected]}
      scaleValue={0.96}
      onPress={onPress}
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            {stops.map((stop, i) => (
              <Stop
                key={`${gradId}-${i}`}
                offset={stops.length === 1 ? '0' : (i / (stops.length - 1)).toString()}
                stopColor={stop}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>

      <View style={styles.tileContent}>
        <Text
          style={[styles.tileName, { color: titleColor }]}
          numberOfLines={2}
        >
          {theme.name}
        </Text>
        <View style={[styles.accentPill, { backgroundColor: primary }]}>
          <View style={[styles.accentDot, { backgroundColor: onAccent }]} />
        </View>
      </View>

      {selected && (
        <>
          <View style={styles.selectedBorder} pointerEvents="none" />
          <View style={styles.checkWrap} pointerEvents="none">
            <Text style={styles.check}>✓</Text>
          </View>
        </>
      )}
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  pillRow: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
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
  pillText: { color: COLORS.muted, fontSize: 13, ...FONTS.medium },
  pillTextActive: { color: COLORS.gold },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },

  tile: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  tileSelected: {},
  tileContent: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  tileEmoji: {
    fontSize: 36,
    alignSelf: 'flex-end',
  },
  tileName: {
    fontSize: 16,
    ...FONTS.bold,
    letterSpacing: -0.2,
  },
  accentPill: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 28,
    height: 6,
    borderRadius: 3,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 2,
  },
  accentDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },

  selectedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.lg,
    borderWidth: 2.5,
    borderColor: '#FFDFA1',
  },
  checkWrap: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFDFA1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#0D0D0D',
    fontSize: 14,
    ...FONTS.bold,
    lineHeight: 16,
  },
});

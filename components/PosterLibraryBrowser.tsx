import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { PosterLibraryItem } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = SPACING.sm;
const COLS = 3;
const TILE_WIDTH = (SCREEN_WIDTH - SPACING.xl * 2 - GRID_GAP * (COLS - 1)) / COLS;
const TILE_HEIGHT = TILE_WIDTH; // 1:1 square

const BUCKET_BASE = 'https://gwjhsbadranzzculpitm.supabase.co/storage/v1/object/public/poster-library';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  eid: 'Eid',
  ramadan: 'Ramadan',
  iftar: 'Iftar',
  nikkah: 'Nikkah',
  walima: 'Walima',
  halaqa: 'Halaqa',
  jummah: "Jumu'ah",
  fundraiser: 'Fundraiser',
  community: 'Community',
  mehndi: 'Mehndi',
};

interface PosterLibraryBrowserProps {
  selectedId: string | null;
  onSelect: (item: PosterLibraryItem) => void;
}

export default function PosterLibraryBrowser({ selectedId, onSelect }: PosterLibraryBrowserProps) {
  const [items, setItems] = useState<PosterLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('poster_library')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setItems((data as PosterLibraryItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category));
    return ['all', ...Array.from(cats).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.gold} size="small" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.pill, activeCategory === cat && styles.pillActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveCategory(cat);
            }}
          >
            <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
              {CATEGORY_LABELS[cat] ?? cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Poster grid */}
      <View style={styles.grid}>
        {filtered.map((item) => {
          const isSelected = item.id === selectedId;
          const thumbUrl = `${BUCKET_BASE}/${item.thumbnail_path}`;
          return (
            <Pressable
              key={item.id}
              style={[styles.tile, isSelected && styles.tileSelected]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(item);
              }}
            >
              <Image
                source={{ uri: thumbUrl }}
                style={styles.tileImage}
                resizeMode="cover"
              />
              {isSelected && (
                <View style={styles.checkWrap}>
                  <Text style={styles.check}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {filtered.length === 0 && (
        <Text style={styles.empty}>No posters in this category yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { paddingVertical: SPACING.xxl, alignItems: 'center' },

  pillRow: {
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
  pillText: { color: COLORS.muted, fontSize: 13, ...FONTS.medium },
  pillTextActive: { color: COLORS.gold },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  tileSelected: {
    borderColor: '#FFDFA1',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  checkWrap: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFDFA1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#0D0D0D',
    fontSize: 12,
    ...FONTS.bold,
    lineHeight: 14,
  },
  empty: {
    color: COLORS.muted,
    fontSize: 14,
    ...FONTS.regular,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
});

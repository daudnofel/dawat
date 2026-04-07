import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { FeaturedCollection } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.65;
const CARD_HEIGHT = 160;

interface CollectionWithCount extends FeaturedCollection {
  event_count: number;
  preview_emoji: string;
}

// Compute events for "smart" collections by name. For truly hand-curated
// collections, we'd query featured_collection_events join table instead.
async function getEventCountForCollection(collectionName: string): Promise<number> {
  const now = new Date().toISOString();
  const oneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  if (collectionName === 'Happening this week') {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .gte('date_time', now)
      .lte('date_time', oneWeek);
    return count ?? 0;
  }

  if (collectionName === 'Just announced') {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('is_cancelled', false);
    return count ?? 0;
  }

  if (collectionName === 'Most popular') {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('is_cancelled', false);
    return count ?? 0;
  }

  // Hand-curated collection: count from join table
  return 0;
}

const COLLECTION_GRADIENTS: Record<string, [string, string]> = {
  'Happening this week': ['#0A1628', '#2A1F0A'],
  'Most popular':        ['#1A0F1F', '#3A1A0F'],
  'Just announced':      ['#0F1A2A', '#1A2A0F'],
};

const COLLECTION_EMOJIS: Record<string, string> = {
  'Happening this week': '🗓',
  'Most popular':        '🔥',
  'Just announced':      '✨',
};

export default function HomeFeaturedCollections() {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionWithCount[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('featured_collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (!data) return;

      const withCounts = await Promise.all(
        data.map(async (c) => ({
          ...(c as FeaturedCollection),
          event_count: await getEventCountForCollection(c.name),
          preview_emoji: COLLECTION_EMOJIS[c.name] ?? '🌙',
        })),
      );

      setCollections(withCounts.filter((c) => c.event_count > 0));
    })();
  }, []);

  const handlePress = (collection: CollectionWithCount) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // For now, route to Discover tab — future ticket: dedicated collection page
    router.navigate('/(tabs)/trending');
  };

  if (collections.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + SPACING.md}
    >
      {collections.map((collection) => {
        const [grad1, grad2] = COLLECTION_GRADIENTS[collection.name] ?? ['#1A1A1A', '#0D0D0D'];
        return (
          <Pressable
            key={collection.id}
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => handlePress(collection)}
          >
            <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
              <Defs>
                <SvgLinearGradient id={`fc-${collection.id}`} x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={grad1} />
                  <Stop offset="1" stopColor={grad2} />
                </SvgLinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#fc-${collection.id})`} />
            </Svg>
            <View style={styles.cardContent}>
              <Text style={styles.emoji}>{collection.preview_emoji}</Text>
              <Text style={styles.name}>{collection.name}</Text>
              <Text style={styles.subtitle}>
                {collection.event_count} {collection.event_count === 1 ? 'event' : 'events'}
              </Text>
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'space-between',
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.2,
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.medium,
    marginTop: 2,
  },
  arrow: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.xl,
  },
  arrowText: {
    fontSize: 28,
    color: COLORS.white,
    opacity: 0.7,
    ...FONTS.regular,
  },
});

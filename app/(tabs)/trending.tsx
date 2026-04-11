// app/(tabs)/trending.tsx
// Discover screen shell. Owns the feed hook, filter state, search state, and
// view mode (list vs calendar). Delegates actual rendering to DiscoverListView
// and DiscoverCalendarView so this file stays thin and reviewable.

import { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import EmptyState from '../../components/EmptyState';
import DiscoverAtmosphere from '../../components/DiscoverAtmosphere';
import DiscoverFilterBar from '../../components/DiscoverFilterBar';
import DiscoverViewToggle, {
  DiscoverViewMode,
} from '../../components/DiscoverViewToggle';
import DiscoverListView, {
  renderEventCard,
} from '../../components/DiscoverListView';
import DiscoverCalendarView from '../../components/DiscoverCalendarView';
import {
  useDiscoverFeed,
  DiscoverEvent,
  DiscoverFilter,
} from '../../lib/hooks/useDiscoverFeed';

// ─── Screen ───────────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const [viewMode, setViewMode] = useState<DiscoverViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiscoverEvent[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<DiscoverFilter>({});

  const { tonight, thisWeek, popular, byDate, loading, error, refresh } =
    useDiscoverFeed(filter);

  // Cross-fade + small translate-Y on mode change
  const fade = useSharedValue(1);
  useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [viewMode]);
  const viewStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: (1 - fade.value) * 6 }],
  }));

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    const { data } = await supabase
      .from('events')
      .select(
        'id, title, theme_id, poster_url, description, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status, children_count, plus_one_names)'
      )
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .or(`title.ilike.%${query}%,location_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    const results: DiscoverEvent[] = (data ?? []).map((e: any) => ({
      ...e,
      going: (e.rsvps ?? []).filter(
        (r: any) => r.status === 'yes' || r.status === 'inshallah'
      ).length,
      attendees: [],
    }));
    setSearchResults(results);
    setSearching(false);
  };

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
  }, []);

  const clearFilter = useCallback(() => setFilter({}), []);

  return (
    <View style={styles.container}>
      <DiscoverAtmosphere />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Title row + mode toggle */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Discover</Text>
          <DiscoverViewToggle mode={viewMode} onChange={setViewMode} />
        </View>

        {/* Search Bar — glass style */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search events or locations..."
            placeholderTextColor={COLORS.hint}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Filter chip bar — hidden during active search */}
        {searchResults === null && (
          <View style={styles.filterBarWrap}>
            <DiscoverFilterBar filter={filter} onChange={setFilter} />
          </View>
        )}

        {searchResults !== null ? (
          // ─── Search results short-circuit (overrides both modes) ───
          <FlashList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderEventCard(item)}
            estimatedItemSize={180}
            contentContainerStyle={styles.searchListContent}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <Text style={styles.searchHeader}>
                Results for "{searchQuery}" ({searchResults.length})
              </Text>
            }
            ListEmptyComponent={
              !searching ? (
                <EmptyState
                  emoji="🔍"
                  title="No events found"
                  subtitle="Try a different search term"
                />
              ) : null
            }
          />
        ) : (
          // ─── Mode-aware view (List or Calendar) ────────────────────
          <Animated.View style={[styles.viewWrap, viewStyle]}>
            {viewMode === 'list' ? (
              <DiscoverListView
                tonight={tonight}
                thisWeek={thisWeek}
                popular={popular}
                byDate={byDate}
                loading={loading}
                error={error}
                refresh={refresh}
                filter={filter}
                onClearFilter={clearFilter}
              />
            ) : (
              <DiscoverCalendarView
                byDate={byDate}
                loading={loading}
                error={error}
                refresh={refresh}
                filter={filter}
              />
            )}
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  safeArea: { flex: 1 },

  // Header row with title + toggle
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.8,
  },

  // Search — glass input
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingRight: 40,
    color: COLORS.white,
    fontSize: 15,
    ...FONTS.medium,
  },
  clearButton: {
    position: 'absolute',
    right: SPACING.xl + SPACING.md,
    top: 0,
    bottom: SPACING.md,
    justifyContent: 'center',
  },
  clearText: {
    color: COLORS.muted,
    fontSize: 16,
  },

  filterBarWrap: {
    paddingBottom: SPACING.sm,
  },

  viewWrap: { flex: 1 },

  // Search results path
  searchListContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
  searchHeader: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
});

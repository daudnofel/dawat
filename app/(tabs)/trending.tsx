import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import EventCard from '../../components/EventCard';
import HomeSection from '../../components/HomeSection';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';
import DiscoverFilterBar from '../../components/DiscoverFilterBar';
import TonightFeaturedGrid from '../../components/TonightFeaturedGrid';
import DateGroupedSection from '../../components/DateGroupedSection';
import {
  useDiscoverFeed,
  DiscoverEvent,
  DateGroup,
  DiscoverFilter,
} from '../../lib/hooks/useDiscoverFeed';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Section model ────────────────────────────────────────────────────
type Section =
  | { type: 'tonight'; data: DiscoverEvent[] }
  | { type: 'thisWeek'; data: DiscoverEvent[] }
  | { type: 'byDate'; data: DateGroup[] }
  | { type: 'popular'; data: DiscoverEvent[] };

// ─── Card renderer (shared by every section + search results) ────────
function renderEventCard(event: DiscoverEvent) {
  const rsvps = event.rsvps ?? [];
  const yesRsvps = rsvps.filter((r) => r.status === 'yes');
  const yesCount = yesRsvps.reduce(
    (sum, r) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0),
    0
  );
  const inshallahCount = rsvps.filter((r) => r.status === 'inshallah').length;
  return (
    <EventCard
      key={event.id}
      id={event.id}
      title={event.title}
      theme_id={event.theme_id}
      poster_url={event.poster_url}
      description={event.description}
      variant="horizontal"
      org_name="Community Event"
      host_name="Community Event"
      date_label={
        event.date_time
          ? new Date(event.date_time).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'Date TBD'
      }
      location_name={event.location_name ?? 'Location TBD'}
      price={event.price}
      gender_mode={event.gender_mode}
      is_halal_venue={event.is_halal_venue}
      yes_count={yesCount}
      inshallah_count={inshallahCount}
      capacity={event.capacity}
      attendee_avatar_urls={event.attendees.map((a) => a.avatarUrl)}
    />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiscoverEvent[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<DiscoverFilter>({});

  const filterActive = !!(filter.time || filter.category || filter.audience);

  const { tonight, thisWeek, popular, byDate, loading, error, refresh } =
    useDiscoverFeed(filter);

  // Build sections list for the FlashList
  const sections: Section[] = [];
  if (tonight.length) sections.push({ type: 'tonight', data: tonight });
  if (thisWeek.length) sections.push({ type: 'thisWeek', data: thisWeek });
  if (byDate.length) sections.push({ type: 'byDate', data: byDate });
  if (popular.length) sections.push({ type: 'popular', data: popular });

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
    }));
    setSearchResults(results);
    setSearching(false);
  };

  const onRefresh = useCallback(async () => {
    setSearchResults(null);
    setSearchQuery('');
    await refresh();
  }, [refresh]);

  // ─── Section renderer ────────────────────────────────────────────
  const renderSection = useCallback(({ item }: { item: Section }) => {
    switch (item.type) {
      case 'tonight':
        return (
          <View style={styles.tonightSection}>
            <View style={styles.tonightHeader}>
              <Text style={styles.tonightTitle}>Tonight ✨</Text>
              <Text style={styles.tonightSubtitle}>Happening today</Text>
            </View>
            <TonightFeaturedGrid events={item.data} />
          </View>
        );
      case 'thisWeek':
        return (
          <HomeSection title="This Week" subtitle="Coming up in the next 7 days">
            {item.data.map(renderEventCard)}
          </HomeSection>
        );
      case 'byDate':
        return (
          <View style={styles.byDateSection}>
            <View style={styles.byDateHeader}>
              <Text style={styles.byDateTitle}>All upcoming</Text>
              <Text style={styles.byDateSubtitle}>Browse by day</Text>
            </View>
            <DateGroupedSection groups={item.data} renderEvent={renderEventCard} />
          </View>
        );
      case 'popular':
        return (
          <HomeSection title="Popular 🔥" subtitle="Most RSVPs this week">
            {item.data.map(renderEventCard)}
          </HomeSection>
        );
    }
  }, []);

  // ─── Header (renders inside FlashList ListHeaderComponent) ───────
  const renderHeader = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.headerContent}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.headerContent}>
          <EmptyState
            emoji="⚠️"
            title="Couldn't load Discover"
            subtitle={error}
          />
        </View>
      );
    }

    if (sections.length === 0) {
      if (filterActive) {
        return (
          <View style={styles.headerContent}>
            <EmptyState
              emoji="🪄"
              title="No events match these filters"
              subtitle="Try clearing a filter or two"
            />
            <Pressable
              onPress={() => setFilter({})}
              style={({ pressed }) => [
                styles.clearFiltersBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </Pressable>
          </View>
        );
      }
      return (
        <View style={styles.headerContent}>
          <EmptyState
            emoji="🌙"
            title="No events to discover"
            subtitle="Create the first event for your community"
          />
        </View>
      );
    }

    return null;
  }, [loading, error, sections.length, filterActive]);

  return (
    <View style={styles.container}>
      {/* Golden atmospheric glow */}
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={420} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="discoverGlow" cx="50%" cy="0%" rx="80%" ry="90%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.18" />
              <Stop offset="0.35" stopColor="#E6C27A" stopOpacity="0.08" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={420} fill="url(#discoverGlow)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
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
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
            >
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
          // ─── Search results path ─────────────────────────────────
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
          // ─── Sectioned discovery feed ────────────────────────────
          <FlashList
            data={sections}
            keyExtractor={(item) => item.type}
            renderItem={renderSection}
            getItemType={(item) => item.type}
            estimatedItemSize={400}
            contentContainerStyle={styles.feedListContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  safeArea: { flex: 1 },

  // Atmosphere
  atmosphereLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  header: {
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

  // Lists
  feedListContent: { paddingBottom: 120 },
  searchListContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },

  headerContent: {
    paddingHorizontal: SPACING.xl,
  },

  // byDate section custom header (DateGroupedSection manages its own padding)
  byDateSection: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  byDateHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  byDateTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.3,
  },
  byDateSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 2,
  },

  searchHeader: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },

  filterBarWrap: {
    paddingBottom: SPACING.sm,
  },

  // Tonight section — custom header (grid manages its own padding)
  tonightSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  tonightHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  tonightTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.3,
  },
  tonightSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 2,
  },

  clearFiltersBtn: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.55)',
    backgroundColor: 'rgba(201, 168, 76, 0.18)',
  },
  clearFiltersText: {
    color: COLORS.gold2,
    fontSize: 14,
    ...FONTS.bold,
  },
});

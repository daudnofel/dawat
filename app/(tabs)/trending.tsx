import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getThemeById } from '../../lib/themes';
import { GenderMode } from '../../types';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';

interface DiscoverEvent {
  id: string;
  title: string;
  theme_id: string;
  gender_mode: GenderMode;
  is_halal_venue: boolean;
  price: number;
  capacity: number | null;
  date_time: string | null;
  location_name: string | null;
  host_id: string;
  slug: string;
  rsvps: { status: string }[] | null;
  going: number;
}

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [happeningSoon, setHappeningSoon] = useState<DiscoverEvent[]>([]);
  const [popular, setPopular] = useState<DiscoverEvent[]>([]);
  const [searchResults, setSearchResults] = useState<DiscoverEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchDiscover = useCallback(async () => {
    const now = new Date().toISOString();
    const oneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Happening Soon — events in the next 7 days
    const { data: soonData } = await supabase
      .from('events')
      .select('id, title, theme_id, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status)')
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .gte('date_time', now)
      .lte('date_time', oneWeek)
      .order('date_time', { ascending: true })
      .limit(10);

    const soonWithCounts = (soonData ?? []).map((e: any) => ({
      ...e,
      going: (e.rsvps ?? []).filter((r: any) => r.status === 'yes' || r.status === 'inshallah').length,
    }));
    setHappeningSoon(soonWithCounts);

    // Popular — all upcoming events sorted by RSVP count
    const { data: popData } = await supabase
      .from('events')
      .select('id, title, theme_id, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status)')
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .order('created_at', { ascending: false })
      .limit(20);

    const popWithCounts = (popData ?? [])
      .map((e: any) => ({
        ...e,
        going: (e.rsvps ?? []).filter((r: any) => r.status === 'yes' || r.status === 'inshallah').length,
      }))
      .sort((a: any, b: any) => b.going - a.going)
      .slice(0, 10);
    setPopular(popWithCounts);

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading) fetchDiscover();
    }, [fetchDiscover]),
  );

  // Initial load
  useState(() => { fetchDiscover(); });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    const { data } = await supabase
      .from('events')
      .select('id, title, theme_id, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status)')
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .or(`title.ilike.%${query}%,location_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    const results = (data ?? []).map((e: any) => ({
      ...e,
      going: (e.rsvps ?? []).filter((r: any) => r.status === 'yes' || r.status === 'inshallah').length,
    }));
    setSearchResults(results);
    setSearching(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchResults(null);
    setSearchQuery('');
    fetchDiscover();
  };

  const renderEventCard = (event: DiscoverEvent) => {
    const rsvps = event.rsvps ?? [];
    const yesCount = rsvps.filter((r) => r.status === 'yes').length;
    const inshallahCount = rsvps.filter((r) => r.status === 'inshallah').length;
    return (
      <EventCard
        key={event.id}
        id={event.id}
        title={event.title}
        theme_id={event.theme_id}
        org_name="Community Event"
        date_label={event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Date TBD'}
        location_name={event.location_name ?? 'Location TBD'}
        price={event.price}
        gender_mode={event.gender_mode}
        is_halal_venue={event.is_halal_venue}
        yes_count={yesCount}
        inshallah_count={inshallahCount}
        capacity={event.capacity}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      {/* Search Bar */}
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
            onPress={() => { setSearchQuery(''); setSearchResults(null); }}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      >
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Search Results */}
        {searchResults !== null && !loading && (
          <>
            <Text style={styles.sectionTitle}>
              Results for "{searchQuery}" ({searchResults.length})
            </Text>
            {searchResults.length === 0 ? (
              <EmptyState emoji="🔍" title="No events found" subtitle={`Try a different search term`} />
            ) : (
              searchResults.map(renderEventCard)
            )}
          </>
        )}

        {/* Browse Sections (shown when not searching) */}
        {searchResults === null && !loading && (
          <>
            {/* Happening Soon */}
            {happeningSoon.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Happening Soon 🗓</Text>
                <Text style={styles.sectionSubtitle}>Events in the next 7 days</Text>
                {happeningSoon.map(renderEventCard)}
              </>
            )}

            {/* Popular */}
            {popular.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Popular 🔥</Text>
                <Text style={styles.sectionSubtitle}>Most RSVPs</Text>
                {popular.map(renderEventCard)}
              </>
            )}

            {happeningSoon.length === 0 && popular.length === 0 && (
              <EmptyState
                emoji="🌙"
                title="No events to discover"
                subtitle="Create the first event for your community"
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: SPACING.lg,
  },
});

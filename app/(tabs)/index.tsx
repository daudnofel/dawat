import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { GenderMode } from '../../types';
import { useFeedStore } from '../../store/useFeedStore';
import { supabase } from '../../lib/supabase';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';

const FILTER_TABS = [
  { label: 'All Events', value: 'all' as const },
  { label: 'Brothers', value: GenderMode.BrothersOnly },
  { label: 'Sisters', value: GenderMode.SistersOnly },
  { label: 'Family', value: GenderMode.Family },
];

interface FeedEvent {
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
}

export default function HomeScreen() {
  const { activeFilter, setFilter } = useFeedStore();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    let query = supabase
      .from('events')
      .select('id, title, theme_id, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status)')
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (activeFilter !== 'all') {
      query = query.in('gender_mode', [activeFilter, 'mixed']);
    }

    const { data, error } = await query;

    if (error) {
      console.log('Feed error:', error.message);
    }
    if (data) {
      setEvents(data as FeedEvent[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [activeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Get RSVP counts (simplified — counts from rsvps table)
  // For now we show 0 since events are newly created

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandArabic}>دعوت</Text>
          <Text style={styles.brandEnglish}>DAWAT</Text>
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <Pressable
                key={tab.value}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(tab.value); }}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
        }
      >
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && events.map((event) => {
          const rsvps = event.rsvps ?? [];
          const yesCount = rsvps.filter((r) => r.status === 'yes').length;
          const inshallahCount = rsvps.filter((r) => r.status === 'inshallah').length;
          return (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              theme_id={event.theme_id}
              org_name="Personal Event"
              date_label={event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Date TBD'}
              location_name={event.location_name ?? 'Location TBD'}
              price={event.price}
              gender_mode={event.gender_mode as GenderMode}
              is_halal_venue={event.is_halal_venue}
              yes_count={yesCount}
              inshallah_count={inshallahCount}
              capacity={event.capacity}
            />
          );
        })}

        {!loading && events.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySubtitle}>Create the first event for your community</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  brandArabic: { fontSize: 22, color: COLORS.gold, ...FONTS.bold },
  brandEnglish: { fontSize: 18, color: COLORS.white, ...FONTS.bold, letterSpacing: 3 },
  filterWrapper: { height: 44 },
  filterRow: { paddingHorizontal: SPACING.xl, gap: SPACING.sm, alignItems: 'center', height: 44 },
  filterPill: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  filterPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterText: { fontSize: 13, color: COLORS.muted, ...FONTS.medium },
  filterTextActive: { color: COLORS.dark },
  feed: { flex: 1 },
  feedContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 18, color: COLORS.white, ...FONTS.semibold, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular },
});

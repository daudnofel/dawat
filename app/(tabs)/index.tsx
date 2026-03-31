import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { GenderMode } from '../../types';
import { useFeedStore } from '../../store/useFeedStore';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/auth-cache';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const router = useRouter();
  const { activeFilter, setFilter } = useFeedStore();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchEvents = useCallback(async () => {
    let query = supabase
      .from('events')
      .select('id, title, theme_id, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status)')
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (activeFilter !== 'all') {
      query = query.eq('gender_mode', activeFilter);
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

  const fetchUnreadCount = useCallback(async () => {
    let userId = await getCurrentUserId();
    if (!userId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      } catch { userId = null; }
    }
    if (!userId) return;

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    setUnreadCount(count ?? 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      fetchUnreadCount();
    }, [fetchEvents, fetchUnreadCount]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  return (
    <View style={styles.container}>
      {/* Golden atmospheric glow — soft radial wash from top center */}
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={400} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="atmosphere" cx="50%" cy="0%" rx="70%" ry="80%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.18" />
              <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.08" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={400} fill="url(#atmosphere)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Logo — DAWAT | دعوت  centered, editorial */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brandEnglish}>DAWAT</Text>
            <Text style={styles.brandPipe}>|</Text>
            <Text style={styles.brandArabic}>دعوت</Text>
          </View>
          <Pressable
            style={styles.bellButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/notifications'); }}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Filter pills */}
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
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(tab.value); }}
                >
                  <View style={[styles.filterPill, isActive && styles.filterPillActive]}>
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{tab.label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Feed */}
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
            <EmptyState emoji="🌙" title="No events yet" subtitle="Create the first event for your community" />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  safeArea: {
    flex: 1,
  },

  // Golden atmospheric glow
  atmosphereLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  // Logo — Manrope Light, editorial
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandEnglish: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: 'ManropeLight',
    letterSpacing: 4,
  },
  brandPipe: {
    fontSize: 28,
    color: COLORS.muted,
    fontFamily: 'ManropeLight',
    marginHorizontal: SPACING.md,
    opacity: 0.4,
  },
  brandArabic: {
    fontSize: 28,
    color: COLORS.gold,
    fontWeight: '300',
  },
  bellButton: {
    position: 'absolute',
    right: SPACING.xl,
    padding: SPACING.sm,
  },
  bellIcon: { fontSize: 22 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, color: '#FFFFFF', ...FONTS.bold },

  // Filters
  filterWrapper: { height: 48 },
  filterRow: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    alignItems: 'center',
    height: 48,
  },
  filterPill: {
    paddingHorizontal: SPACING.lg + 2,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.surfaceVariant}30`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.ghostBorder,
  },
  filterPillActive: {
    backgroundColor: `${COLORS.gold}25`,
    borderColor: `${COLORS.gold}50`,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.medium,
  },
  filterTextActive: {
    fontSize: 14,
    color: COLORS.gold,
    ...FONTS.medium,
  },

  // Feed
  feed: { flex: 1 },
  feedContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 100,
  },
});

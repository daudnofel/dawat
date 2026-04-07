import { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { GenderMode } from '../../types';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/auth-cache';
import { getRecentlyViewed } from '../../lib/recently-viewed';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';
import HomeSection from '../../components/HomeSection';
import HomeChipPrompts from '../../components/HomeChipPrompts';
import HomeThemeCarousel from '../../components/HomeThemeCarousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  rsvps: { status: string; children_count: number; plus_one_names: string[] }[] | null;
}

export default function HomeScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [discoverEvents, setDiscoverEvents] = useState<FeedEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<FeedEvent[]>([]);
  const [pendingInvite, setPendingInvite] = useState<FeedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch greeting name from cached user
  const fetchProfile = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    const { data } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', userId)
      .single();
    if (data?.display_name) setDisplayName(data.display_name.split(' ')[0]); // first name
  }, []);

  // Fetch discover events (public, recent)
  const fetchDiscover = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('id, title, theme_id, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status, children_count, plus_one_names)')
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setDiscoverEvents(data as FeedEvent[]);
  }, []);

  // Fetch recently viewed events from AsyncStorage + DB
  const fetchRecentlyViewed = useCallback(async () => {
    const ids = await getRecentlyViewed();
    if (ids.length === 0) {
      setRecentEvents([]);
      return;
    }
    const { data } = await supabase
      .from('events')
      .select('id, title, theme_id, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status, children_count, plus_one_names)')
      .in('id', ids)
      .eq('is_cancelled', false);
    if (data) {
      // Preserve original order from AsyncStorage
      const ordered = ids
        .map((id) => data.find((e: any) => e.id === id))
        .filter(Boolean) as FeedEvent[];
      setRecentEvents(ordered.slice(0, 5));
    }
  }, []);

  // Phase 2 placeholder: most recent event the user RSVPd to (treat as "new invite")
  const fetchPendingInvite = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('event_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (rsvps && rsvps.length > 0) {
      const { data: ev } = await supabase
        .from('events')
        .select('id, title, theme_id, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status, children_count, plus_one_names)')
        .eq('id', rsvps[0].event_id)
        .eq('is_cancelled', false)
        .single();
      if (ev) setPendingInvite(ev as FeedEvent);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    setUnreadCount(count ?? 0);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([
      fetchProfile(),
      fetchDiscover(),
      fetchRecentlyViewed(),
      fetchPendingInvite(),
    ]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchProfile, fetchDiscover, fetchRecentlyViewed, fetchPendingInvite]);

  useEffect(() => {
    loadAll();
  }, []);

  // Light refresh on focus: badge count + recently viewed (cheap)
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      fetchRecentlyViewed();
    }, [fetchUnreadCount, fetchRecentlyViewed]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const renderEventCard = (event: FeedEvent) => {
    const rsvps = event.rsvps ?? [];
    const yesRsvps = rsvps.filter((r) => r.status === 'yes');
    const yesCount = yesRsvps.reduce(
      (sum, r) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0), 0,
    );
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
  };

  return (
    <View style={styles.container}>
      {/* Golden atmospheric glow */}
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={420} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="atmosphere" cx="50%" cy="0%" rx="70%" ry="80%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.18" />
              <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.08" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={420} fill="url(#atmosphere)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header — logo + bell */}
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
        >
          {/* Personal greeting */}
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>
              {displayName ? `Hey ${displayName}` : 'Welcome'}
            </Text>
            <Text style={styles.tagline}>You're invited! RSVP if you can make it</Text>
          </View>

          {loading && (
            <View style={{ paddingHorizontal: SPACING.xl, marginTop: SPACING.xl }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          )}

          {!loading && (
            <>
              {/* New invite (Phase 1 placeholder: most recent RSVP) */}
              {pendingInvite && (
                <HomeSection title="Your most recent invite">
                  {renderEventCard(pendingInvite)}
                </HomeSection>
              )}

              {/* Recently viewed */}
              {recentEvents.length > 0 && (
                <HomeSection title="Recently viewed">
                  {recentEvents.map(renderEventCard)}
                </HomeSection>
              )}

              {/* Discover events */}
              <HomeSection
                title="Discover events"
                onViewAll={() => router.push('/(tabs)/trending')}
              >
                {discoverEvents.length > 0 ? (
                  discoverEvents.slice(0, 5).map(renderEventCard)
                ) : (
                  <EmptyState emoji="🌙" title="No events yet" subtitle="Be the first to host one" />
                )}
              </HomeSection>

              {/* Why not host a... */}
              <HomeSection
                title="Why not host a..."
                subtitle="Quick prompts to spark a gathering"
              >
                <View style={styles.bleed}>
                  <HomeChipPrompts />
                </View>
              </HomeSection>

              {/* Every party must come to an end */}
              <HomeSection
                title="Every party must come to an end..."
                subtitle="Unless you host one"
              >
                <View style={styles.bleed}>
                  <HomeThemeCarousel />
                </View>
              </HomeSection>
            </>
          )}

          <View style={{ height: 120 }} />
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

  atmosphereLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandEnglish: {
    fontSize: 26,
    color: COLORS.white,
    fontFamily: 'ManropeLight',
    letterSpacing: 4,
  },
  brandPipe: {
    fontSize: 24,
    color: COLORS.muted,
    fontFamily: 'ManropeLight',
    marginHorizontal: SPACING.md,
    opacity: 0.4,
  },
  brandArabic: {
    fontSize: 24,
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

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 100,
  },

  // Greeting
  greetingBlock: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Sections render their own padding; bleed lets horizontal scrollers extend edge-to-edge
  bleed: {
    marginHorizontal: -SPACING.xl,
  },
});

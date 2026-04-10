import { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { GenderMode } from '../../types';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/auth-cache';
import { fetchUnreadMessageCount } from '../../lib/messaging';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';
import HomeSection from '../../components/HomeSection';
import HomeChipPrompts from '../../components/HomeChipPrompts';
import HomeThemeCarousel from '../../components/HomeThemeCarousel';
import HomeFeaturedCollections from '../../components/HomeFeaturedCollections';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeedEvent {
  id: string;
  title: string;
  theme_id: string;
  poster_url: string | null;
  description: string | null;
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
  const [unreadMessages, setUnreadMessages] = useState(0);

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
      .select('id, title, theme_id, poster_url, description, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status, children_count, plus_one_names)')
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setDiscoverEvents(data as FeedEvent[]);
  }, []);

  // Fetch recently viewed events from event_views table (Supabase)
  const fetchRecentlyViewed = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setRecentEvents([]);
      return;
    }
    // Get the last 5 distinct events the user viewed
    const { data: views } = await supabase
      .from('event_views')
      .select('event_id, viewed_at')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(20);

    if (!views || views.length === 0) {
      setRecentEvents([]);
      return;
    }

    // Dedupe event_ids preserving order
    const seen = new Set<string>();
    const distinctIds: string[] = [];
    for (const v of views) {
      if (!seen.has(v.event_id)) {
        seen.add(v.event_id);
        distinctIds.push(v.event_id);
        if (distinctIds.length >= 5) break;
      }
    }

    const { data } = await supabase
      .from('events')
      .select('id, title, theme_id, poster_url, description, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status, children_count, plus_one_names)')
      .in('id', distinctIds)
      .eq('is_cancelled', false);

    if (data) {
      // Preserve original recency order
      const ordered = distinctIds
        .map((id) => data.find((e: any) => e.id === id))
        .filter(Boolean) as FeedEvent[];
      setRecentEvents(ordered);
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
        .select('id, title, theme_id, poster_url, description, gender_mode, is_halal_venue, price, capacity, date_time, location_name, host_id, slug, rsvps(status, children_count, plus_one_names)')
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

    // Also refresh unread messages count
    const msgCount = await fetchUnreadMessageCount(userId);
    setUnreadMessages(msgCount);
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

  const renderEventCard = (event: FeedEvent, cardVariant: 'vertical' | 'horizontal' | 'mini' = 'vertical') => {
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
        poster_url={event.poster_url}
        description={event.description}
        variant={cardVariant}
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
        {/* Header — logo + bell + message icon */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brandEnglish}>DAWAT</Text>
            <Text style={styles.brandPipe}>|</Text>
            <Text style={styles.brandArabic}>دعوت</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/notifications'); }}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 16z"
                  stroke="#FFFFFF"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M10 21a2 2 0 0 0 4 0"
                  stroke="#FFFFFF"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/inbox'); }}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M16 11.5a4.5 4.5 0 0 1-4.5 4.5H9l-3 2.5V16h-.5A2.5 2.5 0 0 1 3 13.5v-6A2.5 2.5 0 0 1 5.5 5h6A4.5 4.5 0 0 1 16 9.5z"
                  stroke="#FFFFFF"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M9 11.5a6.5 6.5 0 0 1 6.5-6.5h3A2.5 2.5 0 0 1 21 7.5v6a2.5 2.5 0 0 1-2.5 2.5H18v2.5l-3-2.5h-2"
                  stroke="#FFFFFF"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              {unreadMessages > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
                </View>
              )}
            </Pressable>
          </View>
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
                  {renderEventCard(pendingInvite, 'horizontal')}
                </HomeSection>
              )}

              {/* Recently viewed — horizontal scroll */}
              {recentEvents.length > 0 && (
                <HomeSection title="Recently viewed">
                  <View style={styles.bleed}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.recentRow}
                      decelerationRate="fast"
                    >
                      {recentEvents.map((event) => (
                        <View key={event.id}>
                          {renderEventCard(event, 'mini')}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </HomeSection>
              )}

              {/* Out and About — featured collections */}
              <HomeSection
                title="Out and About"
                subtitle="Curated picks from the community"
              >
                <View style={styles.bleed}>
                  <HomeFeaturedCollections />
                </View>
              </HomeSection>

              {/* Discover events — horizontal scroll */}
              <HomeSection
                title="Discover events"
                onViewAll={() => router.navigate('/(tabs)/trending')}
              >
                {discoverEvents.length > 0 ? (
                  <View style={styles.bleed}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.discoverRow}
                      decelerationRate="fast"
                      snapToInterval={SCREEN_WIDTH * 0.72 + SPACING.md}
                    >
                      {discoverEvents.slice(0, 10).map((event) => (
                        <View key={event.id} style={styles.discoverCardWrap}>
                          <EventCard
                            key={event.id}
                            id={event.id}
                            title={event.title}
                            theme_id={event.theme_id}
                            poster_url={event.poster_url}
                            description={event.description}
                            variant="vertical"
                            width={SCREEN_WIDTH * 0.72}
                            date_label={event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Date TBD'}
                            location_name={event.location_name ?? 'Location TBD'}
                            yes_count={(event.rsvps ?? []).filter((r) => r.status === 'yes').length}
                            inshallah_count={(event.rsvps ?? []).filter((r) => r.status === 'inshallah').length}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  brandEnglish: {
    fontSize: 22,
    color: COLORS.white,
    fontFamily: 'ManropeLight',
    letterSpacing: 3,
  },
  brandPipe: {
    fontSize: 20,
    color: COLORS.muted,
    fontFamily: 'ManropeLight',
    marginHorizontal: SPACING.sm,
    opacity: 0.4,
  },
  brandArabic: {
    fontSize: 20,
    color: COLORS.gold,
    fontWeight: '300',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(20, 20, 20, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },
  badgeText: { fontSize: 11, color: '#FFFFFF', ...FONTS.bold },

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

  // Recently viewed mini card row
  recentRow: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },

  // Discover events horizontal scroll (vertical cards)
  discoverRow: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  discoverCardWrap: {
    width: SCREEN_WIDTH * 0.72,
  },
});

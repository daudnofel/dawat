import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Pressable, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { GenderMode } from '../../types';
import { getCurrentUserId } from '../../lib/auth-cache';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'hosting' | 'attending' | 'past';

const TABS_LIST: { key: Tab; label: string }[] = [
  { key: 'hosting', label: 'Hosting' },
  { key: 'attending', label: 'Attending' },
  { key: 'past', label: 'Past' },
];

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('hosting');
  const pagerRef = useRef<ScrollView>(null);
  const [hosting, setHosting] = useState<any[]>([]);
  const [attending, setAttending] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noAuth, setNoAuth] = useState(false);

  const fetchMyEvents = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();

      if (!userId) {
        setNoAuth(true);
        setHosting([]);
        setAttending([]);
        setPast([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setNoAuth(false);

      const now = new Date().toISOString();

      const [hostedResult, rsvpResult] = await Promise.all([
        supabase.from('events').select('*, rsvps(status, children_count, plus_one_names)').eq('host_id', userId).eq('is_cancelled', false).order('created_at', { ascending: false }),
        supabase.from('rsvps').select('event_id').eq('user_id', userId).in('status', ['yes', 'inshallah']),
      ]);

      setHosting(hostedResult.data ?? []);

      const rsvpEventIds = (rsvpResult.data ?? []).map((r: any) => r.event_id);

      // Attending: upcoming events the user RSVPd to (existing behaviour — unchanged)
      if (rsvpEventIds.length > 0) {
        const { data: events } = await supabase.from('events').select('*, rsvps(status, children_count, plus_one_names)').in('id', rsvpEventIds).eq('is_cancelled', false);
        setAttending(events ?? []);
      } else {
        setAttending([]);
      }

      // Past: events where date_time < now, user was host OR had RSVP
      const [pastHostedResult, pastAttendedResult] = await Promise.all([
        supabase.from('events').select('*, rsvps(status, children_count, plus_one_names)').eq('host_id', userId).lt('date_time', now).order('date_time', { ascending: false }),
        rsvpEventIds.length > 0
          ? supabase.from('events').select('*, rsvps(status, children_count, plus_one_names)').in('id', rsvpEventIds).lt('date_time', now).order('date_time', { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);

      // Merge hosted + attended past events, deduplicate by id
      const pastHosted = pastHostedResult.data ?? [];
      const pastAttended = (pastAttendedResult.data ?? []) as any[];
      const hostedIds = new Set(pastHosted.map((e: any) => e.id));
      const merged = [
        ...pastHosted,
        ...pastAttended.filter((e: any) => !hostedIds.has(e.id)),
      ].sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
      setPast(merged);
    } catch (e) {
      console.log('Events fetch error:', e);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchMyEvents(); };

  const renderCard = (e: any, label: string, index: number) => {
    const rsvps = Array.isArray(e.rsvps) ? e.rsvps : [];
    const yesRsvps = rsvps.filter((r: any) => r.status === 'yes');
    const yesCount = yesRsvps.reduce((sum: number, r: any) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0), 0);
    const inshallahCount = rsvps.filter((r: any) => r.status === 'inshallah').length;
    return (
      <Animated.View key={e.id} entering={FadeInDown.delay(index * 60).duration(300)}>
        <EventCard
          id={e.id} title={e.title} theme_id={e.theme_id}
          poster_url={e.poster_url}
          description={e.description}
          variant="horizontal"
          org_name={label}
          date_label={e.date_time ? new Date(e.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
          location_name={e.location_name ?? 'TBD'} price={e.price}
          gender_mode={e.gender_mode as GenderMode} is_halal_venue={e.is_halal_venue}
          yes_count={yesCount} inshallah_count={inshallahCount} capacity={e.capacity}
        />
      </Animated.View>
    );
  };

  const handleTabPress = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    const idx = TABS_LIST.findIndex((t) => t.key === tab);
    pagerRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
  };

  const handlePageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    const tab = TABS_LIST[page]?.key;
    if (tab && tab !== activeTab) setActiveTab(tab);
  };

  const renderTabPage = (tab: Tab) => {
    const data = tab === 'hosting' ? hosting : tab === 'attending' ? attending : past;
    const label = tab === 'hosting' ? 'Hosted by you' : tab === 'attending' ? "RSVP'd" : 'Past';

    if (loading) return <><SkeletonCard /><SkeletonCard /></>;
    if (noAuth) return <EmptyState emoji="🔐" title="Sign in to see your events" subtitle="Your hosted and attending events will appear here" />;
    if (data.length === 0) {
      const empty = {
        hosting: { emoji: '🎉' as const, title: 'No events hosted yet', subtitle: 'Tap + to create your first event' },
        attending: { emoji: '🌙' as const, title: 'No upcoming events', subtitle: 'Explore what\'s on and RSVP to events near you' },
        past: { emoji: '📖' as const, title: 'No past events yet', subtitle: 'Events you\'ve hosted or attended will appear here' },
      };
      return <EmptyState {...empty[tab]} />;
    }
    return data.map((e: any, index: number) => renderCard(e, label, index));
  };

  return (
    <View style={styles.container}>
      {/* Golden atmospheric glow */}
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={350} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="eventsGlow" cx="50%" cy="0%" rx="70%" ry="80%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.14" />
              <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.06" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={350} fill="url(#eventsGlow)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Events</Text>
        </View>

        {/* Tab bar — tap or swipe to switch */}
        <View style={styles.tabBar}>
          {TABS_LIST.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Swipeable pager — 3 full-width pages, swipe left/right to switch tabs */}
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlePageScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {TABS_LIST.map((tab) => (
            <ScrollView
              key={tab.key}
              style={{ width: SCREEN_WIDTH }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
            >
              {renderTabPage(tab.key)}
              <View style={{ height: 120 }} />
            </ScrollView>
          ))}
        </ScrollView>
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

  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  tab: {
    paddingVertical: SPACING.md,
    marginRight: SPACING.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.gold,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.muted,
    ...FONTS.semibold,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 40, paddingTop: SPACING.md },
});

import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Pressable } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
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

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('hosting');
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

  const renderCard = (e: any, label: string) => {
    const rsvps = Array.isArray(e.rsvps) ? e.rsvps : [];
    const yesRsvps = rsvps.filter((r: any) => r.status === 'yes');
    const yesCount = yesRsvps.reduce((sum: number, r: any) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0), 0);
    const inshallahCount = rsvps.filter((r: any) => r.status === 'inshallah').length;
    return (
      <EventCard
        key={e.id} id={e.id} title={e.title} theme_id={e.theme_id}
        poster_url={e.poster_url}
        org_name={label}
        date_label={e.date_time ? new Date(e.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
        location_name={e.location_name ?? 'TBD'} price={e.price}
        gender_mode={e.gender_mode as GenderMode} is_halal_venue={e.is_halal_venue}
        yes_count={yesCount} inshallah_count={inshallahCount} capacity={e.capacity}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return <><SkeletonCard /><SkeletonCard /></>;
    }
    if (noAuth) {
      return <EmptyState emoji="🔐" title="Sign in to see your events" subtitle="Your hosted and attending events will appear here" />;
    }

    if (activeTab === 'hosting') {
      return hosting.length > 0
        ? hosting.map((e) => renderCard(e, 'You'))
        : <EmptyState emoji="✨" title="No events hosted yet" subtitle="Tap the + button to create your first event" />;
    }

    if (activeTab === 'attending') {
      return attending.length > 0
        ? attending.map((e) => renderCard(e, "RSVP'd"))
        : <EmptyState emoji="🌙" title="No upcoming events" subtitle="Explore what's on and RSVP to events near you" />;
    }

    // Past tab
    return past.length > 0
      ? past.map((e) => renderCard(e, 'Past'))
      : <EmptyState emoji="📖" title="No past events yet" subtitle="Events you've hosted or attended will appear here" />;
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'hosting', label: 'Hosting' },
    { key: 'attending', label: 'Attending' },
    { key: 'past', label: 'Past' },
  ];

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

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          key={activeTab}
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
        >
          {renderContent()}
          <View style={{ height: 120 }} />
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

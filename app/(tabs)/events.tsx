import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { GenderMode } from '../../types';
import { getCurrentUserId } from '../../lib/auth-cache';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EventsScreen() {
  const [hosting, setHosting] = useState<any[]>([]);
  const [attending, setAttending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noAuth, setNoAuth] = useState(false);

  const fetchMyEvents = useCallback(async () => {
    try {
      let userId = await getCurrentUserId();
      if (!userId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id ?? null;
        } catch {
          userId = null;
        }
      }

      if (!userId) {
        setNoAuth(true);
        setHosting([]);
        setAttending([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setNoAuth(false);

      const [hostedResult, rsvpResult] = await Promise.all([
        supabase.from('events').select('*, rsvps(status)').eq('host_id', userId).eq('is_cancelled', false).order('created_at', { ascending: false }),
        supabase.from('rsvps').select('event_id').eq('user_id', userId).in('status', ['yes', 'inshallah']),
      ]);

      setHosting(hostedResult.data ?? []);

      if (rsvpResult.data && rsvpResult.data.length > 0) {
        const ids = rsvpResult.data.map((r: any) => r.event_id);
        const { data: events } = await supabase.from('events').select('*, rsvps(status)').in('id', ids).eq('is_cancelled', false);
        setAttending(events ?? []);
      } else {
        setAttending([]);
      }
    } catch (e) {
      console.log('Events fetch error:', e);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    if (!loading) {
      fetchMyEvents();
    }
  }, [fetchMyEvents]));

  const onRefresh = () => { setRefreshing(true); fetchMyEvents(); };

  const renderCard = (e: any, label: string) => {
    const rsvps = Array.isArray(e.rsvps) ? e.rsvps : [];
    const yesCount = rsvps.filter((r: any) => r.status === 'yes').length;
    const inshallahCount = rsvps.filter((r: any) => r.status === 'inshallah').length;
    return (
      <EventCard
        key={e.id} id={e.id} title={e.title} theme_id={e.theme_id}
        org_name={label}
        date_label={e.date_time ? new Date(e.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
        location_name={e.location_name ?? 'TBD'} price={e.price}
        gender_mode={e.gender_mode as GenderMode} is_halal_venue={e.is_halal_venue}
        yes_count={yesCount} inshallah_count={inshallahCount} capacity={e.capacity}
      />
    );
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
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
        >
          {loading ? (
            <>
              <Text style={styles.sectionTitle}>Hosting</Text>
              <SkeletonCard />
              <Text style={styles.sectionTitle}>Attending</Text>
              <SkeletonCard />
            </>
          ) : noAuth ? (
            <EmptyState emoji="🔐" title="Sign in to see your events" subtitle="Your hosted and attending events will appear here" />
          ) : (
            <>
              <Text style={styles.sectionTitle}>Hosting</Text>
              {hosting.length > 0
                ? hosting.map((e) => renderCard(e, 'You'))
                : <Text style={styles.emptyText}>No events hosted yet</Text>}

              <Text style={styles.sectionTitle}>Attending</Text>
              {attending.length > 0
                ? attending.map((e) => renderCard(e, "RSVP'd"))
                : <Text style={styles.emptyText}>No events yet — explore what's on</Text>}
            </>
          )}

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
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.muted,
    ...FONTS.semibold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.hint,
    fontSize: 14,
    ...FONTS.regular,
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },
});

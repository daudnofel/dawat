import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/auth-cache';
import { GenderMode } from '../../types';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';

export default function EventsScreen() {
  const [hosting, setHosting] = useState<any[]>([]);
  const [attending, setAttending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyEvents = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Events I'm hosting — simple query, no joins
      const { data: hosted, error: hostErr } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false });

      if (hostErr) console.log('Host query error:', hostErr.message);
      if (hosted) setHosting(hosted);

      // Events I've RSVP'd to — get event IDs first, then fetch events
      const { data: rsvpData, error: rsvpErr } = await supabase
        .from('rsvps')
        .select('event_id, status')
        .eq('user_id', userId)
        .in('status', ['yes', 'inshallah']);

      if (rsvpErr) console.log('RSVP query error:', rsvpErr.message);

      if (rsvpData && rsvpData.length > 0) {
        const eventIds = rsvpData.map((r: any) => r.event_id);
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        if (events) setAttending(events);
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
    fetchMyEvents();
  }, [fetchMyEvents]));

  const onRefresh = () => { setRefreshing(true); fetchMyEvents(); };

  const renderCard = (e: any, label: string) => (
    <EventCard
      key={e.id} id={e.id} title={e.title} theme_id={e.theme_id}
      org_name={label}
      date_label={e.date_time ? new Date(e.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
      location_name={e.location_name ?? 'TBD'} price={e.price}
      gender_mode={e.gender_mode as GenderMode} is_halal_venue={e.is_halal_venue}
      yes_count={0} inshallah_count={0} capacity={e.capacity}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, color: COLORS.muted, ...FONTS.semibold, marginTop: SPACING.lg, marginBottom: SPACING.md },
  emptyText: { color: COLORS.hint, fontSize: 14, ...FONTS.regular, textAlign: 'center', marginVertical: SPACING.xl },
});

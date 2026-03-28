import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { GenderMode } from '../../types';
import EventCard from '../../components/EventCard';

export default function EventsScreen() {
  const [hosting, setHosting] = useState<any[]>([]);
  const [attending, setAttending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Events I'm hosting
    const { data: hosted } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false });

    if (hosted) setHosting(hosted);

    // Events I've RSVP'd to
    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('event_id, status, events(*)')
      .eq('user_id', user.id)
      .in('status', ['yes', 'inshallah']);

    if (rsvps) {
      setAttending(rsvps.map((r: any) => ({ ...r.events, rsvp_status: r.status })).filter(Boolean));
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchMyEvents(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchMyEvents(); };

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
        {loading && <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 60 }} />}

        {!loading && (
          <>
            <Text style={styles.sectionTitle}>Hosting</Text>
            {hosting.length > 0 ? hosting.map((e) => (
              <EventCard
                key={e.id} id={e.id} title={e.title} theme_id={e.theme_id}
                org_name="You" date_label={e.date_time ? new Date(e.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                location_name={e.location_name ?? 'TBD'} price={e.price}
                gender_mode={e.gender_mode as GenderMode} is_halal_venue={e.is_halal_venue}
                yes_count={0} inshallah_count={0} capacity={e.capacity}
              />
            )) : <Text style={styles.emptyText}>No events hosted yet</Text>}

            <Text style={styles.sectionTitle}>Attending</Text>
            {attending.length > 0 ? attending.map((e) => (
              <EventCard
                key={e.id} id={e.id} title={e.title} theme_id={e.theme_id}
                org_name="RSVP'd" date_label={e.date_time ? new Date(e.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                location_name={e.location_name ?? 'TBD'} price={e.price}
                gender_mode={e.gender_mode as GenderMode} is_halal_venue={e.is_halal_venue}
                yes_count={0} inshallah_count={0} capacity={e.capacity}
              />
            )) : <Text style={styles.emptyText}>No events yet — explore what's on</Text>}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, color: COLORS.muted, ...FONTS.semibold, marginTop: SPACING.lg, marginBottom: SPACING.md },
  emptyText: { color: COLORS.hint, fontSize: 14, ...FONTS.regular, textAlign: 'center', marginVertical: SPACING.xl },
});

import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getThemeById } from '../../lib/themes';

const ETHNIC_FILTERS = ['All', 'South Asian', 'Arab', 'Somali', 'West African', 'Turkish', 'Other'];

export default function TrendingScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrending = async () => {
    // Fetch events with RSVP counts, ordered by total RSVPs (trending proxy)
    const { data, error } = await supabase
      .from('events')
      .select('id, title, theme_id, date_time, host_id, slug, rsvps(status)')
      .eq('is_published', true)
      .eq('is_cancelled', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      // Sort by RSVP count (descending) as trending proxy
      const sorted = data
        .map((e: any) => ({
          ...e,
          going: (e.rsvps ?? []).filter((r: any) => r.status === 'yes' || r.status === 'inshallah').length,
        }))
        .sort((a: any, b: any) => b.going - a.going);

      setEvents(sorted);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchTrending(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchTrending(); };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending</Text>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {ETHNIC_FILTERS.map((f) => (
            <Pressable key={f} style={[styles.filterPill, activeFilter === f && styles.filterPillActive]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      >
        {loading && <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 60 }} />}

        {!loading && events.map((event, index) => {
          const theme = getThemeById(event.theme_id);
          return (
            <Pressable
              key={event.id}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
              onPress={() => router.push(`/event/${event.id}`)}
            >
              <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.rowEmoji}>{theme?.defaultEmoji ?? '🌙'}</Text>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.rowMeta}>
                  {event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                </Text>
              </View>
              <Text style={styles.rowGoing}>
                {event.going > 5 ? '🔥 ' : ''}{event.going} going
              </Text>
            </Pressable>
          );
        })}

        {!loading && events.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: SPACING.lg }}>🔥</Text>
            <Text style={{ fontSize: 18, color: COLORS.white, ...FONTS.semibold }}>No trending events yet</Text>
            <Text style={{ fontSize: 14, color: COLORS.muted, marginTop: SPACING.sm }}>Create events to see them here</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  filterWrapper: { height: 44 },
  filterRow: { paddingHorizontal: SPACING.xl, gap: SPACING.sm, alignItems: 'center', height: 44 },
  filterPill: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  filterPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterText: { fontSize: 13, color: COLORS.muted, ...FONTS.medium },
  filterTextActive: { color: COLORS.dark },
  list: { flex: 1, paddingHorizontal: SPACING.xl },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rankCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: COLORS.dark, fontSize: 13, ...FONTS.bold },
  rowEmoji: { fontSize: 24 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, color: COLORS.white, ...FONTS.semibold },
  rowMeta: { fontSize: 12, color: COLORS.muted, ...FONTS.regular, marginTop: 2 },
  rowGoing: { fontSize: 12, color: COLORS.muted, ...FONTS.medium },
});

import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { GenderMode } from '../../types';
import EventCard from '../../components/EventCard';

export default function OrgPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => { fetchOrg(); }, [id]);

  const fetchOrg = async () => {
    // Fetch org
    const { data: orgData } = await supabase
      .from('organisations')
      .select('*')
      .eq('id', id)
      .single();

    if (orgData) setOrg(orgData);

    // Fetch org events
    const { data: eventData } = await supabase
      .from('events')
      .select('*, rsvps(status)')
      .eq('org_id', id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (eventData) setEvents(eventData);

    // Fetch follower count
    const { count } = await supabase
      .from('org_followers')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', id);

    setFollowerCount(count ?? 0);

    // Check if current user follows
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: followData } = await supabase
        .from('org_followers')
        .select('org_id')
        .eq('org_id', id)
        .eq('user_id', user.id)
        .single();

      setFollowing(!!followData);
    }

    setLoading(false);
  };

  const handleFollow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (following) {
      await supabase.from('org_followers').delete().eq('org_id', id).eq('user_id', user.id);
      setFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await supabase.from('org_followers').insert({ org_id: id, user_id: user.id });
      setFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!org) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Pressable style={{ padding: SPACING.xl }} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 60, fontSize: 16 }}>Organisation not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.banner} />

        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{org.name.charAt(0)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{org.name}</Text>
            {org.is_verified && <Text style={styles.verified}> ✓</Text>}
          </View>
          <Text style={styles.handle}>@{org.handle}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>{followerCount} Followers</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.stat}>{events.length} Events</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.followBtn, following && styles.followBtnActive, pressed && { opacity: 0.8 }]}
            onPress={handleFollow}
          >
            <Text style={[styles.followText, following && styles.followTextActive]}>
              {following ? 'Following ✓' : 'Follow'}
            </Text>
          </Pressable>

          {org.description && (
            <Text style={styles.description}>{org.description}</Text>
          )}

          <View style={styles.tabRow}>
            {(['upcoming', 'past'] as const).map((tab) => (
              <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'upcoming' ? 'Upcoming' : 'Past'}
                </Text>
              </Pressable>
            ))}
          </View>

          {events.length > 0 ? events.map((e: any) => {
            const rsvps = e.rsvps ?? [];
            return (
              <EventCard
                key={e.id} id={e.id} title={e.title} theme_id={e.theme_id}
                org_name={org.name}
                date_label={e.date_time ? new Date(e.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                location_name={e.location_name ?? 'TBD'} price={e.price}
                gender_mode={e.gender_mode as GenderMode} is_halal_venue={e.is_halal_venue}
                yes_count={rsvps.filter((r: any) => r.status === 'yes').length}
                inshallah_count={rsvps.filter((r: any) => r.status === 'inshallah').length}
                capacity={e.capacity}
              />
            );
          }) : (
            <Text style={styles.emptyText}>No events yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  backBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  banner: { height: 140, backgroundColor: COLORS.card2 },
  logoWrap: { alignItems: 'center', marginTop: -40 },
  logo: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.dark },
  logoText: { color: COLORS.dark, fontSize: 32, ...FONTS.bold },
  body: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: 100 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, color: COLORS.white, ...FONTS.bold, textAlign: 'center' },
  verified: { color: COLORS.gold, fontSize: 18, ...FONTS.bold },
  handle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, textAlign: 'center', marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.md, marginBottom: SPACING.lg },
  stat: { fontSize: 14, color: COLORS.muted, ...FONTS.medium },
  statDot: { color: COLORS.hint },
  followBtn: { alignSelf: 'center', paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.full, backgroundColor: COLORS.gold, marginBottom: SPACING.lg },
  followBtnActive: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  followText: { fontSize: 14, color: COLORS.dark, ...FONTS.bold },
  followTextActive: { color: COLORS.white },
  description: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, lineHeight: 20, textAlign: 'center', marginBottom: SPACING.xl },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: SPACING.lg },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.gold },
  tabText: { fontSize: 14, color: COLORS.muted, ...FONTS.medium },
  tabTextActive: { color: COLORS.white },
  emptyText: { color: COLORS.hint, fontSize: 14, ...FONTS.regular, textAlign: 'center', marginTop: SPACING.xl },
});

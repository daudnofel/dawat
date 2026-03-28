import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import EventCard from '../../components/EventCard';
import { GenderMode } from '../../types';

const MOCK_ORG = {
  name: 'Islamic Center of Dallas',
  handle: 'icd_dallas',
  is_verified: true,
  description: 'Serving the Muslim community of Dallas since 1977. Weekly halaqas, Jummah prayers, and community events.',
  follower_count: 2340,
  event_count: 47,
};

const MOCK_ORG_EVENTS = [
  {
    id: '1', title: 'Eid Gala 2026', theme_id: 'eid_gala',
    org_name: 'Islamic Center of Dallas', date_label: 'Apr 15 · 7:00 PM',
    location_name: 'Grand Hall', price: 0, gender_mode: GenderMode.Mixed,
    is_halal_venue: true, yes_count: 87, inshallah_count: 34, capacity: 200,
  },
];

export default function OrgPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        {/* Banner */}
        <View style={styles.banner} />

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{MOCK_ORG.name.charAt(0)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{MOCK_ORG.name}</Text>
            {MOCK_ORG.is_verified && <Text style={styles.verified}> ✓</Text>}
          </View>
          <Text style={styles.handle}>@{MOCK_ORG.handle}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>{MOCK_ORG.follower_count} Followers</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.stat}>{MOCK_ORG.event_count} Events</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.followBtn,
              following && styles.followBtnActive,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setFollowing(!following)}
          >
            <Text style={[styles.followText, following && styles.followTextActive]}>
              {following ? 'Following ✓' : 'Follow'}
            </Text>
          </Pressable>

          <Text style={styles.description}>{MOCK_ORG.description}</Text>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {(['upcoming', 'past'] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'upcoming' ? 'Upcoming' : 'Past'}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === 'upcoming' ? (
            MOCK_ORG_EVENTS.map((e) => <EventCard key={e.id} {...e} />)
          ) : (
            <Text style={styles.emptyText}>No past events</Text>
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
  logo: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.dark,
  },
  logoText: { color: COLORS.dark, fontSize: 32, ...FONTS.bold },
  body: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: 100 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, color: COLORS.white, ...FONTS.bold, textAlign: 'center' },
  verified: { color: COLORS.gold, fontSize: 18, ...FONTS.bold },
  handle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, textAlign: 'center', marginTop: 2 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm,
    marginTop: SPACING.md, marginBottom: SPACING.lg,
  },
  stat: { fontSize: 14, color: COLORS.muted, ...FONTS.medium },
  statDot: { color: COLORS.hint },
  followBtn: {
    alignSelf: 'center', paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full, backgroundColor: COLORS.gold, marginBottom: SPACING.lg,
  },
  followBtnActive: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  followText: { fontSize: 14, color: COLORS.dark, ...FONTS.bold },
  followTextActive: { color: COLORS.white },
  description: {
    fontSize: 14, color: COLORS.muted, ...FONTS.regular, lineHeight: 20,
    textAlign: 'center', marginBottom: SPACING.xl,
  },
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.gold },
  tabText: { fontSize: 14, color: COLORS.muted, ...FONTS.medium },
  tabTextActive: { color: COLORS.white },
  emptyText: { color: COLORS.hint, fontSize: 14, ...FONTS.regular, textAlign: 'center', marginTop: SPACING.xl },
});

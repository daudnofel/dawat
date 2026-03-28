import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { getThemeById } from '../../lib/themes';

const ETHNIC_FILTERS = ['All', 'South Asian', 'Arab', 'Somali', 'West African', 'Turkish', 'Other'];

const TRENDING_EVENTS = [
  { id: '5', rank: 1, title: 'Ramadan Fundraiser Dinner', theme_id: 'ramadan_kareem', org: 'Islamic Relief UK', date: 'Apr 5', going: 145, hot: true },
  { id: '1', rank: 2, title: 'Eid Gala 2026', theme_id: 'eid_gala', org: 'Islamic Center of London', date: 'Apr 15', going: 87, hot: true },
  { id: '4', rank: 3, title: 'Family Iftar & Games', theme_id: 'family_picnic', org: 'Crescent Community', date: 'Apr 8', going: 52, hot: false },
  { id: '2', rank: 4, title: 'Sisters Halaqa — Tafsir Night', theme_id: 'sisters_halaqa', org: 'Al-Noor Academy', date: 'Apr 10', going: 24, hot: false },
  { id: '3', rank: 5, title: 'Brothers Night Out', theme_id: 'brothers_night', org: 'Youth Circle', date: 'Apr 12', going: 18, hot: false },
];

export default function TrendingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending in London</Text>
      </View>

      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {ETHNIC_FILTERS.map((f, i) => (
          <Pressable key={f} style={[styles.filterPill, i === 0 && styles.filterPillActive]}>
            <Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {TRENDING_EVENTS.map((event) => {
          const theme = getThemeById(event.theme_id);
          return (
            <Pressable
              key={event.id}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
              onPress={() => router.push(`/event/${event.id}`)}
            >
              <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{event.rank}</Text>
              </View>
              <Text style={styles.rowEmoji}>{theme?.defaultEmoji ?? '🌙'}</Text>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.rowMeta}>{event.org} · {event.date}</Text>
              </View>
              <Text style={styles.rowGoing}>
                {event.hot ? '🔥 ' : ''}{event.going} going
              </Text>
            </Pressable>
          );
        })}

        {/* Scholar Talks */}
        <Text style={styles.sectionTitle}>📚 Scholar Talks</Text>
        <View style={styles.scholarCard}>
          <Text style={styles.scholarEmoji}>🎓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.scholarName}>Shaykh Yasir Qadhi</Text>
            <Text style={styles.scholarTopic}>The Fiqh of Fasting in the Modern World</Text>
          </View>
          <View style={styles.scholarBadge}>
            <Text style={styles.scholarBadgeText}>12 spots</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  filterRow: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md, gap: SPACING.sm },
  filterPill: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  filterPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterText: { fontSize: 13, color: COLORS.muted, ...FONTS.medium },
  filterTextActive: { color: COLORS.dark },
  list: { flex: 1, paddingHorizontal: SPACING.xl },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rankCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { color: COLORS.dark, fontSize: 13, ...FONTS.bold },
  rowEmoji: { fontSize: 24 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, color: COLORS.white, ...FONTS.semibold },
  rowMeta: { fontSize: 12, color: COLORS.muted, ...FONTS.regular, marginTop: 2 },
  rowGoing: { fontSize: 12, color: COLORS.muted, ...FONTS.medium },
  sectionTitle: {
    fontSize: 18, color: COLORS.white, ...FONTS.bold, marginTop: SPACING.xl, marginBottom: SPACING.md,
  },
  scholarCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.border, padding: SPACING.lg,
  },
  scholarEmoji: { fontSize: 32 },
  scholarName: { fontSize: 14, color: COLORS.white, ...FONTS.bold },
  scholarTopic: { fontSize: 12, color: COLORS.muted, ...FONTS.regular, marginTop: 2 },
  scholarBadge: {
    backgroundColor: `${COLORS.amber}20`, paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  scholarBadgeText: { fontSize: 11, color: COLORS.amber, ...FONTS.semibold },
});

import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { GenderMode } from '../../types';
import { useFeedStore } from '../../store/useFeedStore';
import EventCard from '../../components/EventCard';

const FILTER_TABS = [
  { label: 'All Events', value: 'all' as const },
  { label: 'Brothers', value: GenderMode.BrothersOnly },
  { label: 'Sisters', value: GenderMode.SistersOnly },
  { label: 'Family', value: GenderMode.Family },
];

// Mock events for dev — will be replaced with Supabase query
const MOCK_EVENTS = [
  {
    id: '1', title: 'Eid Gala 2026', theme_id: 'eid_gala',
    org_name: 'Islamic Center of Dallas', date_label: 'Apr 15 · 7:00 PM',
    location_name: 'Grand Hall', price: 0, gender_mode: GenderMode.Mixed,
    is_halal_venue: true, yes_count: 87, inshallah_count: 34, capacity: 200,
  },
  {
    id: '2', title: 'Sisters Halaqa — Tafsir Night', theme_id: 'sisters_halaqa',
    org_name: 'Al-Noor Academy', date_label: 'Apr 10 · 6:30 PM',
    location_name: 'Community Room', price: 0, gender_mode: GenderMode.SistersOnly,
    is_halal_venue: false, yes_count: 24, inshallah_count: 12, capacity: 40,
  },
  {
    id: '3', title: 'Brothers Night Out', theme_id: 'brothers_night',
    org_name: 'Youth Circle', date_label: 'Apr 12 · 8:00 PM',
    location_name: 'The Halal Guys — Houston', price: 2500, gender_mode: GenderMode.BrothersOnly,
    is_halal_venue: true, yes_count: 18, inshallah_count: 7, capacity: null,
  },
  {
    id: '4', title: 'Family Iftar & Games', theme_id: 'family_picnic',
    org_name: 'Crescent Community', date_label: 'Apr 8 · 5:30 PM',
    location_name: 'Central Park, NYC', price: 0, gender_mode: GenderMode.Family,
    is_halal_venue: false, yes_count: 52, inshallah_count: 19, capacity: 100,
  },
  {
    id: '5', title: 'Ramadan Fundraiser Dinner', theme_id: 'ramadan_kareem',
    org_name: 'Islamic Relief USA', date_label: 'Apr 5 · 7:30 PM',
    location_name: 'Hilton Anatole, Dallas', price: 4500, gender_mode: GenderMode.Mixed,
    is_halal_venue: true, yes_count: 145, inshallah_count: 63, capacity: 300,
  },
];

export default function HomeScreen() {
  const { activeFilter, setFilter } = useFeedStore();

  const filteredEvents = activeFilter === 'all'
    ? MOCK_EVENTS
    : MOCK_EVENTS.filter((e) => e.gender_mode === activeFilter || e.gender_mode === GenderMode.Mixed);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandArabic}>دعوت</Text>
          <Text style={styles.brandEnglish}>DAWAT</Text>
        </View>
      </View>

      {/* Gender Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <Pressable
                key={tab.value}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setFilter(tab.value)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Event Feed */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}

        {filteredEvents.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>Try a different filter</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: {
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  brandArabic: { fontSize: 22, color: COLORS.gold, ...FONTS.bold },
  brandEnglish: { fontSize: 18, color: COLORS.white, ...FONTS.bold, letterSpacing: 3 },
  filterWrapper: {
    height: 44,
  },
  filterRow: {
    paddingHorizontal: SPACING.xl, gap: SPACING.sm, alignItems: 'center', height: 44,
  },
  filterPill: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  filterPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterText: { fontSize: 13, color: COLORS.muted, ...FONTS.medium },
  filterTextActive: { color: COLORS.dark },
  feed: { flex: 1 },
  feedContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 18, color: COLORS.white, ...FONTS.semibold, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular },
});

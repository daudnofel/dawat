import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../lib/theme';
import EventCard from '../../components/EventCard';
import { GenderMode } from '../../types';

const ATTENDING_EVENTS = [
  {
    id: '1', title: 'Eid Gala 2026', theme_id: 'eid_gala',
    org_name: 'Islamic Center of Dallas', date_label: 'Apr 15 · 7:00 PM',
    location_name: 'Grand Hall', price: 0, gender_mode: GenderMode.Mixed,
    is_halal_venue: true, yes_count: 87, inshallah_count: 34, capacity: 200,
  },
];

const HOSTING_EVENTS = [
  {
    id: '4', title: 'Family Iftar & Games', theme_id: 'family_picnic',
    org_name: 'You', date_label: 'Apr 8 · 5:30 PM',
    location_name: 'Klyde Warren Park, Dallas', price: 0, gender_mode: GenderMode.Family,
    is_halal_venue: false, yes_count: 52, inshallah_count: 19, capacity: 100,
  },
];

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Attending</Text>
        {ATTENDING_EVENTS.map((e) => <EventCard key={e.id} {...e} />)}

        <Text style={styles.sectionTitle}>Hosting</Text>
        {HOSTING_EVENTS.map((e) => <EventCard key={e.id} {...e} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 16, color: COLORS.muted, ...FONTS.semibold,
    marginTop: SPACING.lg, marginBottom: SPACING.md,
  },
});

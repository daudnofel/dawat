import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { GenderMode } from '../types';
import { getThemeById } from '../lib/themes';
import GenderBadge from './GenderBadge';
import HalalBadge from './HalalBadge';

interface EventCardProps {
  id: string;
  title: string;
  theme_id: string;
  org_name: string;
  date_label: string;
  location_name: string;
  price: number;
  gender_mode: GenderMode;
  is_halal_venue: boolean;
  yes_count: number;
  inshallah_count: number;
  capacity: number | null;
}

export default function EventCard(props: EventCardProps) {
  const router = useRouter();
  const theme = getThemeById(props.theme_id);

  const spotsLeft = props.capacity ? props.capacity - props.yes_count : null;
  const showUrgency = spotsLeft !== null && spotsLeft < 20 && spotsLeft > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 }]}
      onPress={() => router.push(`/event/${props.id}`)}
    >
      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: theme?.bannerBg ?? COLORS.card2 }]}>
        <Text style={styles.bannerEmoji}>{theme?.defaultEmoji ?? '🌙'}</Text>
        {showUrgency && (
          <View style={styles.urgencyBadge}>
            <Text style={styles.urgencyText}>Only {spotsLeft} spots left!</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{props.title}</Text>
        <Text style={styles.orgName} numberOfLines={1}>{props.org_name}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{props.date_label}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta} numberOfLines={1}>{props.location_name}</Text>
          {props.price > 0 && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.meta}>${(props.price / 100).toFixed(0)}</Text>
            </>
          )}
        </View>

        <View style={styles.tagRow}>
          <GenderBadge mode={props.gender_mode} />
          {props.is_halal_venue && <HalalBadge />}
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.goingText}>{props.yes_count} going</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: SPACING.md, overflow: 'hidden',
  },
  banner: {
    height: 90, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  bannerEmoji: { fontSize: 40 },
  urgencyBadge: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    backgroundColor: COLORS.red, paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  urgencyText: { color: COLORS.white, fontSize: 10, ...FONTS.bold },
  body: { padding: SPACING.md },
  title: { fontSize: 15, color: COLORS.white, ...FONTS.bold, marginBottom: 2 },
  orgName: { fontSize: 12, color: COLORS.gold, ...FONTS.medium, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, flexWrap: 'wrap' },
  meta: { fontSize: 11, color: COLORS.muted, ...FONTS.regular },
  metaDot: { fontSize: 11, color: COLORS.hint, marginHorizontal: 4 },
  tagRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  bottomRow: { flexDirection: 'row', alignItems: 'center' },
  goingText: { fontSize: 12, color: COLORS.muted, ...FONTS.medium },
});

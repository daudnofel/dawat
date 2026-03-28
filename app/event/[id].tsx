import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { RsvpStatus, GenderMode } from '../../types';
import RsvpButtons from '../../components/RsvpButtons';
import { getThemeById } from '../../lib/themes';

// Mock event data for dev — will be replaced with Supabase query
const MOCK_EVENT = {
  id: '1',
  title: 'Eid Gala 2026',
  description: 'Join us for an evening of celebration, food, and community. Dress code: formal. Doors open at 6pm, program starts at 7pm.\n\nFood will be provided. Please RSVP so we can plan accordingly.',
  theme_id: 'eid_gala',
  gender_mode: GenderMode.Mixed,
  date_time: '2026-04-15T19:00:00Z',
  location_name: 'Grand Hall, Islamic Center',
  location_address: '5515 W Lovers Ln, Dallas, TX',
  is_location_hidden: false,
  is_halal_venue: true,
  price: 0,
  capacity: 200,
  host_name: 'Islamic Center of Dallas',
  yes_count: 87,
  inshallah_count: 34,
  slug: 'eid-gala-2026-k3x9p',
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null);

  const event = MOCK_EVENT;
  const theme = getThemeById(event.theme_id);

  const handleRsvp = (status: RsvpStatus) => {
    setRsvpStatus(status);
  };

  const handleShare = () => {
    Share.share({
      message: `Check out ${event.title} on Dawat: dawatapp.com/e/${event.slug}`,
    });
  };

  const genderLabel = {
    [GenderMode.Mixed]: '🌟 Mixed',
    [GenderMode.SistersOnly]: '🌸 Sisters Only',
    [GenderMode.BrothersOnly]: '💪 Brothers',
    [GenderMode.Family]: '👨‍👩‍👧 Family',
  }[event.gender_mode];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Pressable onPress={handleShare}>
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
        </View>

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: theme?.bannerBg ?? COLORS.card }]}>
          <Text style={styles.bannerEmoji}>{theme?.defaultEmoji ?? '🌙'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.genderBadge}>
              <Text style={styles.genderBadgeText}>{genderLabel}</Text>
            </View>
            {event.is_halal_venue && (
              <View style={styles.halalBadge}>
                <Text style={styles.halalBadgeText}>✅ Halal</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.orgName}>{event.host_name}</Text>
          </Pressable>

          {/* Attendance */}
          <Text style={styles.attendance}>
            {event.yes_count} confirmed · {event.inshallah_count} Inshallah
          </Text>
          {event.capacity && (
            <View style={styles.capacityBar}>
              <View style={[styles.capacityFill, { width: `${Math.min((event.yes_count / event.capacity) * 100, 100)}%` }]} />
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <InfoRow icon="📅" text="Wednesday, 15 April 2026" />
            <InfoRow icon="⏰" text="7:00 PM" />
            <InfoRow icon="📍" text={event.is_location_hidden ? 'Address revealed on RSVP' : `${event.location_name} — ${event.location_address}`} />
            <InfoRow icon="💷" text={event.price === 0 ? 'Free' : `$${(event.price / 100).toFixed(2)}`} />
            {event.is_halal_venue && <InfoRow icon="✅" text="Halal venue" />}
          </View>

          {/* Description */}
          <Text style={styles.description}>{event.description}</Text>

          {/* RSVP */}
          <View style={styles.rsvpSection}>
            <RsvpButtons currentStatus={rsvpStatus} onSelect={handleRsvp} />
            {rsvpStatus === RsvpStatus.Yes && (
              <Text style={styles.rsvpConfirm}>JazakAllah khair — you're going! 🤲</Text>
            )}
            {rsvpStatus === RsvpStatus.Inshallah && (
              <Text style={styles.rsvpConfirm}>We'll remind you 24h before 🤲</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  shareText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  banner: {
    height: 160, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bannerEmoji: { fontSize: 56 },
  badgeRow: {
    position: 'absolute', bottom: SPACING.md, left: SPACING.lg,
    flexDirection: 'row', gap: SPACING.sm,
  },
  genderBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
  },
  genderBadgeText: { color: COLORS.white, fontSize: 12, ...FONTS.medium },
  halalBadge: {
    backgroundColor: 'rgba(76,175,80,0.2)', paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
  },
  halalBadgeText: { color: COLORS.green, fontSize: 12, ...FONTS.medium },
  body: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  title: { fontSize: 24, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.xs },
  orgName: { fontSize: 14, color: COLORS.gold, ...FONTS.medium, marginBottom: SPACING.md },
  attendance: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, marginBottom: SPACING.sm },
  capacityBar: {
    height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: SPACING.lg,
  },
  capacityFill: { height: 4, backgroundColor: COLORS.gold, borderRadius: 2 },
  infoCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.lg, gap: SPACING.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  infoIcon: { fontSize: 16 },
  infoText: { fontSize: 14, color: COLORS.white, ...FONTS.regular, flex: 1 },
  description: {
    fontSize: 14, color: COLORS.muted, ...FONTS.regular, lineHeight: 22, marginBottom: SPACING.lg,
  },
  rsvpSection: {
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md,
    marginBottom: SPACING.xxl + SPACING.xxl,
  },
  rsvpConfirm: {
    fontSize: 14, color: COLORS.green, ...FONTS.medium, textAlign: 'center', marginTop: SPACING.sm,
  },
});

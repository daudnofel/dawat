import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Share, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { RsvpStatus, GenderMode } from '../../types';
import { supabase } from '../../lib/supabase';
import RsvpButtons from '../../components/RsvpButtons';
import { getThemeById } from '../../lib/themes';

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  theme_id: string;
  gender_mode: GenderMode;
  date_time: string | null;
  date_tbd: boolean;
  location_name: string | null;
  location_address: string | null;
  is_location_hidden: boolean;
  is_halal_venue: boolean;
  price: number;
  capacity: number | null;
  slug: string;
  host_id: string;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null);
  const [yesCount, setYesCount] = useState(0);
  const [inshallahCount, setInshallahCount] = useState(0);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setEvent(data as EventDetail);
    }

    // Fetch RSVP counts
    const { count: yc } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('status', 'yes');

    const { count: ic } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('status', 'inshallah');

    setYesCount(yc ?? 0);
    setInshallahCount(ic ?? 0);

    // Check current user's RSVP
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: rsvp } = await supabase
        .from('rsvps')
        .select('status')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();

      if (rsvp) {
        setRsvpStatus(rsvp.status as RsvpStatus);
      }
    }

    setLoading(false);
  };

  const handleRsvp = async (status: RsvpStatus) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to RSVP.');
      return;
    }

    const { error } = await supabase.from('rsvps').upsert({
      event_id: id,
      user_id: user.id,
      status,
    }, { onConflict: 'event_id,user_id' });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setRsvpStatus(status);
    fetchEvent(); // Refresh counts
  };

  const handleShare = () => {
    if (event) {
      Share.share({ message: `Check out ${event.title} on Dawat: dawatapp.com/e/${event.slug}` });
    }
  };

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  const theme = getThemeById(event.theme_id);
  const genderLabel = {
    [GenderMode.Mixed]: '🌟 Mixed',
    [GenderMode.SistersOnly]: '🌸 Sisters Only',
    [GenderMode.BrothersOnly]: '💪 Brothers',
    [GenderMode.Family]: '👨‍👩‍👧 Family',
  }[event.gender_mode];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Pressable onPress={handleShare}>
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
        </View>

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
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.attendance}>
            {yesCount} confirmed · {inshallahCount} Inshallah
          </Text>
          {event.capacity && (
            <View style={styles.capacityBar}>
              <View style={[styles.capacityFill, { width: `${Math.min((yesCount / event.capacity) * 100, 100)}%` }]} />
            </View>
          )}

          <View style={styles.infoCard}>
            <InfoRow icon="📅" text={event.date_tbd ? 'Date TBD' : (event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBD')} />
            {event.date_time && <InfoRow icon="⏰" text={new Date(event.date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} />}
            <InfoRow icon="📍" text={event.is_location_hidden ? 'Address revealed on RSVP' : (event.location_name ?? 'Location TBD')} />
            <InfoRow icon="💵" text={event.price === 0 ? 'Free' : `$${(event.price / 100).toFixed(2)}`} />
            {event.is_halal_venue && <InfoRow icon="✅" text="Halal venue" />}
          </View>

          {event.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}

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
  banner: { height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bannerEmoji: { fontSize: 56 },
  badgeRow: { position: 'absolute', bottom: SPACING.md, left: SPACING.lg, flexDirection: 'row', gap: SPACING.sm },
  genderBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  genderBadgeText: { color: COLORS.white, fontSize: 12, ...FONTS.medium },
  halalBadge: { backgroundColor: 'rgba(76,175,80,0.2)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  halalBadgeText: { color: COLORS.green, fontSize: 12, ...FONTS.medium },
  body: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  title: { fontSize: 24, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.sm },
  attendance: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, marginBottom: SPACING.sm },
  capacityBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: SPACING.lg },
  capacityFill: { height: 4, backgroundColor: COLORS.gold, borderRadius: 2 },
  infoCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.lg, gap: SPACING.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  infoIcon: { fontSize: 16 },
  infoText: { fontSize: 14, color: COLORS.white, ...FONTS.regular, flex: 1 },
  description: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, lineHeight: 22, marginBottom: SPACING.lg },
  rsvpSection: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md, marginBottom: SPACING.xxl + SPACING.xxl },
  rsvpConfirm: { fontSize: 14, color: COLORS.green, ...FONTS.medium, textAlign: 'center', marginTop: SPACING.sm },
});

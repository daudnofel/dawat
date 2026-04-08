import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { RsvpStatus, GenderMode } from '../../types';
import { supabase } from '../../lib/supabase';
import RsvpButtons from '../../components/RsvpButtons';
import FamilyRegistration from '../../components/FamilyRegistration';
import GuestListDashboard from '../../components/GuestListDashboard';
import AddToCalendar from '../../components/AddToCalendar';
import GuestAvatars from '../../components/GuestAvatars';
import MapPreview from '../../components/MapPreview';
import EventComments from '../../components/EventComments';
import ShareSheet from '../../components/ShareSheet';
import { getThemeById } from '../../lib/themes';
import { getCurrentUserId } from '../../lib/auth-cache';
import { triggerPush } from '../../lib/push';

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
  rsvp_deadline: string | null;
  virtual_link: string | null;
  allow_plus_ones: boolean;
  max_plus_ones: number;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null);
  const [yesCount, setYesCount] = useState(0);
  const [inshallahCount, setInshallahCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [guestRefreshKey, setGuestRefreshKey] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  useEffect(() => {
    fetchEvent();
    if (id) {
      // Log view to event_views table (fire-and-forget) for recently viewed + analytics
      (async () => {
        try {
          const userId = await getCurrentUserId();
          if (userId) {
            await supabase.from('event_views').insert({ event_id: id, user_id: userId });
          }
        } catch {}
      })();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      // Only silently refetch (no loading spinner) after initial load
      if (hasLoaded) {
        fetchEventSilent();
      }
    }, [id, hasLoaded]),
  );

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setEvent(data as EventDetail);
    }

    // Fetch RSVPs with full details to compute headcount
    const { data: allRsvps } = await supabase
      .from('rsvps')
      .select('status, children_count, plus_one_names')
      .eq('event_id', id);

    const yesRsvps = (allRsvps ?? []).filter((r) => r.status === 'yes');
    const yesHeadcount = yesRsvps.reduce(
      (sum, r) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0), 0
    );
    const ic = (allRsvps ?? []).filter((r) => r.status === 'inshallah').length;
    const wc = (allRsvps ?? []).filter((r) => r.status === 'waitlist').length;

    setYesCount(yesHeadcount);
    setInshallahCount(ic);
    setWaitlistCount(wc);

    // Check current user's RSVP and host status
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (data) setIsHost(data.host_id === user.id);

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
    setHasLoaded(true);
  };

  // Re-fetch data without showing loading spinner (for focus returns)
  const fetchEventSilent = async () => {
    const { data } = await supabase.from('events').select('*').eq('id', id).single();
    if (data) setEvent(data as EventDetail);

    const { data: allRsvps } = await supabase
      .from('rsvps')
      .select('status, children_count, plus_one_names')
      .eq('event_id', id);
    const yesRsvps = (allRsvps ?? []).filter((r) => r.status === 'yes');
    const yesHeadcount = yesRsvps.reduce(
      (sum, r) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0), 0
    );
    setYesCount(yesHeadcount);
    setInshallahCount((allRsvps ?? []).filter((r) => r.status === 'inshallah').length);
    setWaitlistCount((allRsvps ?? []).filter((r) => r.status === 'waitlist').length);
    setGuestRefreshKey((k) => k + 1);
  };

  const handleRsvp = async (status: RsvpStatus) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      Alert.alert('Sign in required', 'Please sign in to RSVP.');
      return;
    }

    // Tapping the same option again = de-select (remove RSVP)
    if (rsvpStatus === status) {
      const prevStatus = rsvpStatus;
      setRsvpStatus(null); // Optimistic
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', id)
        .eq('user_id', userId);

      if (error) {
        setRsvpStatus(prevStatus); // Revert
        Alert.alert('Error', 'Could not remove RSVP');
        return;
      }
      setGuestRefreshKey((k) => k + 1);
      fetchEventSilent();
      return;
    }

    // Check RSVP deadline
    if (event?.rsvp_deadline && new Date(event.rsvp_deadline) < new Date()) {
      Alert.alert('RSVP Closed', 'The RSVP deadline for this event has passed.');
      return;
    }

    // If tapping "Yes" and event is at capacity → waitlist
    // Capacity counts total headcount: yes RSVPs + their children + their plus-ones
    const { data: yesRsvps } = await supabase
      .from('rsvps')
      .select('children_count, plus_one_names')
      .eq('event_id', id)
      .eq('status', 'yes');
    const totalHeadcount = (yesRsvps ?? []).reduce(
      (sum, r) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0), 0
    );
    if (status === RsvpStatus.Yes && event?.capacity && totalHeadcount >= event.capacity && rsvpStatus !== RsvpStatus.Yes) {
      Alert.alert(
        'Event Full',
        'This event is at capacity. Would you like to join the waitlist?',
        [
          { text: 'No thanks' },
          {
            text: 'Join Waitlist',
            onPress: async () => {
              setRsvpStatus(RsvpStatus.Waitlist); // Optimistic
              await saveRsvp(userId, RsvpStatus.Waitlist, 0, []);
            },
          },
        ],
      );
      return;
    }

    // If tapping "Yes", show family/+1 modal before saving
    if (status === RsvpStatus.Yes) {
      setPendingUserId(userId);
      setShowFamilyModal(true);
      return;
    }

    // For Inshallah / No, save directly with optimistic update
    const prevStatus = rsvpStatus;
    setRsvpStatus(status); // Optimistic
    await saveRsvp(userId, status, 0, []);
  };

  const saveRsvp = async (
    userId: string,
    status: RsvpStatus,
    childrenCount: number,
    plusOneNames: string[],
  ) => {
    await supabase
      .from('rsvps')
      .delete()
      .eq('event_id', id)
      .eq('user_id', userId);

    const { error } = await supabase
      .from('rsvps')
      .insert({
        event_id: id,
        user_id: userId,
        status,
        children_count: childrenCount,
        plus_one_names: plusOneNames.length > 0 ? plusOneNames : [],
      });

    if (error) {
      Alert.alert('Error', 'Could not save RSVP');
      return;
    }

    setRsvpStatus(status);
    setGuestRefreshKey((k) => k + 1);
    fetchEventSilent();

    // Push notification to host (fire-and-forget) — only on Yes / Inshallah
    if (event && event.host_id !== userId && (status === RsvpStatus.Yes || status === RsvpStatus.Inshallah)) {
      void (async () => {
        const { data: guest } = await supabase.from('users').select('display_name').eq('id', userId).single();
        const guestName = guest?.display_name?.split(' ')[0] ?? 'Someone';
        const statusLabel = status === RsvpStatus.Yes ? 'is going' : 'said Inshallah';
        await triggerPush(
          event.host_id,
          `${guestName} ${statusLabel}`,
          event.title,
          { type: 'rsvp', event_id: id },
        );
      })();
    }
  };

  const handleFamilySubmit = async (childrenCount: number, plusOneNames: string[]) => {
    setShowFamilyModal(false);
    if (!pendingUserId) return;

    // Check if adding this group would exceed capacity
    if (event?.capacity) {
      const { data: yesRsvps } = await supabase
        .from('rsvps')
        .select('children_count, plus_one_names')
        .eq('event_id', id)
        .eq('status', 'yes');
      const currentHeadcount = (yesRsvps ?? []).reduce(
        (sum, r) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0), 0
      );
      const newGroupSize = 1 + childrenCount + plusOneNames.length;
      if (currentHeadcount + newGroupSize > event.capacity) {
        Alert.alert(
          'Not enough spots',
          `Only ${event.capacity - currentHeadcount} spots left, but your group is ${newGroupSize}. Try reducing your group size or join the waitlist.`,
        );
        return;
      }
    }

    setRsvpStatus(RsvpStatus.Yes);
    saveRsvp(pendingUserId, RsvpStatus.Yes, childrenCount, plusOneNames);
    setPendingUserId(null);
  };

  const handleFamilySkip = () => {
    setShowFamilyModal(false);
    if (pendingUserId) {
      setRsvpStatus(RsvpStatus.Yes); // Optimistic
      saveRsvp(pendingUserId, RsvpStatus.Yes, 0, []);
      setPendingUserId(null);
    }
  };

  const handleEdit = () => {
    router.push(`/event/edit/${id}`);
  };

  const handleCancelEvent = () => {
    Alert.alert(
      'Cancel Event',
      'Are you sure? All guests will see this event as cancelled. This cannot be undone.',
      [
        { text: 'Keep Event', style: 'cancel' },
        {
          text: 'Cancel Event',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('events')
              .update({ is_cancelled: true, updated_at: new Date().toISOString() })
              .eq('id', id);

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            // Push notification to all RSVPd guests (fire-and-forget)
            void (async () => {
              const { data: rsvps } = await supabase
                .from('rsvps')
                .select('user_id')
                .eq('event_id', id)
                .in('status', ['yes', 'inshallah', 'waitlist']);
              const userIds = (rsvps ?? []).map((r) => r.user_id).filter(Boolean) as string[];
              for (const uid of userIds) {
                await triggerPush(
                  uid,
                  'Event cancelled',
                  event?.title ?? 'An event you RSVPd to was cancelled',
                  { type: 'event_cancelled', event_id: id },
                );
              }
            })();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Event Cancelled', 'This event has been cancelled.');
            router.back();
          },
        },
      ],
    );
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowShareSheet(true);
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

        <View style={styles.banner}>
          <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="detailGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={theme?.bannerBg ?? COLORS.card2} />
                <Stop offset="1" stopColor={COLORS.card} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#detailGrad)" />
          </Svg>
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
          <GuestAvatars eventId={id!} refreshKey={guestRefreshKey} />
          <Text style={styles.attendance}>
            {yesCount} confirmed · {inshallahCount} Inshallah{waitlistCount > 0 ? ` · ${waitlistCount} waitlisted` : ''}
          </Text>
          {event.capacity && (
            <View style={styles.capacityBar}>
              <View style={[styles.capacityFill, { width: `${Math.min((yesCount / event.capacity) * 100, 100)}%` }]} />
            </View>
          )}

          <View style={styles.infoCard}>
            <InfoRow icon="📅" text={event.date_tbd ? 'Date TBD' : (event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBD')} />
            {event.date_time && <InfoRow icon="⏰" text={new Date(event.date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} />}
            <InfoRow icon="📍" text={event.is_location_hidden && !isHost && rsvpStatus !== RsvpStatus.Yes ? 'Address revealed after RSVP' : (event.location_name ?? 'Location TBD')} />
            <InfoRow icon="💵" text={event.price === 0 ? 'Free' : `$${(event.price / 100).toFixed(2)}`} />
            {event.is_halal_venue && <InfoRow icon="✅" text="Halal venue" />}
            {event.virtual_link && <InfoRow icon="🔗" text="Virtual event — link available" />}
            {event.rsvp_deadline && (
              <InfoRow icon="⏳" text={`RSVP by ${new Date(event.rsvp_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`} />
            )}
            {event.allow_plus_ones && (
              <InfoRow icon="👥" text={`Plus-ones allowed (up to ${event.max_plus_ones})`} />
            )}
          </View>

          <MapPreview
            locationName={event.location_name}
            locationAddress={event.location_address}
            isHidden={event.is_location_hidden && !isHost && rsvpStatus !== RsvpStatus.Yes}
          />

          <AddToCalendar
            title={event.title}
            dateTime={event.date_time}
            locationName={event.location_name}
            description={event.description}
          />

          {event.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}

          <View style={styles.rsvpSection}>
            <RsvpButtons currentStatus={rsvpStatus} onSelect={handleRsvp} />
          </View>

          <GuestListDashboard eventId={id!} visible={isHost} refreshKey={guestRefreshKey} />

          <EventComments eventId={id!} hostId={event.host_id} />

          {isHost && (
            <View style={styles.hostActions}>
              <Pressable
                style={({ pressed }) => [styles.editButton, pressed && { transform: [{ scale: 0.97 }] }]}
                onPress={handleEdit}
              >
                <Text style={styles.editButtonText}>Edit Event</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.cancelEventButton, pressed && { transform: [{ scale: 0.97 }] }]}
                onPress={handleCancelEvent}
              >
                <Text style={styles.cancelEventText}>Cancel Event</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <FamilyRegistration
        visible={showFamilyModal}
        maxGuests={event?.allow_plus_ones ? (event?.max_plus_ones ?? 0) : 10}
        onSubmit={handleFamilySubmit}
        onSkip={handleFamilySkip}
      />

      {event && (
        <ShareSheet
          visible={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          eventTitle={event.title}
          eventSlug={event.slug}
        />
      )}
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
  hostActions: {
    marginTop: SPACING.xl, paddingTop: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: SPACING.sm, marginBottom: SPACING.xxl + SPACING.xxl,
  },
  editButton: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, alignItems: 'center',
  },
  editButtonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
  cancelEventButton: {
    backgroundColor: 'transparent', borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.red,
  },
  cancelEventText: { color: COLORS.red, fontSize: 14, ...FONTS.medium },
});

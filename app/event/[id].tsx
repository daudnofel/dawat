import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING } from '../../lib/theme';
import SkeletonCard from '../../components/SkeletonCard';
import { Toast } from '../../components/Toast';
import { RsvpStatus, GenderMode } from '../../types';
import { supabase } from '../../lib/supabase';
import RsvpButtons from '../../components/RsvpButtons';
import FamilyRegistration from '../../components/FamilyRegistration';
import GuestListDashboard from '../../components/GuestListDashboard';
import GuestAvatars from '../../components/GuestAvatars';
import MapPreview from '../../components/MapPreview';
import EventComments from '../../components/EventComments';
import ShareSheet from '../../components/ShareSheet';
import EventPreview from '../../components/EventPreview';
import { getThemeById } from '../../lib/themes';
import { getCurrentUserId } from '../../lib/auth-cache';
import { triggerPush } from '../../lib/push';

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  theme_id: string;
  poster_url: string | null;
  poster_type: string | null;
  effect_id: string | null;
  title_style: string | null;
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

  // Silence unused-var warning: waitlistCount is fetched for parity with the
  // original implementation; future work can surface it in the guest section.
  void waitlistCount;

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
      Toast.error('Please sign in to RSVP.');
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
        Toast.error('Could not remove RSVP');
        return;
      }
      setGuestRefreshKey((k) => k + 1);
      fetchEventSilent();
      return;
    }

    // Check RSVP deadline
    if (event?.rsvp_deadline && new Date(event.rsvp_deadline) < new Date()) {
      Toast.error('The RSVP deadline for this event has passed.');
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
      Toast.error('Could not save RSVP');
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
              Toast.error(error.message);
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
            Toast.info('This event has been cancelled.');
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
        <View style={{ paddingHorizontal: 24, paddingTop: 100 }}>
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  const theme = getThemeById(event.theme_id);
  const pageBg = theme?.background?.stops?.[0] ?? theme?.bannerBg ?? COLORS.dark;
  const barTextColor = theme?.textColor ?? COLORS.white;
  const guestHeadingColor = theme?.textColor ?? COLORS.white;
  const attendanceColor = theme?.textColor ? `${theme.textColor}88` : COLORS.muted;

  // DAW-37 — the old inline render body (topBar + hero + body + guest list +
  // comments) is now assembled via EventPreview + slots. EventPreview owns the
  // background gradient, effect overlay, hero, and info rows; this screen
  // injects the live-data pieces (top bar, guest avatars, map, guest list,
  // comments) as slots so the public page stays visually identical while the
  // new editor can reuse the exact same canvas.
  const topBarJsx = (
    <View style={styles.topBar}>
      <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
        <Text style={[styles.backText, { color: barTextColor }]}>← Back</Text>
      </Pressable>
      <View style={styles.topBarRight}>
        <Pressable onPress={handleShare}>
          <Text style={[styles.shareText, { color: barTextColor }]}>Share</Text>
        </Pressable>
        {isHost && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Manage Event', '', [
                { text: 'Edit Event', onPress: handleEdit },
                { text: 'Cancel Event', style: 'destructive', onPress: handleCancelEvent },
                { text: 'Close', style: 'cancel' },
              ]);
            }}
          >
            <Text style={[styles.moreButton, { color: barTextColor }]}>⋯</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const hostedBySlotJsx = (
    <GuestAvatars eventId={id!} refreshKey={guestRefreshKey} />
  );

  const mapSlotJsx = (
    <MapPreview
      locationName={event.location_name}
      locationAddress={event.location_address}
      isHidden={event.is_location_hidden && !isHost && rsvpStatus !== RsvpStatus.Yes}
    />
  );

  const attendanceText =
    yesCount === 0 && inshallahCount === 0
      ? 'No guests yet'
      : [
          yesCount > 0 ? `${yesCount} Going` : null,
          inshallahCount > 0 ? `${inshallahCount} Inshallah` : null,
        ]
          .filter(Boolean)
          .join(' · ');

  const afterBodySlotJsx = (
    <>
      <View style={styles.guestSection}>
        <Text style={[styles.guestHeading, { color: guestHeadingColor }]}>Guest List</Text>
        <Text style={[styles.attendance, { color: attendanceColor }]}>{attendanceText}</Text>
      </View>

      <GuestListDashboard eventId={id!} visible={isHost} refreshKey={guestRefreshKey} />

      <EventComments eventId={id!} hostId={event.host_id} />

      {/* Bottom spacer so content clears the floating RSVP bar */}
      <View style={{ height: 100 }} />
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: pageBg }]} edges={['top']}>
      <EventPreview
        data={{
          title: event.title,
          description: event.description,
          theme_id: event.theme_id,
          poster_url: event.poster_url,
          effect_id: event.effect_id,
          title_style: event.title_style ?? null,
          gender_mode: event.gender_mode,
          date_time: event.date_time,
          date_tbd: event.date_tbd,
          location_name: event.location_name,
          location_address: event.location_address,
          is_location_hidden: event.is_location_hidden,
          is_halal_venue: event.is_halal_venue,
          price: event.price,
          capacity: event.capacity,
          rsvp_deadline: event.rsvp_deadline,
        }}
        topBar={topBarJsx}
        hostedBySlot={hostedBySlotJsx}
        mapSlot={mapSlotJsx}
        afterBodySlot={afterBodySlotJsx}
        revealLocation={isHost || rsvpStatus === RsvpStatus.Yes}
        yesCount={yesCount}
      />

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

      {/* Floating RSVP bar — pinned to the bottom, always visible like Partiful */}
      <View style={styles.floatingRsvp}>
        <RsvpButtons currentStatus={rsvpStatus} onSelect={handleRsvp} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark, position: 'relative' },
  floatingRsvp: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl + SPACING.lg,
    paddingTop: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  backText: { fontSize: 16, ...FONTS.medium },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  shareText: { fontSize: 16, ...FONTS.medium },
  moreButton: { fontSize: 22, ...FONTS.bold, letterSpacing: 2 },

  // Guest section (rendered via afterBodySlot inside EventPreview)
  guestSection: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  guestHeading: {
    fontSize: 20,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  attendance: {
    fontSize: 15,
    ...FONTS.regular,
    marginBottom: SPACING.md,
  },
});

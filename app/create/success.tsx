import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/auth-cache';
import { triggerPush } from '../../lib/push';
import { generateSlug } from '../../lib/slugify';
import AnimatedPress from '../../components/AnimatedPress';
import { Toast } from '../../components/Toast';

export default function SuccessScreen({ onDone, publishedSlug }: { onDone?: () => void; publishedSlug?: string | null }) {
  const { draft, reset } = useEventStore();
  const confettiRef = useRef<any>(null);
  const router = useRouter();

  // DAW-47: Import guests from past event
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  // Use the actual slug from publish (passed via props), not a regenerated one
  const slug = publishedSlug || generateSlug(draft.title || 'event');
  const link = `https://dawat.app/e/${slug}`;
  const shareMessage = `You're invited to ${draft.title} on Dawat!\n${link}`;

  // Entrance animations
  const emojiScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    emojiScale.value = withSpring(1, { damping: 8, stiffness: 150 });
    titleOpacity.value = withDelay(200, withSpring(1));
    contentOpacity.value = withDelay(400, withSpring(1));
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const handleShareLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({ message: shareMessage, url: link });
  };

  const handleCopyLink = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(link);
    Toast.success('Link copied to clipboard');
  };

  const handleWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`).catch(() => {
      Toast.error('WhatsApp is not installed on this device');
    });
  };

  const handleViewEvent = () => {
    reset();
    router.replace('/(tabs)');
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    onDone?.();
  };

  // DAW-47: Fetch host's past events for guest import
  const handleShowPastEvents = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPastEvents(true);
    setLoadingPast(true);

    const userId = await getCurrentUserId();
    if (!userId) { setLoadingPast(false); return; }

    const { data } = await supabase
      .from('events')
      .select('id, title, date_time, slug')
      .eq('host_id', userId)
      .eq('is_published', true)
      .neq('slug', slug) // exclude the event we just created
      .order('created_at', { ascending: false })
      .limit(10);

    setPastEvents(data ?? []);
    setLoadingPast(false);
  };

  // DAW-47: Import guests from selected past event
  const handleImportGuests = async (pastEventId: string, pastEventTitle: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setImporting(true);

    const userId = await getCurrentUserId();
    if (!userId) { setImporting(false); return; }

    // Find the new event's ID by slug
    const { data: newEvent } = await supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!newEvent) {
      Toast.error('Could not find the new event');
      setImporting(false);
      return;
    }

    // Fetch yes + inshallah RSVPs from the past event
    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('user_id')
      .eq('event_id', pastEventId)
      .in('status', ['yes', 'inshallah']);

    const guestIds = (rsvps ?? [])
      .map((r: any) => r.user_id)
      .filter((id: string | null) => id && id !== userId) as string[];

    if (guestIds.length === 0) {
      Toast.info(`${pastEventTitle} had no confirmed guests to import`);
      setImporting(false);
      return;
    }

    // Insert invites (ignore duplicates)
    const invites = guestIds.map((guestId) => ({
      event_id: newEvent.id,
      invited_user_id: guestId,
      invited_by: userId,
    }));

    await supabase
      .from('event_invites')
      .upsert(invites, { onConflict: 'event_id,invited_user_id' })
      .select();

    // Send push to each invited guest (fire-and-forget)
    for (const guestId of guestIds) {
      void triggerPush(guestId, 'You\'re invited!', `${draft.title} — tap to check it out`, {
        type: 'event_invite',
        event_id: newEvent.id,
      });
    }

    setImporting(false);
    setImported(true);
    Toast.success(`${guestIds.length} guest${guestIds.length === 1 ? '' : 's'} invited from ${pastEventTitle}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Close / X button — resets and goes back to step 1 */}
      <Pressable
        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
        onPress={handleClose}
        hitSlop={16}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </Pressable>

      <ConfettiCannon
        ref={confettiRef}
        count={80}
        origin={{ x: -10, y: 0 }}
        autoStart
        fadeOut
        colors={[COLORS.gold, COLORS.gold2, '#FFFFFF', COLORS.amber]}
      />

      <View style={styles.content}>
        <Animated.Text style={[styles.confettiEmoji, emojiStyle]}>🎉</Animated.Text>
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>You're live!</Text>
          <Text style={styles.subtitle}>Your event is ready to share</Text>
        </Animated.View>

        <Animated.View style={[styles.actions, contentStyle]}>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
          </View>

          <AnimatedPress style={styles.copyButton} haptic="medium" onPress={handleCopyLink}>
            <Text style={styles.copyText}>Copy Link</Text>
          </AnimatedPress>

          <AnimatedPress style={styles.shareButton} haptic="medium" onPress={handleShareLink}>
            <Text style={styles.shareText}>Share Link</Text>
          </AnimatedPress>

          <AnimatedPress style={styles.whatsappButton} haptic="medium" onPress={handleWhatsApp}>
            <Text style={styles.whatsappText}>Share to WhatsApp</Text>
          </AnimatedPress>

          {/* DAW-47: Import guests from past event */}
          {!imported && !showPastEvents && (
            <AnimatedPress style={styles.importButton} haptic="light" onPress={handleShowPastEvents}>
              <Text style={styles.importText}>📋 Import guests from a past event</Text>
            </AnimatedPress>
          )}

          {showPastEvents && !imported && (
            <View style={styles.pastEventsBox}>
              <Text style={styles.pastEventsTitle}>Select a past event</Text>
              {loadingPast ? (
                <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: SPACING.lg }} />
              ) : pastEvents.length === 0 ? (
                <Text style={styles.pastEventsEmpty}>No past events found</Text>
              ) : (
                <ScrollView style={styles.pastEventsList} nestedScrollEnabled>
                  {pastEvents.map((ev: any) => (
                    <Pressable
                      key={ev.id}
                      style={({ pressed }) => [styles.pastEventRow, pressed && { opacity: 0.7 }]}
                      onPress={() => handleImportGuests(ev.id, ev.title)}
                      disabled={importing}
                    >
                      <Text style={styles.pastEventTitle} numberOfLines={1}>{ev.title}</Text>
                      <Text style={styles.pastEventDate}>
                        {ev.date_time ? new Date(ev.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
              {importing && <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: SPACING.sm }} />}
            </View>
          )}

          {imported && (
            <View style={styles.importedBadge}>
              <Text style={styles.importedText}>✓ Guests imported & notified</Text>
            </View>
          )}

          <AnimatedPress style={styles.viewButton} onPress={handleViewEvent}>
            <Text style={styles.viewText}>Go to Home</Text>
          </AnimatedPress>
        </Animated.View>

        <Text style={styles.footer}>JazakAllah khair for using Dawat 🤲</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  closeButton: {
    position: 'absolute',
    top: SPACING.xxl + SPACING.xl,
    right: SPACING.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  closeIcon: {
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.bold,
    lineHeight: 18,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  confettiEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  title: { fontSize: 28, color: COLORS.white, ...FONTS.bold, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: 16, color: COLORS.muted, ...FONTS.regular, textAlign: 'center', marginBottom: SPACING.xxl },
  actions: { width: '100%' },
  linkBox: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    width: '100%', marginBottom: SPACING.lg,
  },
  linkText: { color: COLORS.gold, fontSize: 15, ...FONTS.medium, textAlign: 'center' },
  copyButton: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center', marginBottom: SPACING.md,
  },
  copyText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
  shareButton: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center', marginBottom: SPACING.md,
  },
  shareText: { color: COLORS.white, fontSize: 16, ...FONTS.semibold },
  whatsappButton: {
    backgroundColor: '#25D366', borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center', marginBottom: SPACING.md,
  },
  whatsappText: { color: COLORS.white, fontSize: 16, ...FONTS.bold },
  viewButton: {
    borderRadius: RADIUS.md, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center', marginBottom: SPACING.xxl,
  },
  viewText: { color: COLORS.white, fontSize: 16, ...FONTS.medium },
  // DAW-47: Import guests
  importButton: {
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.15)',
    paddingVertical: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  importText: { color: COLORS.gold, fontSize: 14, ...FONTS.medium },
  pastEventsBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    width: '100%',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    maxHeight: 200,
  },
  pastEventsTitle: {
    color: COLORS.white,
    fontSize: 14,
    ...FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  pastEventsEmpty: { color: COLORS.hint, fontSize: 13, ...FONTS.regular, textAlign: 'center' },
  pastEventsList: { maxHeight: 160 },
  pastEventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
  },
  pastEventTitle: { color: COLORS.white, fontSize: 14, ...FONTS.medium, flex: 1, marginRight: SPACING.md },
  pastEventDate: { color: COLORS.muted, fontSize: 12, ...FONTS.regular },
  importedBadge: {
    backgroundColor: `${COLORS.green}20`,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  importedText: { color: COLORS.green, fontSize: 14, ...FONTS.semibold },

  footer: { color: COLORS.hint, fontSize: 13, ...FONTS.regular },
});

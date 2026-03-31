import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/auth-cache';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  event_id: string | null;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_EMOJI: Record<string, string> = {
  rsvp: '✅',
  comment: '💬',
  event_update: '📝',
  event_cancelled: '❌',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    let userId = await getCurrentUserId();
    if (!userId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, event_id, actor_id, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications((data as NotificationItem[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading) fetchNotifications();
    }, [fetchNotifications]),
  );

  // Initial load
  useState(() => { fetchNotifications(); });

  const handlePress = async (notification: NotificationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark as read
    if (!notification.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);

      setNotifications((prev) =>
        prev.map((n) => n.id === notification.id ? { ...n, is_read: true } : n),
      );
    }

    // Navigate to event if linked
    if (notification.event_id) {
      router.push(`/event/${notification.event_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let userId = await getCurrentUserId();
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }
    if (!userId) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor={COLORS.gold} />}
      >
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && notifications.length === 0 && (
          <EmptyState emoji="🔔" title="No notifications" subtitle="You'll see updates about your events here" />
        )}

        {!loading && notifications.map((notification) => (
          <Pressable
            key={notification.id}
            style={({ pressed }) => [
              styles.notificationRow,
              !notification.is_read && styles.unreadRow,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handlePress(notification)}
          >
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{TYPE_EMOJI[notification.type] ?? '🔔'}</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, !notification.is_read && styles.unreadText]}>
                {notification.title}
              </Text>
              <Text style={styles.notificationBody} numberOfLines={2}>
                {notification.body}
              </Text>
              <Text style={styles.notificationTime}>{formatTime(notification.created_at)}</Text>
            </View>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  markAllRead: { fontSize: 13, color: COLORS.gold, ...FONTS.medium },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
  notificationRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  unreadRow: {
    backgroundColor: `${COLORS.gold}08`,
    marginHorizontal: -SPACING.xl,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.sm,
  },
  emojiCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 18 },
  notificationContent: { flex: 1 },
  notificationTitle: {
    fontSize: 14, color: COLORS.muted, ...FONTS.medium,
  },
  unreadText: { color: COLORS.white, ...FONTS.semibold },
  notificationBody: {
    fontSize: 13, color: COLORS.muted, ...FONTS.regular,
    marginTop: 2, lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11, color: COLORS.hint, ...FONTS.regular,
    marginTop: 4,
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
});

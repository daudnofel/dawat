import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/auth-cache';
import {
  fetchInbox,
  getSuggestedBoopUsers,
  sendBoop,
} from '../lib/messaging';
import { ConversationWithMeta, BoopSuggestion } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function InboxScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [boopSuggestions, setBoopSuggestions] = useState<BoopSuggestion[]>([]);
  const [boopedIds, setBoopedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    setCurrentUserId(userId);
    const [convs, suggestions] = await Promise.all([
      fetchInbox(userId),
      getSuggestedBoopUsers(userId),
    ]);
    setConversations(convs);
    setBoopSuggestions(suggestions);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  const handleBoop = async (recipientId: string) => {
    if (!currentUserId || boopedIds.has(recipientId)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBoopedIds((prev) => new Set(prev).add(recipientId));
    await sendBoop(currentUserId, recipientId);
  };

  const formatTime = (iso: string): string => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Atmosphere */}
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={400} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="inboxGlow" cx="50%" cy="0%" rx="70%" ry="80%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.18" />
              <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.08" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={400} fill="url(#inboxGlow)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          >
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Pressable
            style={styles.iconButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/chat/new'); }}
          >
            <Text style={styles.iconText}>✎</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {/* Boops */}
            {boopSuggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Boops</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.boopRow}
                >
                  {boopSuggestions.map((user) => {
                    const booped = boopedIds.has(user.id);
                    const initial = (user.display_name ?? '?').charAt(0).toUpperCase();
                    return (
                      <Pressable
                        key={user.id}
                        style={({ pressed }) => [styles.boopCard, pressed && { opacity: 0.85 }]}
                        onPress={() => handleBoop(user.id)}
                      >
                        <View style={styles.boopAvatarOuter}>
                          {user.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.boopAvatar} />
                          ) : (
                            <View style={[styles.boopAvatar, styles.boopAvatarPlaceholder]}>
                              <Text style={styles.boopAvatarInitial}>{initial}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.boopName} numberOfLines={1}>
                          {user.display_name?.split(' ')[0] ?? 'Guest'}
                        </Text>
                        <Text style={[styles.boopLabel, booped && { color: COLORS.gold }]}>
                          {booped ? 'Booped 👋' : 'Suggested'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Messages */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Messages</Text>
              {conversations.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyEmoji}>😬</Text>
                  <Text style={styles.emptyTitle}>Your inbox is empty</Text>
                  <Text style={styles.emptySubtitle}>You can change that right now</Text>
                  <Pressable
                    style={({ pressed }) => [styles.newMessageBtn, pressed && { opacity: 0.85 }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/chat/new'); }}
                  >
                    <Text style={styles.newMessageText}>✎  New message</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.convList}>
                  {conversations.map((conv) => {
                    const initial = (conv.other_user.display_name ?? '?').charAt(0).toUpperCase();
                    const preview = conv.last_message?.body ?? 'No messages yet';
                    return (
                      <Pressable
                        key={conv.id}
                        style={({ pressed }) => [styles.convRow, pressed && { opacity: 0.85 }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/chat/${conv.id}`); }}
                      >
                        <View style={styles.convAvatarWrap}>
                          {conv.other_user.avatar_url ? (
                            <Image source={{ uri: conv.other_user.avatar_url }} style={styles.convAvatar} />
                          ) : (
                            <View style={[styles.convAvatar, styles.boopAvatarPlaceholder]}>
                              <Text style={styles.convAvatarInitial}>{initial}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.convBody}>
                          <View style={styles.convTopRow}>
                            <Text style={styles.convName} numberOfLines={1}>
                              {conv.other_user.display_name ?? 'Guest'}
                            </Text>
                            <Text style={styles.convTime}>
                              {conv.last_message ? formatTime(conv.last_message.created_at) : ''}
                            </Text>
                          </View>
                          <Text style={[styles.convPreview, conv.unread_count > 0 && styles.convPreviewUnread]} numberOfLines={1}>
                            {preview}
                          </Text>
                        </View>
                        {conv.unread_count > 0 && (
                          <View style={styles.unreadDot} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  safeArea: { flex: 1 },
  atmosphereLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  glowSvg: { position: 'absolute', top: 0, left: 0 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    color: COLORS.white,
    ...FONTS.medium,
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.semibold,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sections
  section: {
    marginTop: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },

  // Boops
  boopRow: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  boopCard: {
    alignItems: 'center',
    width: 80,
  },
  boopAvatarOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 2,
    backgroundColor: 'rgba(255, 223, 161, 0.20)',
    marginBottom: SPACING.sm,
  },
  boopAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  boopAvatarPlaceholder: {
    backgroundColor: COLORS.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boopAvatarInitial: {
    fontSize: 24,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  boopName: {
    fontSize: 13,
    color: COLORS.white,
    ...FONTS.semibold,
    textAlign: 'center',
  },
  boopLabel: {
    fontSize: 11,
    color: COLORS.muted,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: 1,
  },

  // Messages list
  convList: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
  },
  convAvatarWrap: {
    width: 48,
    height: 48,
  },
  convAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  convAvatarInitial: {
    fontSize: 18,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  convBody: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  convName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semibold,
  },
  convTime: {
    fontSize: 12,
    color: COLORS.hint,
    ...FONTS.regular,
    marginLeft: SPACING.sm,
  },
  convPreview: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
  },
  convPreviewUnread: {
    color: COLORS.white,
    ...FONTS.medium,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: SPACING.xl,
  },
  newMessageBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
  },
  newMessageText: {
    fontSize: 14,
    color: COLORS.dark,
    ...FONTS.bold,
  },
});

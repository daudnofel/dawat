import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, Modal,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { REACTION_EMOJIS, ReactionEmoji, CommentReaction } from '../types';

// ─── SVG icon: smiley outline + plus ─────────────────────────
// Drawn as a UI icon, not an emoji — reads as an affordance.
function SmileyPlusIcon({ size = 15, color = COLORS.muted }: { size?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
        <Circle cx="9" cy="10" r="1.3" fill={color} />
        <Circle cx="15" cy="10" r="1.3" fill={color} />
        <Path d="M8.5 14.5C9.5 16.5 14.5 16.5 15.5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
      <Svg width={7} height={7} viewBox="0 0 12 12" fill="none">
        <Line x1="6" y1="2" x2="6" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="2" y1="6" x2="10" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  display_name: string | null;
  _pending?: boolean;
}

interface EventCommentsProps {
  eventId: string;
  hostId: string;
}

export default function EventComments({ eventId, hostId }: EventCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);

  const [reactionsMap, setReactionsMap] = useState<Record<string, CommentReaction[]>>({});
  const [pickerCommentId, setPickerCommentId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    fetchUser();
  }, [eventId]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', user.id)
      .single();
    setCurrentUserDisplayName(data?.display_name ?? null);
  };

  const fetchReactions = useCallback(async (commentIds: string[]) => {
    if (commentIds.length === 0) {
      setReactionsMap({});
      return;
    }

    const { data } = await supabase
      .from('comment_reactions')
      .select('id, comment_id, user_id, emoji, created_at')
      .in('comment_id', commentIds);

    const map: Record<string, CommentReaction[]> = {};
    for (const r of data ?? []) {
      if (!map[r.comment_id]) map[r.comment_id] = [];
      map[r.comment_id].push(r as CommentReaction);
    }
    setReactionsMap(map);
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, body, created_at, user_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (!data || data.length === 0) {
      setComments([]);
      setReactionsMap({});
      return;
    }

    const userIds = [...new Set(data.map((c) => c.user_id))];
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', userIds);

    const userMap = new Map(
      (users ?? []).map((u) => [u.id, u.display_name]),
    );

    const mapped = data.map((c) => ({
      ...c,
      display_name: userMap.get(c.user_id) ?? null,
    }));

    setComments(mapped);
    fetchReactions(data.map((c) => c.id));
  };

  const toggleReaction = async (commentId: string, emoji: ReactionEmoji) => {
    if (!currentUserId) {
      Alert.alert('Sign in required', 'Please sign in to react.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPickerCommentId(null);

    const existing = (reactionsMap[commentId] ?? []).find(
      (r) => r.user_id === currentUserId && r.emoji === emoji,
    );

    if (existing) {
      setReactionsMap((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] ?? []).filter((r) => r.id !== existing.id),
      }));

      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        setReactionsMap((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] ?? []), existing],
        }));
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimistic: CommentReaction = {
        id: tempId,
        comment_id: commentId,
        user_id: currentUserId,
        emoji,
        created_at: new Date().toISOString(),
      };

      setReactionsMap((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] ?? []), optimistic],
      }));

      const { data: inserted, error } = await supabase
        .from('comment_reactions')
        .insert({ comment_id: commentId, user_id: currentUserId, emoji })
        .select('id, comment_id, user_id, emoji, created_at')
        .single();

      if (error || !inserted) {
        setReactionsMap((prev) => ({
          ...prev,
          [commentId]: (prev[commentId] ?? []).filter((r) => r.id !== tempId),
        }));
      } else {
        setReactionsMap((prev) => ({
          ...prev,
          [commentId]: (prev[commentId] ?? []).map((r) =>
            r.id === tempId ? (inserted as CommentReaction) : r,
          ),
        }));
      }
    }
  };

  const handleSend = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || sending) return;

    if (!currentUserId) {
      Alert.alert('Sign in required', 'Please sign in to comment.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const tempId = `temp-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      body: trimmed,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      display_name: currentUserDisplayName,
      _pending: true,
    };

    setComments((prev) => [...prev, optimistic]);
    setNewComment('');
    setSending(true);

    const { data: inserted, error } = await supabase
      .from('comments')
      .insert({ event_id: eventId, user_id: currentUserId, body: trimmed })
      .select('id, body, created_at, user_id')
      .single();

    setSending(false);

    if (error || !inserted) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setNewComment(trimmed);
      Alert.alert('Error', 'Could not post comment. Please try again.');
      return;
    }

    setComments((prev) =>
      prev.map((c) =>
        c.id === tempId
          ? { ...inserted, display_name: currentUserDisplayName, _pending: false }
          : c,
      ),
    );
  };

  const handleDelete = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('comments').delete().eq('id', commentId);
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          setReactionsMap((prev) => {
            const next = { ...prev };
            delete next[commentId];
            return next;
          });
        },
      },
    ]);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const canDelete = (comment: Comment) =>
    currentUserId === comment.user_id || currentUserId === hostId;

  // ─── Reaction bar ─────────────────────────────────────────
  const renderReactionBar = (commentId: string, isPending: boolean) => {
    if (isPending) return null;

    const reactions = reactionsMap[commentId] ?? [];

    const grouped: { emoji: ReactionEmoji; count: number; isMine: boolean }[] = [];
    for (const emoji of REACTION_EMOJIS) {
      const matches = reactions.filter((r) => r.emoji === emoji);
      if (matches.length > 0) {
        grouped.push({
          emoji,
          count: matches.length,
          isMine: matches.some((r) => r.user_id === currentUserId),
        });
      }
    }

    return (
      <View style={styles.reactionRow}>
        {grouped.map(({ emoji, count, isMine }) => (
          <Pressable
            key={emoji}
            style={({ pressed }) => [
              styles.reactionPill,
              isMine && styles.reactionPillMine,
              pressed && styles.pillPressed,
            ]}
            onPress={() => toggleReaction(commentId, emoji)}
          >
            <Text style={styles.pillEmoji}>{emoji}</Text>
            <Text style={[styles.pillCount, isMine && styles.pillCountMine]}>
              {count}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.addTrigger,
            pressed && styles.addTriggerPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setPickerCommentId(commentId);
          }}
        >
          <SmileyPlusIcon />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Wall {comments.length > 0 ? `(${comments.length})` : ''}
      </Text>

      {comments.length === 0 && (
        <Text style={styles.emptyText}>No comments yet — be the first!</Text>
      )}

      {comments.map((comment) => {
        const name = comment.display_name || 'Guest';
        const initial = name.charAt(0).toUpperCase();
        const isHost = comment.user_id === hostId;

        return (
          <View key={comment.id}>
            <Pressable
              style={[styles.commentRow, comment._pending && styles.commentPending]}
              onLongPress={() => !comment._pending && canDelete(comment) && handleDelete(comment.id)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.commentBody}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentName}>{name}</Text>
                  {isHost && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>Host</Text>
                    </View>
                  )}
                  <Text style={styles.commentTime}>
                    {comment._pending ? 'Sending…' : formatTime(comment.created_at)}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.body}</Text>
                {renderReactionBar(comment.id, !!comment._pending)}
              </View>
            </Pressable>
          </View>
        );
      })}

      {/* Input */}
      {currentUserId && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Say something..."
            placeholderTextColor={COLORS.hint}
            maxLength={500}
            multiline
          />
          <Pressable
            style={[styles.sendButton, !newComment.trim() && styles.sendDisabled]}
            onPress={handleSend}
            disabled={!newComment.trim() || sending}
          >
            <Text style={styles.sendText}>Post</Text>
          </Pressable>
        </View>
      )}

      {/* ─── Reaction tray ────────────────────────────────── */}
      <Modal
        visible={pickerCommentId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerCommentId(null)}
      >
        <Pressable
          style={styles.trayOverlay}
          onPress={() => setPickerCommentId(null)}
        >
          <Pressable style={styles.traySheet} onPress={() => {}}>
            <View style={styles.trayHandle} />

            <View style={styles.trayGrid}>
              {REACTION_EMOJIS.map((emoji) => {
                const isMine = pickerCommentId
                  ? (reactionsMap[pickerCommentId] ?? []).some(
                      (r) => r.emoji === emoji && r.user_id === currentUserId,
                    )
                  : false;

                return (
                  <Pressable
                    key={emoji}
                    style={({ pressed }) => [
                      styles.trayEmoji,
                      isMine && styles.trayEmojiSelected,
                      pressed && styles.trayEmojiPressed,
                    ]}
                    onPress={() => {
                      if (pickerCommentId) toggleReaction(pickerCommentId, emoji);
                    }}
                  >
                    <Text style={styles.trayEmojiText}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.hint,
    ...FONTS.regular,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },

  // ─── Comment layout ────────────────────────────────
  commentRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  commentPending: {
    opacity: 0.55,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  commentName: {
    fontSize: 13,
    color: COLORS.white,
    ...FONTS.semibold,
  },
  hostBadge: {
    backgroundColor: `${COLORS.gold}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
  },
  hostBadgeText: {
    fontSize: 10,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.hint,
    ...FONTS.regular,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    lineHeight: 20,
  },

  // ─── Reaction row ──────────────────────────────────
  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  // Reaction pills (only rendered for emojis that have been used)
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 3,
  },
  reactionPillMine: {
    backgroundColor: `${COLORS.gold}10`,
    borderColor: `${COLORS.gold}30`,
  },
  pillPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  pillEmoji: {
    fontSize: 12,
    lineHeight: 16,
  },
  pillCount: {
    fontSize: 11,
    color: COLORS.hint,
    ...FONTS.semibold,
  },
  pillCountMine: {
    color: COLORS.gold,
  },

  // Add-reaction trigger — reads as a UI control, not a reaction
  addTrigger: {
    height: 26,
    width: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTriggerPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },

  // ─── Bottom-sheet tray ─────────────────────────────
  trayOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  traySheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl + 4,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}18`,
  },
  trayHandle: {
    width: 32,
    height: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    opacity: 0.35,
    marginBottom: SPACING.lg,
  },
  trayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  trayEmoji: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  trayEmojiSelected: {
    backgroundColor: `${COLORS.gold}12`,
    borderColor: `${COLORS.gold}40`,
  },
  trayEmojiPressed: {
    transform: [{ scale: 0.88 }],
    opacity: 0.8,
  },
  trayEmojiText: {
    fontSize: 24,
  },

  // ─── Input ─────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.white,
    fontSize: 14,
    ...FONTS.regular,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    fontSize: 14,
    color: COLORS.dark,
    ...FONTS.bold,
  },
});

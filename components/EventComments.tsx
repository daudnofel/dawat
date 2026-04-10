import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, Modal, Keyboard, ScrollView, Animated, Platform,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { REACTION_EMOJIS, ReactionEmoji, CommentReaction } from '../types';

// ─── SVG icon: smiley outline + plus ─────────────────────────
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

// ─── Reply icon (chat bubble with arrow) ─────────────────────
function ReplyIcon({ size = 14, color = COLORS.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  display_name: string | null;
  parent_id: string | null;
  _pending?: boolean;
}

interface EventCommentsProps {
  eventId: string;
  hostId: string;
}

export default function EventComments({ eventId, hostId }: EventCommentsProps) {
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);

  // Reactions
  const [reactionsMap, setReactionsMap] = useState<Record<string, CommentReaction[]>>({});
  const [pickerCommentId, setPickerCommentId] = useState<string | null>(null);

  // Reply sheet
  const [replySheetParent, setReplySheetParent] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Keyboard tracking for reply sheet
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const replyInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? e.duration : 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration ?? 250) : 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);

  // ─── Derived state ────────────────────────────────────────
  const topLevelComments = useMemo(
    () => allComments.filter((c) => !c.parent_id),
    [allComments],
  );

  const replyCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allComments) {
      if (c.parent_id) {
        map[c.parent_id] = (map[c.parent_id] ?? 0) + 1;
      }
    }
    return map;
  }, [allComments]);

  const repliesForSheet = useMemo(
    () =>
      replySheetParent
        ? allComments
            .filter((c) => c.parent_id === replySheetParent.id)
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            )
        : [],
    [allComments, replySheetParent],
  );

  // ─── Data fetching ────────────────────────────────────────
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
    // Try fetching with parent_id — graceful degradation if column doesn't exist yet
    let rows: Array<{
      id: string;
      body: string;
      created_at: string;
      user_id: string;
      parent_id: string | null;
    }> = [];

    const { data: withParent, error: parentError } = await supabase
      .from('comments')
      .select('id, body, created_at, user_id, parent_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (parentError || !withParent) {
      // Fallback: parent_id column might not exist yet
      const { data: basic } = await supabase
        .from('comments')
        .select('id, body, created_at, user_id')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      rows = (basic ?? []).map((c) => ({ ...c, parent_id: null }));
    } else {
      rows = withParent;
    }

    if (rows.length === 0) {
      setAllComments([]);
      setReactionsMap({});
      return;
    }

    // Fetch display names
    const userIds = [...new Set(rows.map((c) => c.user_id))];
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', userIds);

    const userMap = new Map(
      (users ?? []).map((u) => [u.id, u.display_name]),
    );

    const mapped: Comment[] = rows.map((c) => ({
      ...c,
      display_name: userMap.get(c.user_id) ?? null,
    }));

    setAllComments(mapped);
    fetchReactions(rows.map((c) => c.id));
  };

  // ─── Reactions ────────────────────────────────────────────
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

  // ─── Top-level comment ────────────────────────────────────
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
      parent_id: null,
      _pending: true,
    };

    setAllComments((prev) => [...prev, optimistic]);
    setNewComment('');
    setSending(true);

    const { data: inserted, error } = await supabase
      .from('comments')
      .insert({ event_id: eventId, user_id: currentUserId, body: trimmed })
      .select('id, body, created_at, user_id')
      .single();

    setSending(false);

    if (error || !inserted) {
      setAllComments((prev) => prev.filter((c) => c.id !== tempId));
      setNewComment(trimmed);
      Alert.alert('Error', 'Could not post comment. Please try again.');
      return;
    }

    setAllComments((prev) =>
      prev.map((c) =>
        c.id === tempId
          ? { ...inserted, display_name: currentUserDisplayName, parent_id: null, _pending: false }
          : c,
      ),
    );
  };

  // ─── Reply ────────────────────────────────────────────────
  const handleSendReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || sendingReply || !replySheetParent || !currentUserId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const tempId = `temp-reply-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      body: trimmed,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      display_name: currentUserDisplayName,
      parent_id: replySheetParent.id,
      _pending: true,
    };

    setAllComments((prev) => [...prev, optimistic]);
    setReplyText('');
    setSendingReply(true);

    const { data: inserted, error } = await supabase
      .from('comments')
      .insert({
        event_id: eventId,
        user_id: currentUserId,
        body: trimmed,
        parent_id: replySheetParent.id,
      })
      .select('id, body, created_at, user_id, parent_id')
      .single();

    setSendingReply(false);

    if (error || !inserted) {
      setAllComments((prev) => prev.filter((c) => c.id !== tempId));
      setReplyText(trimmed);
      Alert.alert('Error', 'Could not post reply. Please try again.');
      return;
    }

    setAllComments((prev) =>
      prev.map((c) =>
        c.id === tempId
          ? { ...inserted, display_name: currentUserDisplayName, _pending: false }
          : c,
      ),
    );
  };

  // ─── Delete ───────────────────────────────────────────────
  const handleDelete = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('comments').delete().eq('id', commentId);
          // Remove comment + any replies to it
          setAllComments((prev) =>
            prev.filter((c) => c.id !== commentId && c.parent_id !== commentId),
          );
          setReactionsMap((prev) => {
            const next = { ...prev };
            delete next[commentId];
            return next;
          });
          // Close sheet if we deleted the parent
          if (replySheetParent?.id === commentId) {
            setReplySheetParent(null);
          }
        },
      },
    ]);
  };

  // ─── Helpers ──────────────────────────────────────────────
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

  const canDelete = (comment: Comment) =>
    currentUserId === comment.user_id || currentUserId === hostId;

  // ─── Reaction bar for a comment ───────────────────────────
  const renderReactionPills = (commentId: string) => {
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

    if (grouped.length === 0) return null;

    return (
      <View style={styles.reactionPills}>
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
      </View>
    );
  };

  // ─── Actions row: react + reply ───────────────────────────
  const renderActionsRow = (comment: Comment) => {
    if (comment._pending) return null;

    const replyCount = replyCountMap[comment.id] ?? 0;

    return (
      <View style={styles.actionsRow}>
        {renderReactionPills(comment.id)}
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setPickerCommentId(comment.id);
            }}
          >
            <SmileyPlusIcon />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setReplySheetParent(comment);
            }}
          >
            <ReplyIcon />
            <Text style={styles.replyLabel}>
              {replyCount > 0
                ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                : 'Reply'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ─── Shared comment row renderer ──────────────────────────
  const renderCommentRow = (
    comment: Comment,
    opts: { compact?: boolean; showActions?: boolean } = {},
  ) => {
    const { compact = false, showActions = true } = opts;
    const name = comment.display_name || 'Guest';
    const initial = name.charAt(0).toUpperCase();
    const isHost = comment.user_id === hostId;
    const avatarSize = compact ? 26 : 32;

    return (
      <View key={comment.id}>
        <Pressable
          style={[
            styles.commentRow,
            compact && styles.commentRowCompact,
            comment._pending && styles.commentPending,
          ]}
          onLongPress={() =>
            !comment._pending && canDelete(comment) && handleDelete(comment.id)
          }
        >
          <View
            style={[
              styles.avatar,
              { width: avatarSize, height: avatarSize },
              compact && styles.avatarCompact,
            ]}
          >
            <Text style={[styles.avatarText, compact && styles.avatarTextCompact]}>
              {initial}
            </Text>
          </View>
          <View style={styles.commentBody}>
            <View style={styles.commentHeader}>
              <Text style={[styles.commentName, compact && styles.commentNameCompact]}>
                {name}
              </Text>
              {isHost && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>Host</Text>
                </View>
              )}
              <Text style={styles.commentTime}>
                {comment._pending ? 'Sending...' : formatTime(comment.created_at)}
              </Text>
            </View>
            <Text style={[styles.commentText, compact && styles.commentTextCompact]}>
              {comment.body}
            </Text>
          </View>
        </Pressable>
        {showActions && !compact && renderActionsRow(comment)}
      </View>
    );
  };

  // ─── Main render ──────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Wall{topLevelComments.length > 0 ? ` (${topLevelComments.length})` : ''}
      </Text>

      {topLevelComments.length === 0 && (
        <Text style={styles.emptyText}>No comments yet — be the first!</Text>
      )}

      {topLevelComments.map((comment) => renderCommentRow(comment))}

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

      {/* ─── Reply sheet ──────────────────────────────────── */}
      <Modal
        visible={replySheetParent !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          Keyboard.dismiss();
          setReplySheetParent(null);
          setReplyText('');
        }}
      >
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => {
            Keyboard.dismiss();
            setReplySheetParent(null);
            setReplyText('');
          }}
        >
          <Animated.View
            style={[
              styles.sheetContent,
              { marginBottom: keyboardHeight },
            ]}
          >
            <Pressable onPress={() => {}} style={{ flex: 1 }}>
              {/* Handle */}
              <View style={styles.sheetHandleRow}>
                <View style={styles.sheetHandle} />
              </View>

              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Thread</Text>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    setReplySheetParent(null);
                    setReplyText('');
                  }}
                  hitSlop={12}
                >
                  <Text style={styles.sheetClose}>Done</Text>
                </Pressable>
              </View>

              {/* Scrollable body: parent + replies */}
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Parent comment — anchored at top */}
                {replySheetParent && (
                  <View style={styles.sheetParent}>
                    {renderCommentRow(replySheetParent, {
                      compact: false,
                      showActions: false,
                    })}
                  </View>
                )}

                {/* Divider */}
                <View style={styles.sheetDivider} />

                {/* Replies */}
                {repliesForSheet.length === 0 ? (
                  <View style={styles.sheetEmpty}>
                    <Text style={styles.sheetEmptyText}>
                      No replies yet
                    </Text>
                    <Text style={styles.sheetEmptyHint}>
                      Add your thoughts below
                    </Text>
                  </View>
                ) : (
                  <View style={styles.sheetReplies}>
                    {repliesForSheet.map((reply) =>
                      renderCommentRow(reply, { compact: true, showActions: false }),
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Reply composer — pinned at bottom, always visible */}
              {currentUserId && (
                <View style={styles.sheetComposer}>
                  <TextInput
                    ref={replyInputRef}
                    style={styles.sheetInput}
                    value={replyText}
                    onChangeText={setReplyText}
                    placeholder="Reply..."
                    placeholderTextColor={COLORS.hint}
                    maxLength={500}
                    multiline
                    autoFocus
                  />
                  <Pressable
                    style={[
                      styles.sheetSend,
                      !replyText.trim() && styles.sendDisabled,
                    ]}
                    onPress={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M22 2L11 13"
                        stroke={replyText.trim() ? COLORS.dark : COLORS.hint}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M22 2L15 22L11 13L2 9L22 2Z"
                        stroke={replyText.trim() ? COLORS.dark : COLORS.hint}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </Pressable>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
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
    marginBottom: SPACING.xs,
  },
  commentRowCompact: {
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
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
  avatarCompact: {
    borderWidth: 0.5,
  },
  avatarText: {
    fontSize: 12,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  avatarTextCompact: {
    fontSize: 10,
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
  commentNameCompact: {
    fontSize: 12,
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
  commentTextCompact: {
    fontSize: 13,
    lineHeight: 18,
  },

  // ─── Actions row (react + reply) ──────────────────
  actionsRow: {
    paddingLeft: 44, // avatar width + gap
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  actionBtnPressed: {
    opacity: 0.6,
  },
  replyLabel: {
    fontSize: 12,
    color: COLORS.hint,
    ...FONTS.regular,
  },

  // ─── Reaction pills ──────────────────────────────
  reactionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
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

  // ─── Reaction tray ────────────────────────────────
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

  // ─── Reply sheet ──────────────────────────────────
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '70%',
    minHeight: 240,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}15`,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    flexGrow: 1,
  },
  sheetHandleRow: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: 2,
  },
  sheetHandle: {
    width: 32,
    height: 3.5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.hint,
    opacity: 0.35,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  sheetTitle: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semibold,
  },
  sheetClose: {
    fontSize: 14,
    color: COLORS.gold,
    ...FONTS.semibold,
  },
  sheetParent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xs,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xl,
  },
  sheetEmpty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  sheetEmptyText: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: 2,
  },
  sheetEmptyHint: {
    fontSize: 12,
    color: COLORS.hint,
    ...FONTS.regular,
  },
  sheetReplies: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  sheetComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  sheetInput: {
    flex: 1,
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.sm,
    color: COLORS.white,
    fontSize: 14,
    ...FONTS.regular,
    maxHeight: 72,
    minHeight: 34,
  },
  sheetSend: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Main input ───────────────────────────────────
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

import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  display_name: string | null;
  _pending?: boolean; // true while optimistic insert is in-flight
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

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, body, created_at, user_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (!data || data.length === 0) {
      setComments([]);
      return;
    }

    // Fetch display names in one query
    const userIds = [...new Set(data.map((c) => c.user_id))];
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', userIds);

    const userMap = new Map(
      (users ?? []).map((u) => [u.id, u.display_name]),
    );

    setComments(
      data.map((c) => ({
        ...c,
        display_name: userMap.get(c.user_id) ?? null,
      })),
    );
  };

  const handleSend = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || sending) return;

    if (!currentUserId) {
      Alert.alert('Sign in required', 'Please sign in to comment.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 1. Create optimistic comment and show it immediately
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

    // 2. Fire insert and get the real row back
    const { data: inserted, error } = await supabase
      .from('comments')
      .insert({ event_id: eventId, user_id: currentUserId, body: trimmed })
      .select('id, body, created_at, user_id')
      .single();

    setSending(false);

    if (error || !inserted) {
      // Roll back — remove the optimistic comment and restore the input
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setNewComment(trimmed);
      Alert.alert('Error', 'Could not post comment. Please try again.');
      return;
    }

    // 3. Replace temp comment with the confirmed server version
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
          <Pressable
            key={comment.id}
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
            </View>
          </Pressable>
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

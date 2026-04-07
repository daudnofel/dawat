import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Pressable, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/auth-cache';
import { sendMessage, markConversationRead } from '../../lib/messaging';
import { Message } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OtherUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id) return;
    init();

    // Realtime subscription for new messages
    const channel = supabase
      .channel(`conv:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Already have this exact server message? skip
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // It's our own message arriving via Realtime — replace the optimistic temp message
            // Match by sender + body (the temp message has a temp- id but same content)
            const tempIdx = prev.findIndex(
              (m) => m.id.startsWith('temp-') && m.sender_id === newMsg.sender_id && m.body === newMsg.body,
            );
            if (tempIdx !== -1) {
              const next = [...prev];
              next[tempIdx] = newMsg;
              return next;
            }
            // Otherwise it's a real new message from the other person
            return [...prev, newMsg];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const init = useCallback(async () => {
    if (!id) return;
    const userId = await getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    setCurrentUserId(userId);

    // Find the other participant
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', id);

    const otherId = parts?.find((p) => p.user_id !== userId)?.user_id;
    if (otherId) {
      const { data: u } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .eq('id', otherId)
        .single();
      if (u) setOtherUser(u as OtherUser);
    }

    // Fetch messages
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgs) setMessages(msgs as Message[]);
    setLoading(false);

    // Mark conversation as read
    await markConversationRead(id, userId);
  }, [id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !currentUserId || !id || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    const body = input.trim();
    setInput('');

    // Optimistic insert
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: id,
      sender_id: currentUserId,
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const ok = await sendMessage(id, currentUserId, body);
    setSending(false);

    if (!ok) {
      // Roll back
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setInput(body);
    }
    // Real message comes back via Realtime subscription
  };

  const formatTime = (iso: string): string => {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const initial = (otherUser?.display_name ?? '?').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Atmosphere */}
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={300} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="chatGlow" cx="50%" cy="0%" rx="70%" ry="80%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.14" />
              <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.06" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={300} fill="url(#chatGlow)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            {otherUser?.avatar_url ? (
              <Image source={{ uri: otherUser.avatar_url }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                <Text style={styles.headerAvatarInitial}>{initial}</Text>
              </View>
            )}
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser?.display_name ?? 'Loading...'}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <Text style={styles.emptyHint}>Send the first message to {otherUser?.display_name ?? 'them'}.</Text>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === currentUserId;
                  return (
                    <View key={msg.id} style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
                      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{msg.body}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}

          {/* Input */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message…"
              placeholderTextColor={COLORS.hint}
              multiline
              maxLength={1000}
            />
            <Pressable
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  backText: {
    fontSize: 22,
    color: COLORS.white,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAvatarPlaceholder: {
    backgroundColor: COLORS.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarInitial: {
    fontSize: 14,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  headerName: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.semibold,
    maxWidth: 200,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messagesContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.hint,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.xxl + SPACING.xl,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
  },
  bubbleTheirs: {
    backgroundColor: 'rgba(30, 30, 30, 0.65)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
    borderTopLeftRadius: 6,
  },
  bubbleMine: {
    backgroundColor: `${COLORS.gold}25`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${COLORS.gold}40`,
    borderTopRightRadius: 6,
  },
  bubbleText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.regular,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: COLORS.white,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 223, 161, 0.10)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
    color: COLORS.white,
    fontSize: 15,
    ...FONTS.regular,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 22,
    color: COLORS.dark,
    ...FONTS.bold,
  },
});

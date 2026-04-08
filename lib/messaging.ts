// lib/messaging.ts
// Helpers for the messaging + boops feature (DAW-24).

import { supabase } from './supabase';
import { triggerPush } from './push';
import { ConversationWithMeta, BoopSuggestion } from '../types';

/**
 * Find or create a 1-on-1 conversation between the current user and the recipient.
 * Returns the conversation_id.
 */
export async function createOrFindConversation(
  currentUserId: string,
  recipientId: string,
): Promise<string | null> {
  // Find any conversation where both users are participants
  const { data: myConvs, error: myConvsErr } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId);

  if (myConvsErr) {
    console.error('[messaging] Failed to fetch my conversations:', myConvsErr.message);
  }

  if (myConvs && myConvs.length > 0) {
    const myConvIds = myConvs.map((c) => c.conversation_id);
    const { data: shared } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', recipientId)
      .in('conversation_id', myConvIds);

    if (shared && shared.length > 0) {
      return shared[0].conversation_id;
    }
  }

  // No existing conversation — create one
  const { data: newConv, error: convErr } = await supabase
    .from('conversations')
    .insert({})
    .select('id')
    .single();

  if (convErr || !newConv) {
    console.error('[messaging] Failed to create conversation:', convErr?.message);
    return null;
  }

  // Add both participants
  const { error: partErr } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConv.id, user_id: currentUserId },
      { conversation_id: newConv.id, user_id: recipientId },
    ]);

  if (partErr) {
    console.error('[messaging] Failed to add participants:', partErr.message);
    return null;
  }

  return newConv.id;
}

/**
 * Send a message to a conversation. Also bumps last_message_at on the conversation.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<boolean> {
  const trimmed = body.trim();
  if (!trimmed) return false;

  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body: trimmed });

  if (error) return false;

  // Bump last_message_at (fire-and-forget)
  void supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  // Push the recipient (fire-and-forget) — figure out who the other participant is
  // and look up the sender's display name for the title
  void (async () => {
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId);
    const otherUserId = parts?.find((p) => p.user_id !== senderId)?.user_id;
    if (!otherUserId) return;

    const { data: sender } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', senderId)
      .single();

    const senderName = sender?.display_name?.split(' ')[0] ?? 'Someone';
    await triggerPush(otherUserId, senderName, trimmed, {
      type: 'message',
      conversation_id: conversationId,
    });
  })();

  return true;
}

/**
 * Mark all messages in a conversation as read for the current user.
 */
export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}

/**
 * Fetch the inbox: every conversation the user is in, with the other participant
 * and the latest message preview.
 */
export async function fetchInbox(userId: string): Promise<ConversationWithMeta[]> {
  // Get all conversations the user is in
  const { data: myParts } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (!myParts || myParts.length === 0) return [];

  const convIds = myParts.map((p) => p.conversation_id);
  const lastReadMap = new Map(myParts.map((p) => [p.conversation_id, p.last_read_at]));

  // Get the conversations themselves (sorted by last_message_at)
  const { data: convs } = await supabase
    .from('conversations')
    .select('*')
    .in('id', convIds)
    .order('last_message_at', { ascending: false });

  if (!convs) return [];

  // Get all participants of those conversations to find "the other user"
  const { data: allParts } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', convIds);

  const otherUserMap = new Map<string, string>();
  (allParts ?? []).forEach((p) => {
    if (p.user_id !== userId) otherUserMap.set(p.conversation_id, p.user_id);
  });

  const otherUserIds = Array.from(new Set(otherUserMap.values()));

  // Fetch other users' profiles
  const { data: users } = await supabase
    .from('users')
    .select('id, display_name, avatar_url')
    .in('id', otherUserIds.length > 0 ? otherUserIds : ['__none__']);
  const userMap = new Map((users ?? []).map((u: any) => [u.id, u]));

  // Fetch the latest message for each conversation
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false });

  const lastMessageMap = new Map<string, any>();
  (messages ?? []).forEach((m: any) => {
    if (!lastMessageMap.has(m.conversation_id)) {
      lastMessageMap.set(m.conversation_id, m);
    }
  });

  // Compute unread count per conversation
  const unreadCountMap = new Map<string, number>();
  (messages ?? []).forEach((m: any) => {
    const lastRead = lastReadMap.get(m.conversation_id);
    if (m.sender_id !== userId && lastRead && new Date(m.created_at) > new Date(lastRead)) {
      unreadCountMap.set(m.conversation_id, (unreadCountMap.get(m.conversation_id) ?? 0) + 1);
    }
  });

  return convs.map((conv: any) => {
    const otherUserId = otherUserMap.get(conv.id);
    const otherUser = otherUserId ? userMap.get(otherUserId) : null;
    return {
      ...conv,
      other_user: otherUser ?? { id: '', display_name: 'Unknown', avatar_url: null },
      last_message: lastMessageMap.get(conv.id) ?? null,
      unread_count: unreadCountMap.get(conv.id) ?? 0,
    };
  });
}

/**
 * Total unread message count across all of the user's conversations.
 */
export async function fetchUnreadMessageCount(userId: string): Promise<number> {
  const inbox = await fetchInbox(userId);
  return inbox.reduce((sum, c) => sum + c.unread_count, 0);
}

/**
 * Get suggested users for the Boops carousel.
 * v1: people who've RSVPd to the same events as the current user, excluding self
 * and people the user has booped in the last 7 days.
 */
export async function getSuggestedBoopUsers(userId: string): Promise<BoopSuggestion[]> {
  // Find events the user has RSVPd to
  const { data: myRsvps } = await supabase
    .from('rsvps')
    .select('event_id')
    .eq('user_id', userId);

  if (!myRsvps || myRsvps.length === 0) {
    // Fallback: just return some other recent users
    const { data: others } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .neq('id', userId)
      .limit(10);
    return (others ?? []) as BoopSuggestion[];
  }

  const eventIds = myRsvps.map((r) => r.event_id);

  // Find OTHER people who RSVPd to the same events
  const { data: coAttendees } = await supabase
    .from('rsvps')
    .select('user_id')
    .in('event_id', eventIds)
    .neq('user_id', userId);

  if (!coAttendees || coAttendees.length === 0) {
    return [];
  }

  // Dedupe co-attendee user_ids
  const candidateIds = Array.from(new Set(coAttendees.map((r) => r.user_id).filter(Boolean)));

  // Exclude users the current user has booped in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentBoops } = await supabase
    .from('boops')
    .select('recipient_id')
    .eq('sender_id', userId)
    .gte('created_at', sevenDaysAgo);

  const recentlyBooped = new Set((recentBoops ?? []).map((b) => b.recipient_id));
  const finalIds = candidateIds.filter((id) => !recentlyBooped.has(id)).slice(0, 12);

  if (finalIds.length === 0) return [];

  // Fetch user profiles
  const { data: users } = await supabase
    .from('users')
    .select('id, display_name, avatar_url')
    .in('id', finalIds);

  return (users ?? []) as BoopSuggestion[];
}

/**
 * Send a boop to another user.
 */
export async function sendBoop(senderId: string, recipientId: string): Promise<boolean> {
  const { error } = await supabase
    .from('boops')
    .insert({ sender_id: senderId, recipient_id: recipientId });
  return !error;
}

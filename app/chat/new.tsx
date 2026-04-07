import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  ActivityIndicator, Image, Dimensions, Alert,
} from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/auth-cache';
import { createOrFindConversation } from '../../lib/messaging';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UserResult {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export default function NewMessageScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    })();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const term = `%${query.trim()}%`;
      const { data } = await supabase
        .from('users')
        .select('id, display_name, username, avatar_url')
        .or(`display_name.ilike.${term},username.ilike.${term}`)
        .neq('id', currentUserId ?? '__none__')
        .limit(20);
      setResults((data ?? []) as UserResult[]);
      setSearching(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, currentUserId]);

  const handleSelectUser = async (user: UserResult) => {
    if (!currentUserId) {
      Alert.alert('Not signed in', 'Please sign in to send messages.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const convId = await createOrFindConversation(currentUserId, user.id);
    if (convId) {
      router.replace(`/chat/${convId}`);
    } else {
      Alert.alert('Could not start chat', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={300} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="newMsgGlow" cx="50%" cy="0%" rx="70%" ry="80%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.14" />
              <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.06" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={300} fill="url(#newMsgGlow)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          >
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>New message</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or @username"
            placeholderTextColor={COLORS.hint}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {searching && (
            <View style={{ paddingTop: SPACING.xl, alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.gold} />
            </View>
          )}

          {!searching && query.length > 0 && results.length === 0 && (
            <Text style={styles.emptyHint}>No users found</Text>
          )}

          {!searching && query.length === 0 && (
            <Text style={styles.emptyHint}>Start typing to find someone</Text>
          )}

          {results.map((user) => {
            const initial = (user.display_name ?? user.username ?? '?').charAt(0).toUpperCase();
            return (
              <Pressable
                key={user.id}
                style={({ pressed }) => [styles.userRow, pressed && { opacity: 0.85 }]}
                onPress={() => handleSelectUser(user)}
              >
                {user.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.userAvatar} />
                ) : (
                  <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                    <Text style={styles.userAvatarInitial}>{initial}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.display_name ?? 'Guest'}
                  </Text>
                  {user.username && (
                    <Text style={styles.userHandle} numberOfLines={1}>@{user.username}</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  safeArea: { flex: 1 },
  atmosphereLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  glowSvg: { position: 'absolute', top: 0, left: 0 },

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
    fontSize: 22,
    color: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.semibold,
  },

  searchWrap: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  searchInput: {
    height: 48,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
    color: COLORS.white,
    fontSize: 15,
    ...FONTS.medium,
  },

  emptyHint: {
    fontSize: 14,
    color: COLORS.hint,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },

  // User row
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userAvatarPlaceholder: {
    backgroundColor: COLORS.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitial: {
    fontSize: 18,
    color: COLORS.gold,
    ...FONTS.bold,
  },
  userName: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semibold,
  },
  userHandle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 2,
  },
});

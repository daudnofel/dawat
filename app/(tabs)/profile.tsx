import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Image, Pressable, ActivityIndicator, Dimensions, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Circle, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { Toast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId, clearCurrentUserId } from '../../lib/auth-cache';
import { User } from '../../types';
import AnimatedPress from '../../components/AnimatedPress';
import EmptyState from '../../components/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ProfileAvatar({ letter, avatarUrl, onPress, uploading }: { letter: string; avatarUrl: string | null; onPress: () => void; uploading: boolean }) {
  return (
    <Pressable style={styles.avatarOuter} onPress={onPress}>
      {/* Golden glow — smooth radial gradient */}
      <Svg width={200} height={200} style={styles.avatarGlowSvg}>
        <Defs>
          <RadialGradient id="avatarGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.18" />
            <Stop offset="0.5" stopColor="#FFDFA1" stopOpacity="0.08" />
            <Stop offset="0.8" stopColor="#FFDFA1" stopOpacity="0.03" />
            <Stop offset="1" stopColor="#FFDFA1" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="200" height="200" fill="url(#avatarGlow)" />
      </Svg>

      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <>
          <Svg width={140} height={140} viewBox="0 0 140 140">
            <Defs>
              <LinearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={COLORS.gold} />
                <Stop offset="0.5" stopColor={COLORS.gold2} />
                <Stop offset="1" stopColor={COLORS.gold2} />
              </LinearGradient>
            </Defs>
            <Circle cx="70" cy="70" r="68" stroke="url(#avatarGrad)" strokeWidth="2.5" fill="none" />
            <Circle cx="70" cy="70" r="64" fill={COLORS.card2} />
          </Svg>
          <Text style={styles.avatarText}>{letter}</Text>
        </>
      )}
      {uploading ? (
        <View style={styles.avatarOverlay}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : (
        <BlurView intensity={40} tint="dark" style={styles.cameraBadge}>
          <View style={styles.cameraBadgeInner}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Rect x="2" y="6" width="20" height="14" rx="3" stroke="#E5E2E1" strokeWidth="1.8" fill="none" />
              <Circle cx="12" cy="13" r="3.5" stroke="#E5E2E1" strokeWidth="1.8" fill="none" />
              <Rect x="8.5" y="3.5" width="7" height="3" rx="1" stroke="#E5E2E1" strokeWidth="1.5" fill="none" />
            </Svg>
          </View>
        </BlurView>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [attendingCount, setAttendingCount] = useState(0);
  const [hostedCount, setHostedCount] = useState(0);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [noAuth, setNoAuth] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  const nameOpacity = useSharedValue(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setNoAuth(true);
      return;
    }
    setNoAuth(false);

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data as User);
      nameOpacity.value = withSpring(1);
    }

    const [{ count: attending }, { count: hosted }, { data: recent }] = await Promise.all([
      supabase
        .from('rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['yes', 'inshallah']),
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId)
        .eq('is_published', true),
      supabase
        .from('events')
        .select('id, title, poster_url, theme_id, date_time')
        .eq('host_id', userId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);
    setAttendingCount(attending ?? 0);
    setHostedCount(hosted ?? 0);
    setRecentEvents(recent ?? []);
  };

  const nameStyle = useAnimatedStyle(() => ({ opacity: nameOpacity.value }));

  const handlePickAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check existing status first — requesting again once denied does nothing on iOS
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
    let status = existing.status;

    if (status !== 'granted') {
      if (existing.canAskAgain) {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        status = req.status;
      }

      if (status !== 'granted') {
        Alert.alert(
          'Photo access needed',
          'Dawat needs access to your photo library to update your profile photo. Open Settings to enable it.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const userId = profile?.id;
    if (!userId) return;

    setUploading(true);

    try {
      const ext = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const filePath = `${userId}/avatar.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: asset.mimeType ?? `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        Toast.error(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const serviceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY!;
      await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : prev);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Toast.error('Could not upload photo');
    }

    setUploading(false);
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditName(profile?.display_name ?? '');
    setEditBio((profile as any)?.bio ?? '');
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const userId = profile?.id;
    if (!userId) return;

    const serviceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY!;
    await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        display_name: editName.trim(),
        bio: editBio.trim() || null,
      }),
    });

    setProfile((prev) => prev ? { ...prev, display_name: editName.trim() } : prev);
    setEditing(false);
    Toast.success('Profile updated');
  };

  const handleShareProfile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const username = profile?.username ?? '';
    const url = `https://dawat.app/@${username}`;
    try {
      await Share.share({ message: url });
    } catch {
      Toast.info(`dawat.app/@${username}`);
    }
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          clearCurrentUserId();
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const initial = profile?.display_name?.charAt(0)?.toUpperCase() ?? '?';

  // Format join date
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    : null;

  // Safely access optional fields that may not exist on type yet
  const profileAny = profile as any;
  const bio = profileAny?.bio as string | undefined;
  const instagramHandle = profileAny?.instagram_handle as string | undefined;

  return (
    <View style={styles.container}>
      {/* Subtle golden atmospheric glow */}
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={350} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="profileAtmosphere" cx="50%" cy="0%" rx="60%" ry="70%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.12" />
              <Stop offset="0.5" stopColor="#E6C27A" stopOpacity="0.05" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={350} fill="url(#profileAtmosphere)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {noAuth ? (
            <EmptyState emoji="🔐" title="Sign in to see your profile" subtitle="Your profile and stats will appear here" />
          ) : (
            <>
              {/* Avatar with halo */}
              <View style={styles.profileSection}>
                <ProfileAvatar letter={initial} avatarUrl={profile?.avatar_url ?? null} onPress={handlePickAvatar} uploading={uploading} />
                <Animated.View style={[styles.nameBlock, nameStyle]}>
                  <Text style={styles.name}>{profile?.display_name ?? 'Loading...'}</Text>
                  {bio ? <Text style={styles.bio}>{bio}</Text> : null}
                  <Text style={styles.username}>@{profile?.username ?? '...'}</Text>
                  {instagramHandle ? (
                    <View style={styles.igRow}>
                      <Text style={styles.igIcon}>📷</Text>
                      <Text style={styles.igHandle}>@{instagramHandle}</Text>
                    </View>
                  ) : null}
                </Animated.View>
              </View>

              {/* Edit / Share — glass buttons */}
              <View style={styles.actionRow}>
                <AnimatedPress
                  style={styles.actionButtonOuter}
                  scaleValue={0.97}
                  onPress={handleEditProfile}
                >
                  <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
                    <View style={styles.actionButtonInner}>
                      <View style={styles.glassHighlight} />
                      <Text style={styles.actionButtonText}>Edit profile</Text>
                    </View>
                  </BlurView>
                </AnimatedPress>
                <AnimatedPress
                  style={styles.actionButtonOuter}
                  scaleValue={0.97}
                  onPress={handleShareProfile}
                >
                  <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
                    <View style={styles.actionButtonInner}>
                      <View style={styles.glassHighlight} />
                      <Text style={styles.actionButtonText}>Share profile</Text>
                    </View>
                  </BlurView>
                </AnimatedPress>
              </View>

              {/* Info row — birthday + joined */}
              {joinDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoText}>🌐 Joined {joinDate}</Text>
                </View>
              )}

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{hostedCount}</Text>
                  <Text style={styles.statLabel}>Hosted</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{attendingCount}</Text>
                  <Text style={styles.statLabel}>Attended</Text>
                </View>
              </View>

              {/* Edit profile form (inline) */}
              {editing && (
                <View style={styles.editSection}>
                  <TextInput
                    style={styles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Display name"
                    placeholderTextColor={COLORS.hint}
                    autoFocus
                  />
                  <TextInput
                    style={[styles.editInput, { minHeight: 80 }]}
                    value={editBio}
                    onChangeText={setEditBio}
                    placeholder="Add a bio..."
                    placeholderTextColor={COLORS.hint}
                    multiline
                    maxLength={160}
                  />
                  <View style={styles.editActions}>
                    <Pressable onPress={() => setEditing(false)} style={styles.editCancel}>
                      <Text style={styles.editCancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSaveProfile}
                      style={[styles.editSave, !editName.trim() && { opacity: 0.4 }]}
                      disabled={!editName.trim()}
                    >
                      <Text style={styles.editSaveText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Recent events */}
              {recentEvents.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Events</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
                    {recentEvents.map((ev: any) => (
                      <Pressable
                        key={ev.id}
                        style={styles.recentCard}
                        onPress={() => router.push(`/event/${ev.id}`)}
                      >
                        {ev.poster_url ? (
                          <Image source={{ uri: ev.poster_url }} style={styles.recentPoster} />
                        ) : (
                          <View style={[styles.recentPoster, { backgroundColor: COLORS.card2, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 28 }}>🌙</Text>
                          </View>
                        )}
                        <Text style={styles.recentTitle} numberOfLines={1}>{ev.title}</Text>
                        <Text style={styles.recentDate}>
                          {ev.date_time ? new Date(ev.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Sign out — glass button matching other buttons */}
              <View style={styles.signOutRow}>
                <AnimatedPress
                  style={styles.signOutOuter}
                  scaleValue={0.97}
                  haptic="medium"
                  onPress={handleSignOut}
                >
                  <BlurView intensity={30} tint="dark" style={styles.signOutBlur}>
                    <View style={styles.signOutInner}>
                      <View style={styles.glassHighlight} />
                      <Text style={styles.signOutText}>Sign Out</Text>
                    </View>
                  </BlurView>
                </AnimatedPress>
              </View>
            </>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Atmosphere
  atmosphereLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  // Avatar + halo
  profileSection: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  avatarOuter: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  avatarGlowSvg: {
    position: 'absolute',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2.5,
    borderColor: COLORS.gold,
  },
  avatarText: {
    position: 'absolute',
    fontSize: 32,
    color: COLORS.white,
    ...FONTS.bold,
  },
  avatarOverlay: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cameraBadgeInner: {
    flex: 1,
    backgroundColor: 'rgba(40, 40, 40, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Name block
  nameBlock: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  name: {
    fontSize: 28,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  bio: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: SPACING.xs,
  },
  username: {
    fontSize: 15,
    color: COLORS.muted,
    ...FONTS.regular,
  },
  igRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  igIcon: { fontSize: 13 },
  igHandle: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.medium,
  },

  // Action buttons — glass
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButtonOuter: {
    flex: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  actionBlur: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  actionButtonInner: {
    alignItems: 'center',
    paddingVertical: SPACING.md + 2,
    backgroundColor: 'rgba(50, 45, 30, 0.55)',
  },
  actionButtonText: {
    fontSize: 15,
    color: COLORS.muted,
    ...FONTS.regular,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 223, 161, 0.15)',
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
  },

  // Sections
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.md,
  },

  // Badge card — glass
  badgeCardOuter: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  badgeBlur: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  badgeCardInner: {
    height: 100,
    backgroundColor: 'rgba(50, 45, 30, 0.55)',
    justifyContent: 'center',
  },

  // Diamond badge — layered rotated squares
  diamondWrapper: {
    position: 'absolute',
    left: SPACING.xl,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamondGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 223, 161, 0.08)',
  },
  diamondOuter: {
    width: 72,
    height: 72,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5,
    borderColor: 'rgba(230, 194, 122, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 223, 161, 0.04)',
  },
  diamondMiddle: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 122, 0.35)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 223, 161, 0.06)',
  },
  diamondInner: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumber: {
    fontSize: 18,
    color: COLORS.gold,
    ...FONTS.bold,
    lineHeight: 20,
  },
  badgeSublabel: {
    fontSize: 7,
    color: COLORS.muted,
    ...FONTS.bold,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 9,
  },

  // Sign out — glass button
  signOutRow: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
  },
  signOutOuter: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  signOutBlur: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  signOutInner: {
    alignItems: 'center',
    paddingVertical: SPACING.md + 2,
    backgroundColor: 'rgba(60, 30, 30, 0.45)',
  },
  signOutText: {
    color: COLORS.red,
    fontSize: 14,
    ...FONTS.medium,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    color: COLORS.white,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.medium,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },

  // Edit profile form
  editSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  editInput: {
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.medium,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  editCancel: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  editCancelText: {
    color: COLORS.muted,
    fontSize: 15,
    ...FONTS.medium,
  },
  editSave: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
  },
  editSaveText: {
    color: COLORS.dark,
    fontSize: 15,
    ...FONTS.bold,
  },

  // Recent events
  recentScroll: {
    gap: SPACING.md,
  },
  recentCard: {
    width: 120,
  },
  recentPoster: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  recentTitle: {
    fontSize: 13,
    color: COLORS.white,
    ...FONTS.medium,
  },
  recentDate: {
    fontSize: 11,
    color: COLORS.muted,
    ...FONTS.regular,
  },
});

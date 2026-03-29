import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId, clearCurrentUserId } from '../../lib/auth-cache';
import { User } from '../../types';
import AnimatedPress from '../../components/AnimatedPress';

function GradientAvatar({ letter }: { letter: string }) {
  return (
    <View style={styles.avatarOuter}>
      <Svg width={88} height={88} viewBox="0 0 88 88">
        <Defs>
          <LinearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={COLORS.gold} />
            <Stop offset="0.5" stopColor={COLORS.gold2} />
            <Stop offset="1" stopColor={COLORS.orange} />
          </LinearGradient>
        </Defs>
        <Circle cx="44" cy="44" r="42" stroke="url(#avatarGrad)" strokeWidth="3" fill="none" />
        <Circle cx="44" cy="44" r="38" fill={COLORS.card2} />
      </Svg>
      <Text style={styles.avatarText}>{letter}</Text>
    </View>
  );
}

function StatCard({ value, label, delay }: { value: number; label: string; delay: number }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 150 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.statCard, animStyle]}>
      <Text style={styles.statNum}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [hostedCount, setHostedCount] = useState(0);
  const [attendingCount, setAttendingCount] = useState(0);

  const nameOpacity = useSharedValue(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data as User);
      nameOpacity.value = withSpring(1);
    }

    const { count: hosted } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', userId);
    setHostedCount(hosted ?? 0);

    const { count: attending } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['yes', 'inshallah']);
    setAttendingCount(attending ?? 0);
  };

  const nameStyle = useAnimatedStyle(() => ({ opacity: nameOpacity.value }));

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <GradientAvatar letter={initial} />

          <Animated.View style={[styles.nameBlock, nameStyle]}>
            <Text style={styles.name}>{profile?.display_name ?? 'Loading...'}</Text>
            <Text style={styles.username}>@{profile?.username ?? '...'}</Text>
            {profile?.location_city && (
              <View style={styles.cityRow}>
                <Text style={styles.cityIcon}>📍</Text>
                <Text style={styles.city}>{profile.location_city}</Text>
              </View>
            )}
          </Animated.View>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={hostedCount} label="Hosted" delay={100} />
          <StatCard value={attendingCount} label="Attending" delay={200} />
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          <MenuItem icon="📅" label="My Events" onPress={() => router.push('/(tabs)/events')} />
          <MenuItem icon="✨" label="Create Event" onPress={() => router.push('/(tabs)/create')} />
        </View>

        <AnimatedPress style={styles.signOutButton} haptic="medium" onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </AnimatedPress>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <AnimatedPress style={styles.menuItem} scaleValue={0.98} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuChevron}>›</Text>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  profileSection: { alignItems: 'center', paddingTop: SPACING.lg },
  avatarOuter: {
    width: 88, height: 88, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  avatarText: {
    position: 'absolute', fontSize: 32, color: COLORS.white, ...FONTS.bold,
  },
  nameBlock: { alignItems: 'center', marginBottom: SPACING.xl },
  name: { fontSize: 22, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.xs },
  username: { fontSize: 15, color: COLORS.muted, ...FONTS.regular },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  cityIcon: { fontSize: 13 },
  city: { fontSize: 13, color: COLORS.hint, ...FONTS.regular },
  statsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.lg,
    paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.lg,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { fontSize: 24, color: COLORS.gold, ...FONTS.bold },
  statLabel: { fontSize: 12, color: COLORS.muted, ...FONTS.medium, marginTop: 4 },
  menu: {
    paddingHorizontal: SPACING.xl, gap: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.lg, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    marginBottom: 1,
  },
  menuIcon: { fontSize: 18, marginRight: SPACING.md },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.white, ...FONTS.medium },
  menuChevron: { fontSize: 20, color: COLORS.hint },
  signOutButton: {
    marginHorizontal: SPACING.xl, marginTop: SPACING.xl,
    paddingVertical: SPACING.lg, alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  signOutText: { color: COLORS.red, fontSize: 15, ...FONTS.semibold },
});

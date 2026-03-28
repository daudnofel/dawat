import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) setProfile(data as User);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.display_name ?? 'Loading...'}</Text>
        <Text style={styles.username}>@{profile?.username ?? '...'}</Text>
        {profile?.location_city && (
          <Text style={styles.city}>{profile.location_city}</Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.signOutButton, pressed && { opacity: 0.8 }]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  title: { fontSize: 22, color: COLORS.white, ...FONTS.bold },
  content: { flex: 1, alignItems: 'center', paddingTop: SPACING.xxl },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  avatarText: { fontSize: 28, color: COLORS.dark, ...FONTS.bold },
  name: { fontSize: 20, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.xs },
  username: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, marginBottom: SPACING.sm },
  city: { fontSize: 13, color: COLORS.hint, ...FONTS.regular, marginBottom: SPACING.xxl },
  signOutButton: {
    backgroundColor: COLORS.card2, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.xl,
  },
  signOutText: { color: COLORS.red, fontSize: 14, ...FONTS.semibold },
});

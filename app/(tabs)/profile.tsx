import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
  const { user, signOut, devBypass, setDevBypass } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (devBypass) {
      setDevBypass(false);
    } else {
      await signOut();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>{user?.display_name ?? 'Guest User'}</Text>
        <Text style={styles.username}>@{user?.username ?? 'guest'}</Text>

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
    backgroundColor: COLORS.card2, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  avatarText: { fontSize: 32 },
  name: { fontSize: 20, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.xs },
  username: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, marginBottom: SPACING.xxl },
  signOutButton: {
    backgroundColor: COLORS.card2,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutText: { color: COLORS.red, fontSize: 14, ...FONTS.semibold },
});

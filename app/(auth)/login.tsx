import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { makeRedirectUri } from 'expo-auth-session';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValid = email.includes('@') && email.includes('.');

  const handleContinue = async () => {
    if (!isValid || loading) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push({ pathname: '/(auth)/otp', params: { email } });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const redirectUri = makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error || !data.url) {
        Alert.alert('Error', error?.message ?? 'Could not start Google sign-in');
        setLoading(false);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === 'success' && result.url) {
        // Extract tokens from the redirect URL fragment
        const url = new URL(result.url);
        const fragment = url.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken ?? '',
          });

          setLoading(false);
          router.replace('/(tabs)');
          return;
        }
      }

      setLoading(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.brandingBlock}>
          <Text style={styles.arabicTitle}>دعوت</Text>
          <Text style={styles.englishTitle}>DAWAT</Text>
          <Text style={styles.subtitle}>The Muslim Events Platform</Text>
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Enter your email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="amira@example.com"
            placeholderTextColor={COLORS.hint}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !isValid && styles.buttonDisabled,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleContinue}
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.dark} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>

        <Text style={styles.legal}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xl },
  brandingBlock: { alignItems: 'center', marginBottom: SPACING.xxl + SPACING.xl },
  arabicTitle: { fontSize: 48, color: COLORS.gold, ...FONTS.bold, marginBottom: SPACING.xs },
  englishTitle: { fontSize: 32, color: COLORS.white, ...FONTS.bold, letterSpacing: 6 },
  subtitle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, marginTop: SPACING.sm },
  inputBlock: { marginBottom: SPACING.xl },
  label: { fontSize: 16, color: COLORS.white, ...FONTS.semibold, marginBottom: SPACING.md },
  input: {
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    color: COLORS.white, fontSize: 18, ...FONTS.medium,
  },
  button: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md, paddingVertical: SPACING.lg,
    alignItems: 'center', justifyContent: 'center', height: 52,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: SPACING.xl, gap: SPACING.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.hint, fontSize: 13, ...FONTS.medium },
  googleButton: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, alignItems: 'center',
    justifyContent: 'center', height: 52,
    borderWidth: 1, borderColor: COLORS.border,
  },
  googleText: { color: COLORS.white, fontSize: 16, ...FONTS.semibold },
  legal: {
    color: COLORS.hint, fontSize: 12, ...FONTS.regular,
    textAlign: 'center', marginTop: SPACING.xl, lineHeight: 18,
  },
});

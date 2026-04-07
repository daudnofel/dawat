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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      // Fixed app-scheme redirect — works identically for every developer's
      // Expo Go device because it doesn't depend on local IP / tunnel URL.
      // The scheme "dawat" is registered in app.json.
      const redirectUri = 'dawat://auth-callback';

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
    <View style={styles.screen}>
      {/* Golden atmospheric glow */}
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={500} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="loginGlow" cx="50%" cy="20%" rx="70%" ry="60%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.16" />
              <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.07" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={500} fill="url(#loginGlow)" />
        </Svg>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo — Manrope Light, matches home tab */}
          <View style={styles.brandingBlock}>
            <Text style={styles.englishTitle}>DAWAT</Text>
            <Text style={styles.brandPipe}>|</Text>
            <Text style={styles.arabicTitle}>دعوت</Text>
          </View>
          <Text style={styles.subtitle}>The Muslim Events Platform</Text>

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

          {/* Continue — metallic gold gradient CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              !isValid && styles.buttonDisabled,
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
            onPress={handleContinue}
            disabled={!isValid || loading}
          >
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="ctaLogin" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#FFDFA1" />
                  <Stop offset="0.5" stopColor="#E6C27A" />
                  <Stop offset="1" stopColor="#FFDFA1" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" rx={RADIUS.md} fill="url(#ctaLogin)" />
            </Svg>
            {loading ? (
              <ActivityIndicator color={COLORS.dark} style={{ zIndex: 1 }} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google — glass button */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.dark },
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xl },

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

  // Logo — horizontal, Manrope Light
  brandingBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  englishTitle: {
    fontSize: 36,
    color: COLORS.white,
    fontFamily: 'ManropeLight',
    letterSpacing: 5,
  },
  brandPipe: {
    fontSize: 34,
    color: COLORS.muted,
    fontFamily: 'ManropeLight',
    marginHorizontal: SPACING.md,
    opacity: 0.4,
  },
  arabicTitle: {
    fontSize: 34,
    color: COLORS.gold,
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xxl + SPACING.xl,
  },

  // Input — glass style
  inputBlock: { marginBottom: SPACING.xl },
  label: { fontSize: 16, color: COLORS.white, ...FONTS.semibold, marginBottom: SPACING.md },
  input: {
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.medium,
  },

  // CTA button — metallic gradient
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    overflow: 'hidden',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold, zIndex: 1 },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 223, 161, 0.10)',
  },
  dividerText: { color: COLORS.hint, fontSize: 13, ...FONTS.medium },

  // Google — glass button
  googleButton: {
    backgroundColor: 'rgba(50, 45, 30, 0.55)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  googleText: { color: COLORS.white, fontSize: 16, ...FONTS.semibold },

  // Legal
  legal: {
    color: COLORS.hint,
    fontSize: 12,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 18,
  },
});

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
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValid = email.includes('@') && email.includes('.') && password.length >= 6;

  const handleAuth = async () => {
    if (!isValid || loading) return;
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      // New user — go to onboarding
      router.replace('/(auth)/onboarding');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        if (error.message.includes('Invalid login')) {
          Alert.alert('Account not found', 'Would you like to create one?', [
            { text: 'Cancel' },
            { text: 'Sign Up', onPress: () => setIsSignUp(true) },
          ]);
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }
      // Check if profile exists
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profile) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/onboarding');
        }
      }
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
          <Text style={styles.label}>{isSignUp ? 'Create your account' : 'Sign in'}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.hint}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, { marginTop: SPACING.sm }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (6+ characters)"
            placeholderTextColor={COLORS.hint}
            secureTextEntry
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !isValid && styles.buttonDisabled,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          onPress={handleAuth}
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.dark} />
          ) : (
            <Text style={styles.buttonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
          )}
        </Pressable>

        <Pressable style={styles.toggleAuth} onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Text>
        </Pressable>

        <Text style={styles.legal}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </Text>

        {__DEV__ && (
          <Pressable
            style={styles.devSkip}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.devSkipText}>Skip login (dev mode)</Text>
          </Pressable>
        )}
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
  toggleAuth: { alignItems: 'center', marginTop: SPACING.lg },
  toggleText: { color: COLORS.gold, fontSize: 14, ...FONTS.medium },
  legal: {
    color: COLORS.hint, fontSize: 12, ...FONTS.regular,
    textAlign: 'center', marginTop: SPACING.xl, lineHeight: 18,
  },
  devSkip: { marginTop: SPACING.xxl, alignItems: 'center', paddingVertical: SPACING.md },
  devSkipText: { color: COLORS.muted, fontSize: 13, ...FONTS.regular, textDecorationLine: 'underline' },
});

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
import { Button } from 'heroui-native/button';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

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

        <Button
          variant="primary"
          size="lg"
          isDisabled={!isValid}
          isLoading={loading}
          onPress={handleContinue}
          style={{ width: '100%' }}
        >
          Continue
        </Button>

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
  legal: {
    color: COLORS.hint, fontSize: 12, ...FONTS.regular,
    textAlign: 'center', marginTop: SPACING.xl, lineHeight: 18,
  },
});

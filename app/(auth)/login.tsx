import { useState, useRef } from 'react';
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
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
  const [countryCode, setCountryCode] = useState('+44');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef<TextInput>(null);
  const router = useRouter();

  const isValid = phone.replace(/\D/g, '').length >= 7;

  const handleContinue = async () => {
    if (!isValid || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;

    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Branding */}
        <View style={styles.brandingBlock}>
          <Text style={styles.arabicTitle}>دعوت</Text>
          <Text style={styles.englishTitle}>DAWAT</Text>
          <Text style={styles.subtitle}>The Muslim Events Platform</Text>
        </View>

        {/* Phone Input */}
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Enter your phone number</Text>
          <View style={styles.phoneRow}>
            <TextInput
              style={styles.countryInput}
              value={countryCode}
              onChangeText={setCountryCode}
              keyboardType="phone-pad"
              maxLength={4}
              placeholderTextColor={COLORS.hint}
            />
            <TextInput
              ref={phoneInputRef}
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="7700 900 000"
              placeholderTextColor={COLORS.hint}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
        </View>

        {/* Continue Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !isValid && styles.buttonDisabled,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
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

        {/* Legal */}
        <Text style={styles.legal}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </Text>

        {/* DEV ONLY — remove when Supabase is connected */}
        {__DEV__ && (
          <Pressable
            style={styles.devSkip}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              useAuthStore.getState().setDevBypass(true);
            }}
          >
            <Text style={styles.devSkipText}>Skip login (dev mode)</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  brandingBlock: {
    alignItems: 'center',
    marginBottom: SPACING.xxl + SPACING.xl,
  },
  arabicTitle: {
    fontSize: 48,
    color: COLORS.gold,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  englishTitle: {
    fontSize: 32,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: SPACING.sm,
  },
  inputBlock: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.semibold,
    marginBottom: SPACING.md,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  countryInput: {
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.medium,
    width: 72,
    textAlign: 'center',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.medium,
  },
  button: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: COLORS.dark,
    fontSize: 16,
    ...FONTS.bold,
  },
  legal: {
    color: COLORS.hint,
    fontSize: 12,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 18,
  },
  devSkip: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  devSkipText: {
    color: COLORS.muted,
    fontSize: 13,
    ...FONTS.regular,
    textDecorationLine: 'underline',
  },
});

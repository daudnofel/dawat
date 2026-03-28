import { useState, useRef, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === OTP_LENGTH) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH || loading) return;
    setLoading(true);

    // TODO: Replace with real Supabase verifyOtp when connected
    // const { error } = await supabase.auth.verifyOtp({
    //   phone: phone ?? '',
    //   token: code,
    //   type: 'sms',
    // });

    // Simulate verification for dev
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);

    // In dev mode, simulate new user → onboarding
    router.replace('/(auth)/onboarding');
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    Alert.alert('Code resent', `A new code was sent to ${phone ?? 'your phone'}`);
  };

  const maskedPhone = phone
    ? phone.slice(0, 4) + '****' + phone.slice(-3)
    : '****';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {maskedPhone}
        </Text>

        {/* Hidden input that captures keyboard */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, OTP_LENGTH))}
          keyboardType="number-pad"
          autoFocus
          maxLength={OTP_LENGTH}
        />

        {/* Visual digit boxes */}
        <Pressable style={styles.codeRow} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.digitBox,
                code.length === i && styles.digitBoxActive,
                code.length > i && styles.digitBoxFilled,
              ]}
            >
              <Text style={styles.digitText}>
                {code[i] ?? ''}
              </Text>
            </View>
          ))}
        </Pressable>

        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.gold}
            style={{ marginTop: SPACING.xl }}
          />
        )}

        {/* Resend */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendTimer}>
              Resend code in {countdown}s
            </Text>
          ) : (
            <Pressable onPress={handleResend}>
              <Text style={styles.resendLink}>Resend code</Text>
            </Pressable>
          )}
        </View>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
  },
  backButton: {
    marginBottom: SPACING.xxl,
  },
  backText: {
    color: COLORS.gold,
    fontSize: 16,
    ...FONTS.medium,
  },
  title: {
    fontSize: 24,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: SPACING.xxl,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  digitBox: {
    width: 48,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxActive: {
    borderColor: COLORS.gold,
  },
  digitBoxFilled: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.card2,
  },
  digitText: {
    fontSize: 24,
    color: COLORS.white,
    ...FONTS.bold,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  resendTimer: {
    color: COLORS.hint,
    fontSize: 14,
    ...FONTS.regular,
  },
  resendLink: {
    color: COLORS.gold,
    fontSize: 14,
    ...FONTS.semibold,
  },
});

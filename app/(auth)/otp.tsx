import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { Toast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { setCurrentUserId } from '../../lib/auth-cache';
import { savePushToken } from '../../lib/push';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (code.length === OTP_LENGTH) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH || loading) return;
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email ?? '',
      token: code,
      type: 'email',
    });

    setLoading(false);

    if (error) {
      Toast.error(`Verification failed: ${error.message}`);
      setCode('');
      return;
    }

    if (data.user) {
      setCurrentUserId(data.user.id);
      // Register for push notifications (fire-and-forget, non-blocking)
      void savePushToken(data.user.id);

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    await supabase.auth.signInWithOtp({ email: email ?? '' });
    Toast.success(`Code resent to ${email}`);
  };

  const maskedEmail = email
    ? email.slice(0, 3) + '***@' + email.split('@')[1]
    : '***';

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
        <Text style={styles.subtitle}>We sent a 6-digit code to {maskedEmail}</Text>

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, OTP_LENGTH))}
          keyboardType="number-pad"
          autoFocus
          maxLength={OTP_LENGTH}
        />

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
              <Text style={styles.digitText}>{code[i] ?? ''}</Text>
            </View>
          ))}
        </Pressable>

        {loading && (
          <ActivityIndicator size="small" color={COLORS.gold} style={{ marginTop: SPACING.xl }} />
        )}

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendTimer}>Resend code in {countdown}s</Text>
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
  container: { flex: 1, backgroundColor: COLORS.dark },
  content: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: 80 },
  backButton: { marginBottom: SPACING.xxl },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  title: { fontSize: 24, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, marginBottom: SPACING.xxl },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm },
  digitBox: {
    width: 48, height: 56, borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.input,
    alignItems: 'center', justifyContent: 'center',
  },
  digitBoxActive: { borderColor: COLORS.gold },
  digitBoxFilled: { borderColor: COLORS.gold, backgroundColor: COLORS.card2 },
  digitText: { fontSize: 24, color: COLORS.white, ...FONTS.bold },
  resendRow: { alignItems: 'center', marginTop: SPACING.xxl },
  resendTimer: { color: COLORS.hint, fontSize: 14, ...FONTS.regular },
  resendLink: { color: COLORS.gold, fontSize: 14, ...FONTS.semibold },
});

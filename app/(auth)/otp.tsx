import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from 'heroui-native/button';
import { InputOTP } from 'heroui-native/input-otp';
import { COLORS, FONTS, SPACING } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
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
      Alert.alert('Verification failed', error.message);
      setCode('');
      return;
    }

    if (data.user) {
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
    Alert.alert('Code resent', `A new code was sent to ${email}`);
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
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: SPACING.xxl }}
        >
          ← Back
        </Button>

        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to {maskedEmail}</Text>

        <View style={styles.otpWrap}>
          <InputOTP
            length={OTP_LENGTH}
            value={code}
            onChange={setCode}
            size="lg"
          />
        </View>

        {loading && (
          <ActivityIndicator size="small" color={COLORS.gold} style={{ marginTop: SPACING.xl }} />
        )}

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendTimer}>Resend code in {countdown}s</Text>
          ) : (
            <Button variant="ghost" size="sm" onPress={handleResend}>
              Resend code
            </Button>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  content: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: 80 },
  title: { fontSize: 24, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.muted, ...FONTS.regular, marginBottom: SPACING.xxl },
  otpWrap: { alignItems: 'center' },
  resendRow: { alignItems: 'center', marginTop: SPACING.xxl },
  resendTimer: { color: COLORS.hint, fontSize: 14, ...FONTS.regular },
});

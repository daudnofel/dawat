import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { Gender, GenderPref } from '../../types';
import { supabase, debugSession } from '../../lib/supabase';
import { setCurrentUserId } from '../../lib/auth-cache';
import AnimatedPress from '../../components/AnimatedPress';

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Animation values
  const contentOpacity = useSharedValue(1);
  const contentX = useSharedValue(0);

  const animateTransition = (forward: boolean, callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    contentOpacity.value = withTiming(0, { duration: 150 });
    contentX.value = withTiming(forward ? -30 : 30, { duration: 150 });
    setTimeout(() => {
      callback();
      contentX.value = forward ? 30 : -30;
      contentOpacity.value = withTiming(1, { duration: 200 });
      contentX.value = withSpring(0, { damping: 20, stiffness: 300 });
    }, 160);
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS) {
      animateTransition(true, () => setStep(step + 1));
    }
  };

  const prevStep = () => {
    if (step > 1) {
      animateTransition(false, () => setStep(step - 1));
    }
  };

  const handleNameChange = (text: string) => {
    setDisplayName(text);
    const suggested = text.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 20);
    if (username === '' || username === displayName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 20)) {
      setUsername(suggested);
    }
  };

  const handleComplete = async () => {
    if (saving) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Get session — this contains the JWT that RLS needs
    const session = await debugSession();

    if (!session?.user) {
      Alert.alert('Session expired', 'Please sign in again.');
      setSaving(false);
      router.replace('/(auth)/login');
      return;
    }

    const userId = session.user.id;
    setCurrentUserId(userId);

    console.log('[onboarding] inserting profile for:', userId);

    // Use fetch directly to bypass any client-side session issues
    const accessToken = session.access_token;
    const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: userId,
        display_name: displayName.trim(),
        username: username.trim(),
        gender,
        gender_pref: GenderPref.All,
        location_city: city.trim() || null,
      }),
    });

    const error = res.ok ? null : await res.json();

    setSaving(false);

    if (error) {
      console.log('[onboarding] error:', JSON.stringify(error));
      const msg = error.message ?? JSON.stringify(error);
      const code = error.code ?? '';
      if (code === '23505') {
        Alert.alert('Username taken', 'Try another username.');
        animateTransition(false, () => setStep(2));
      } else {
        Alert.alert('Error', `${msg} (${code})`);
      }
      return;
    }

    router.replace('/(tabs)');
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: contentX.value }],
  }));

  // Step validation
  const canContinue = () => {
    switch (step) {
      case 1: return displayName.trim().length >= 2;
      case 2: return username.trim().length >= 2;
      case 3: return gender !== null;
      case 4: return true; // city is optional
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
        </View>

        {/* Back button */}
        {step > 1 && (
          <AnimatedPress style={styles.backBtn} onPress={prevStep} haptic="light">
            <Text style={styles.backText}>← Back</Text>
          </AnimatedPress>
        )}

        {/* Content */}
        <Animated.View style={[styles.content, contentStyle]}>
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>👋</Text>
              <Text style={styles.stepTitle}>What's your name?</Text>
              <Text style={styles.stepSubtitle}>This is how you'll appear to others</Text>
              <TextInput
                style={styles.bigInput}
                value={displayName}
                onChangeText={handleNameChange}
                placeholder="Your name"
                placeholderTextColor={COLORS.hint}
                autoFocus
                maxLength={40}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>@</Text>
              <Text style={styles.stepTitle}>Pick a username</Text>
              <Text style={styles.stepSubtitle}>People can find you with this</Text>
              <View style={styles.usernameRow}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  style={[styles.bigInput, { flex: 1 }]}
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  placeholderTextColor={COLORS.hint}
                  autoFocus
                  autoCapitalize="none"
                  maxLength={20}
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>🌙</Text>
              <Text style={styles.stepTitle}>How do you identify?</Text>
              <Text style={styles.stepSubtitle}>This helps us show you the right events</Text>
              <View style={styles.optionList}>
                {[
                  { label: 'Male', value: Gender.Male, emoji: '👨' },
                  { label: 'Female', value: Gender.Female, emoji: '👩' },
                  { label: 'Prefer not to say', value: Gender.PreferNotSay, emoji: '🤝' },
                ].map((opt) => (
                  <AnimatedPress
                    key={opt.value}
                    style={[styles.optionCard, gender === opt.value && styles.optionCardActive]}
                    scaleValue={0.97}
                    haptic="light"
                    onPress={() => setGender(opt.value)}
                  >
                    <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.optionLabel, gender === opt.value && styles.optionLabelActive]}>
                      {opt.label}
                    </Text>
                    {gender === opt.value && <Text style={styles.optionCheck}>✓</Text>}
                  </AnimatedPress>
                ))}
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>📍</Text>
              <Text style={styles.stepTitle}>Where are you based?</Text>
              <Text style={styles.stepSubtitle}>We'll show events near you (optional)</Text>
              <TextInput
                style={styles.bigInput}
                value={city}
                onChangeText={setCity}
                placeholder="Dallas, TX"
                placeholderTextColor={COLORS.hint}
                autoFocus
              />
            </View>
          )}
        </Animated.View>

        {/* Bottom button */}
        <View style={styles.bottomArea}>
          <AnimatedPress
            style={[styles.continueBtn, !canContinue() && styles.continueBtnDisabled]}
            haptic="medium"
            onPress={step === TOTAL_STEPS ? handleComplete : nextStep}
            disabled={!canContinue() || saving}
          >
            <Text style={styles.continueBtnText}>
              {saving ? 'Setting up...' : step === TOTAL_STEPS ? 'Get Started' : 'Continue'}
            </Text>
          </AnimatedPress>

          {step === TOTAL_STEPS && (
            <Text style={styles.skipCity} onPress={handleComplete}>
              Skip for now
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  progressBar: {
    height: 3, backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xl, marginTop: SPACING.md, borderRadius: 2,
  },
  progressFill: {
    height: 3, backgroundColor: COLORS.gold, borderRadius: 2,
  },
  backBtn: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xl },
  stepContent: { alignItems: 'center' },
  stepEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  stepTitle: { fontSize: 28, color: COLORS.white, ...FONTS.bold, textAlign: 'center', marginBottom: SPACING.sm },
  stepSubtitle: { fontSize: 15, color: COLORS.muted, ...FONTS.regular, textAlign: 'center', marginBottom: SPACING.xxl },
  bigInput: {
    backgroundColor: COLORS.input, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg + 2,
    color: COLORS.white, fontSize: 22, ...FONTS.semibold,
    width: '100%', textAlign: 'center',
  },
  usernameRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  atSymbol: { fontSize: 24, color: COLORS.gold, ...FONTS.bold, marginRight: SPACING.sm },
  optionList: { width: '100%', gap: SPACING.sm },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  optionCardActive: { borderColor: COLORS.gold, backgroundColor: COLORS.card2 },
  optionEmoji: { fontSize: 24 },
  optionLabel: { flex: 1, fontSize: 17, color: COLORS.muted, ...FONTS.medium },
  optionLabelActive: { color: COLORS.white },
  optionCheck: { fontSize: 18, color: COLORS.gold, ...FONTS.bold },
  bottomArea: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl },
  continueBtn: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg + 2, alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.3 },
  continueBtnText: { color: COLORS.dark, fontSize: 17, ...FONTS.bold },
  skipCity: {
    color: COLORS.muted, fontSize: 14, ...FONTS.medium,
    textAlign: 'center', marginTop: SPACING.lg,
  },
});

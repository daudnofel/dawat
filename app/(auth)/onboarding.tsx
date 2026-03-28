import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING } from '../../lib/theme';
import { Gender, GenderPref } from '../../types';
import { supabase } from '../../lib/supabase';

const GENDER_OPTIONS = [
  { label: 'Male', value: Gender.Male },
  { label: 'Female', value: Gender.Female },
  { label: 'Prefer not to say', value: Gender.PreferNotSay },
];

const FEED_PREF_OPTIONS = [
  { label: 'All Events', value: GenderPref.All },
  { label: 'Sisters Only', value: GenderPref.SistersOnly },
  { label: 'Brothers Only', value: GenderPref.BrothersOnly },
  { label: 'Family', value: GenderPref.Family },
];

export default function OnboardingScreen() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [feedPref, setFeedPref] = useState<GenderPref>(GenderPref.All);
  const [city, setCity] = useState('');
  const router = useRouter();

  const isValid = displayName.trim().length >= 2 && username.trim().length >= 2 && gender !== null;

  // Auto-suggest username from display name
  const handleNameChange = (text: string) => {
    setDisplayName(text);
    if (username === '' || username === suggestUsername(displayName)) {
      setUsername(suggestUsername(text));
    }
  };

  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Error', 'Not authenticated. Please sign in again.');
      setSaving(false);
      router.replace('/(auth)/login');
      return;
    }

    const { error } = await supabase.from('users').insert({
      id: user.id,
      display_name: displayName.trim(),
      username: username.trim(),
      gender,
      gender_pref: feedPref,
      location_city: city.trim() || null,
    });

    setSaving(false);

    if (error) {
      if (error.code === '23505') {
        Alert.alert('Username taken', 'That username is already in use. Try another.');
      } else {
        Alert.alert('Error', error.message);
      }
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself so we can personalise your experience
          </Text>

          {/* Display Name */}
          <Text style={styles.label}>Display name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={handleNameChange}
            placeholder="Amira Khan"
            placeholderTextColor={COLORS.hint}
            autoFocus
            maxLength={40}
          />

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <View style={styles.usernameRow}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={[styles.input, styles.usernameInput]}
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="amira_khan"
              placeholderTextColor={COLORS.hint}
              autoCapitalize="none"
              maxLength={20}
            />
          </View>

          {/* Gender */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.optionRow}>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.optionPill, gender === opt.value && styles.optionPillActive]}
                onPress={() => setGender(opt.value)}
              >
                <Text style={[styles.optionText, gender === opt.value && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* City */}
          <Text style={styles.label}>City (optional)</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Dallas, TX"
            placeholderTextColor={COLORS.hint}
          />

          {/* Feed Preference */}
          <Text style={styles.label}>Default feed filter</Text>
          <View style={styles.optionRow}>
            {FEED_PREF_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.optionPill, feedPref === opt.value && styles.optionPillActive]}
                onPress={() => setFeedPref(opt.value)}
              >
                <Text style={[styles.optionText, feedPref === opt.value && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Complete */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              !isValid && styles.buttonDisabled,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
            onPress={handleComplete}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.dark} />
            ) : (
              <Text style={styles.buttonText}>Complete Profile</Text>
            )}
          </Pressable>

          <Text style={styles.footer}>
            You can update these in Settings anytime
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function suggestUsername(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 20);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: SPACING.xxl,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.semibold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.medium,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSign: {
    color: COLORS.gold,
    fontSize: 18,
    ...FONTS.bold,
    marginRight: SPACING.sm,
  },
  usernameInput: {
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
  },
  optionPillActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.card2,
  },
  optionText: {
    color: COLORS.muted,
    fontSize: 14,
    ...FONTS.medium,
  },
  optionTextActive: {
    color: COLORS.gold,
  },
  button: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: SPACING.xxl,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: COLORS.dark,
    fontSize: 16,
    ...FONTS.bold,
  },
  footer: {
    color: COLORS.hint,
    fontSize: 12,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

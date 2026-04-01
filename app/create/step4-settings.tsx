import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';
import { supabase } from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/auth-cache';
import { generateSlug } from '../../lib/slugify';
import { GenderMode } from '../../types';

const GENDER_OPTIONS = [
  { label: 'Mixed', subtitle: 'Open to all', emoji: '🌟', value: GenderMode.Mixed },
  { label: 'Sisters Only', subtitle: 'Women only', emoji: '🌸', value: GenderMode.SistersOnly },
  { label: 'Brothers', subtitle: 'Men only', emoji: '💪', value: GenderMode.BrothersOnly },
  { label: 'Family', subtitle: 'Parents + kids', emoji: '👨‍👩‍👧', value: GenderMode.Family },
];

export default function Step4Settings({ onPublish }: { onPublish?: () => void }) {
  const { draft, updateDraft, prevStep } = useEventStore();
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);

    const userId = await getCurrentUserId();
    if (!userId) {
      Alert.alert('Error', 'You must be signed in to publish an event.');
      setPublishing(false);
      return;
    }

    const slug = generateSlug(draft.title);
    const serviceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY!;

    const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      title: draft.title,
      description: draft.description || null,
      host_id: userId,
      theme_id: draft.theme_id,
      gender_mode: draft.gender_mode,
      is_id_required: draft.is_id_required,
      date_time: draft.date_time?.toISOString() ?? null,
      date_tbd: draft.date_tbd,
      location_name: draft.location_name || null,
      location_address: draft.location_address || null,
      location_lat: draft.location_lat,
      location_lng: draft.location_lng,
      is_location_hidden: draft.is_location_hidden,
      is_halal_venue: draft.is_halal_venue,
      price: draft.price,
      capacity: draft.capacity,
      rsvp_deadline: draft.rsvp_deadline?.toISOString() ?? null,
      virtual_link: draft.virtual_link || null,
      allow_plus_ones: draft.allow_plus_ones,
      max_plus_ones: draft.max_plus_ones,
      slug,
      is_published: true,
    }),
    });

    setPublishing(false);

    if (!res.ok) {
      const err = await res.json();
      Alert.alert('Error publishing', err.message ?? 'Unknown error');
      return;
    }

    onPublish?.();
  };

  const needsIdNote = draft.gender_mode === GenderMode.SistersOnly || draft.gender_mode === GenderMode.BrothersOnly;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => prevStep()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.stepLabel}>Step 4 of 4</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.dot, styles.dotActive, s === 4 && styles.dotCurrent]} />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Who's this gathering for?</Text>

        {/* 2x2 Gender Grid */}
        <View style={styles.genderGrid}>
          {GENDER_OPTIONS.map((opt) => {
            const isSelected = draft.gender_mode === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[styles.genderCard, isSelected && styles.genderCardSelected]}
                onPress={() => updateDraft({ gender_mode: opt.value })}
              >
                <Text style={styles.genderEmoji}>{opt.emoji}</Text>
                <Text style={[styles.genderLabel, isSelected && styles.genderLabelActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.genderSubtitle}>{opt.subtitle}</Text>
                {isSelected && (
                  <View style={styles.genderCheck}>
                    <Text style={styles.genderCheckText}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {needsIdNote && (
          <Text style={styles.idNote}>
            ID verification recommended for gender-only events
          </Text>
        )}

        {/* Plus Ones */}
        <View style={[styles.toggleRow, { marginTop: SPACING.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255, 223, 161, 0.10)' }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Allow plus-ones?</Text>
            <Text style={styles.toggleHint}>Guests can bring additional people</Text>
          </View>
          <Switch
            value={draft.allow_plus_ones}
            onValueChange={(v) => updateDraft({ allow_plus_ones: v, max_plus_ones: v ? 1 : 0 })}
            trackColor={{ false: COLORS.border, true: COLORS.gold }}
            thumbColor={COLORS.white}
          />
        </View>

        {draft.allow_plus_ones && (
          <View style={styles.plusOneRow}>
            <Text style={styles.toggleLabel}>Max plus-ones per guest</Text>
            <View style={styles.plusOneControls}>
              <Pressable
                style={[styles.plusOneBtn, draft.max_plus_ones <= 1 && { opacity: 0.3 }]}
                onPress={() => updateDraft({ max_plus_ones: Math.max(1, draft.max_plus_ones - 1) })}
                disabled={draft.max_plus_ones <= 1}
              >
                <Text style={styles.plusOneBtnText}>−</Text>
              </Pressable>
              <Text style={styles.plusOneCount}>{draft.max_plus_ones}</Text>
              <Pressable
                style={[styles.plusOneBtn, draft.max_plus_ones >= 10 && { opacity: 0.3 }]}
                onPress={() => updateDraft({ max_plus_ones: Math.min(10, draft.max_plus_ones + 1) })}
                disabled={draft.max_plus_ones >= 10}
              >
                <Text style={styles.plusOneBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ID Verification */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Require ID verification?</Text>
            <Text style={styles.toggleHint}>Guests must verify government ID via Stripe Identity</Text>
          </View>
          <Switch
            value={draft.is_id_required}
            onValueChange={(v) => updateDraft({ is_id_required: v })}
            trackColor={{ false: COLORS.border, true: COLORS.gold }}
            thumbColor={COLORS.white}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.publishButton,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          onPress={handlePublish}
          disabled={publishing}
        >
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="ctaGrad4" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFDFA1" />
                <Stop offset="0.5" stopColor="#E6C27A" />
                <Stop offset="1" stopColor="#FFDFA1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" rx={RADIUS.md} fill="url(#ctaGrad4)" />
          </Svg>
          {publishing ? (
            <ActivityIndicator color={COLORS.dark} style={{ zIndex: 1 }} />
          ) : (
            <Text style={styles.publishText}>Publish Event</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  stepLabel: { color: COLORS.muted, fontSize: 13, ...FONTS.medium },
  progressRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.gold },
  dotCurrent: { width: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 40 },
  title: {
    fontSize: 22, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.xl,
  },
  genderGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md,
  },
  genderCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 161, 0.08)',
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  genderCardSelected: {
    borderColor: 'rgba(255, 223, 161, 0.30)',
    backgroundColor: 'rgba(50, 45, 30, 0.55)',
  },
  genderEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  genderLabel: { fontSize: 15, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.xs },
  genderLabelActive: { color: COLORS.gold },
  genderSubtitle: { fontSize: 12, color: COLORS.muted, ...FONTS.regular },
  genderCheck: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center',
  },
  genderCheckText: { color: COLORS.dark, fontSize: 13, ...FONTS.bold },
  idNote: {
    color: COLORS.amber, fontSize: 13, ...FONTS.regular, marginTop: SPACING.lg,
  },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.lg, marginTop: SPACING.xl,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255, 223, 161, 0.10)',
  },
  toggleLabel: { color: COLORS.white, fontSize: 15, ...FONTS.medium },
  toggleHint: { color: COLORS.hint, fontSize: 12, ...FONTS.regular, marginTop: SPACING.xs },
  bottomBar: {
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255, 223, 161, 0.10)', marginBottom: 90,
  },
  plusOneRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  plusOneControls: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  plusOneBtn: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.card2, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255, 223, 161, 0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  plusOneBtnText: { fontSize: 18, color: COLORS.gold, ...FONTS.bold },
  plusOneCount: { fontSize: 18, color: COLORS.white, ...FONTS.bold, minWidth: 24, textAlign: 'center' },
  publishButton: {
    borderRadius: RADIUS.md,
    alignItems: 'center', height: 52, justifyContent: 'center',
    overflow: 'hidden',
  },
  publishText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold, zIndex: 1 },
});

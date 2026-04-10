import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { DiscoverFilter } from '../lib/hooks/useDiscoverFeed';

// ─── Chip definitions ─────────────────────────────────────────────────
type TimeKey = NonNullable<DiscoverFilter['time']>;
type CategoryKey = NonNullable<DiscoverFilter['category']>;
type AudienceKey = NonNullable<DiscoverFilter['audience']>;

const TIME_CHIPS: { key: TimeKey; label: string }[] = [
  { key: 'this_week', label: 'This Week' },
  { key: 'tonight', label: 'Tonight' },
  { key: 'after_maghrib', label: 'After Maghrib' },
];

const CATEGORY_CHIPS: { key: CategoryKey; label: string; emoji: string }[] = [
  { key: 'social', label: 'Social', emoji: '🎉' },
  { key: 'food', label: 'Food', emoji: '🍽️' },
  { key: 'active', label: 'Active', emoji: '⚽' },
  { key: 'deen', label: 'Deen', emoji: '🕌' },
  { key: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
];

const AUDIENCE_CHIPS: { key: AudienceKey; label: string }[] = [
  { key: 'sisters', label: 'Sisters' },
  { key: 'brothers', label: 'Brothers' },
  { key: 'singles', label: 'Singles' },
];

// ─── Props ────────────────────────────────────────────────────────────
interface Props {
  filter: DiscoverFilter;
  onChange: (next: DiscoverFilter) => void;
}

export default function DiscoverFilterBar({ filter, onChange }: Props) {
  const toggle = <K extends keyof DiscoverFilter>(
    group: K,
    value: DiscoverFilter[K]
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({
      ...filter,
      [group]: filter[group] === value ? undefined : value,
    });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {/* Time group */}
      {TIME_CHIPS.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          active={filter.time === chip.key}
          onPress={() => toggle('time', chip.key)}
        />
      ))}

      <Divider />

      {/* Category group */}
      {CATEGORY_CHIPS.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          emoji={chip.emoji}
          active={filter.category === chip.key}
          onPress={() => toggle('category', chip.key)}
        />
      ))}

      <Divider />

      {/* Audience group */}
      {AUDIENCE_CHIPS.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          active={filter.audience === chip.key}
          onPress={() => toggle('audience', chip.key)}
        />
      ))}
    </ScrollView>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────
function Chip({
  label,
  emoji,
  active,
  onPress,
}: {
  label: string;
  emoji?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Filter by ${label}`}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
      ]}
    >
      {emoji && <Text style={styles.chipEmoji}>{emoji}</Text>}
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────
function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  chipActive: {
    backgroundColor: 'rgba(201, 168, 76, 0.18)',
    borderColor: 'rgba(255, 223, 161, 0.55)',
    borderWidth: 1,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    color: COLORS.white,
    ...FONTS.medium,
  },
  chipLabelActive: {
    color: COLORS.gold2,
    ...FONTS.bold,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
});

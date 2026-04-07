import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { useEventStore } from '../store/useEventStore';

interface ChipPrompt {
  emoji: string;
  label: string;
  title: string;     // pre-fills draft.title
  themeId?: string;  // optional pre-selected theme
}

const PROMPTS: ChipPrompt[] = [
  { emoji: '🌙', label: 'Iftar party',     title: 'Iftar Party',           themeId: 'iftar_glow' },
  { emoji: '🎉', label: 'Eid gathering',   title: 'Eid Gathering',         themeId: 'eid_gala' },
  { emoji: '📿', label: 'Quran circle',    title: 'Quran Circle',          themeId: 'quran_circle' },
  { emoji: '🤝', label: 'Sisters meetup',  title: 'Sisters Meetup',        themeId: 'sisters_halaqa' },
  { emoji: '🍽️', label: 'Potluck dinner',  title: 'Potluck Dinner',        themeId: 'community_table' },
  { emoji: '💍', label: 'Nikah',           title: 'Nikah Celebration',     themeId: 'nikah_garden' },
  { emoji: '📚', label: 'Halaqa',          title: 'Halaqa',                themeId: 'scholars_minimal' },
  { emoji: '🏟️', label: 'Brothers night',  title: 'Brothers Night',        themeId: 'brothers_minimal' },
];

export default function HomeChipPrompts() {
  const router = useRouter();
  const { reset, updateDraft } = useEventStore();

  const handlePress = (prompt: ChipPrompt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    updateDraft({
      title: prompt.title,
      theme_id: prompt.themeId ?? '',
    });
    router.push('/(tabs)/create');
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {PROMPTS.map((prompt) => (
        <Pressable
          key={prompt.label}
          style={({ pressed }) => [styles.chip, pressed && { opacity: 0.75 }]}
          onPress={() => handlePress(prompt)}
        >
          <Text style={styles.emoji}>{prompt.emoji}</Text>
          <Text style={styles.label}>{prompt.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
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
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.medium,
  },
});

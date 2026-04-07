import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { useEventStore } from '../store/useEventStore';
import { supabase } from '../lib/supabase';
import { TrendingTheme } from '../types';

export default function HomeChipPrompts() {
  const router = useRouter();
  const { reset, updateDraft } = useEventStore();
  const [prompts, setPrompts] = useState<TrendingTheme[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('trending_themes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (data) setPrompts(data as TrendingTheme[]);
    })();
  }, []);

  const handlePress = (prompt: TrendingTheme) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    updateDraft({
      title: prompt.description ?? prompt.name,
      theme_id: prompt.theme_id,
    });
    router.navigate('/(tabs)/create');
  };

  if (prompts.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {prompts.map((prompt) => (
        <Pressable
          key={prompt.id}
          style={({ pressed }) => [styles.chip, pressed && { opacity: 0.75 }]}
          onPress={() => handlePress(prompt)}
        >
          <Text style={styles.emoji}>{prompt.emoji}</Text>
          <Text style={styles.label}>{prompt.name}</Text>
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

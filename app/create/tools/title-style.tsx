/**
 * Title style tool sheet (DAW-56).
 *
 * Lets the host pick a typography style for their event title. Mounts
 * TitleStylePicker inside ToolSheet. Writes `title_style` to the draft
 * store — EventPreview re-renders the title in the chosen font live.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ToolSheet from '../../../components/ToolSheet';
import TitleStylePicker from '../../../components/TitleStylePicker';
import { useEventStore } from '../../../store/useEventStore';
import { TitleStyleId } from '../../../lib/title-styles';
import { COLORS, FONTS, SPACING } from '../../../lib/theme';

export default function TitleStyleToolScreen() {
  const router = useRouter();
  const { draft, updateDraft, closeTool } = useEventStore();

  const handleClose = () => {
    closeTool();
    router.back();
  };

  const handleSelect = (id: TitleStyleId) => {
    updateDraft({ title_style: id });
  };

  return (
    <ToolSheet title="Title style" onClose={handleClose} scrollable={false}>
      <View style={styles.container}>
        <Text style={styles.hint}>
          Choose how your event title looks. Each style updates the preview live.
        </Text>
        <TitleStylePicker
          title={draft.title}
          selectedId={draft.title_style}
          onSelect={handleSelect}
        />
      </View>
    </ToolSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  hint: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
});

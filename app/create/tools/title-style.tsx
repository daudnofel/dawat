/**
 * Title style tool sheet (DAW-56).
 *
 * Scrollable via ToolSheet's default scroll. TitleStylePicker renders
 * inline (no internal scroll) so the outer sheet scroll owns all the
 * gesture coordination.
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

import ToolSheet from '../../../components/ToolSheet';
import TitleStylePicker from '../../../components/TitleStylePicker';
import { useEventStore } from '../../../store/useEventStore';
import { TitleStyleId } from '../../../lib/title-styles';
import { COLORS, FONTS } from '../../../lib/theme';

interface Props {
  onClose?: () => void;
}

export default function TitleStyleToolScreen({ onClose }: Props = {}) {
  const { draft, updateDraft, closeTool } = useEventStore();

  const handleClose = () => {
    closeTool();
    onClose?.();
  };

  const handleSelect = (id: TitleStyleId) => {
    updateDraft({ title_style: id });
  };

  return (
    <ToolSheet title="Title style" onClose={handleClose}>
      <Text style={styles.hint}>
        Choose how your event title looks. Each style updates the preview live.
      </Text>
      <TitleStylePicker
        title={draft.title}
        selectedId={draft.title_style}
        onSelect={handleSelect}
      />
    </ToolSheet>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: 12,
    lineHeight: 20,
  },
});

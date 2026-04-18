/**
 * Effect tool sheet (DAW-54).
 *
 * Mounts the reusable `EffectGrid` inside the shared `ToolSheet`. The
 * editor canvas underneath is already rendering `EventEffect` with the
 * active `draft.effect_id`, so selecting a new tile instantly updates the
 * ambient animation behind the sheet. No additional preview strip needed.
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

import ToolSheet from '../../../components/ToolSheet';
import EffectGrid from '../../../components/EffectGrid';
import { useEventStore } from '../../../store/useEventStore';
import { EffectId } from '../../../types';
import { COLORS, FONTS, SPACING } from '../../../lib/theme';

interface Props {
  onClose?: () => void;
}

export default function EffectToolScreen({ onClose }: Props = {}) {
  const { draft, updateDraft, closeTool } = useEventStore();

  const handleClose = () => {
    closeTool();
    onClose?.();
  };

  return (
    <ToolSheet title="Effect" onClose={handleClose}>
      <Text style={styles.hint}>
        A subtle ambient animation on your event page. Pick None to keep it
        clean.
      </Text>
      <EffectGrid
        value={(draft.effect_id as EffectId | null) ?? null}
        onChange={(effect) => updateDraft({ effect_id: effect })}
      />
    </ToolSheet>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
});

/**
 * Theme tool sheet (DAW-54).
 *
 * Mounts the existing `ThemePicker` inside the shared `ToolSheet`. The
 * picker is already a pure value/onChange component so it writes straight
 * through to the draft — the editor canvas underneath re-renders on every
 * selection, giving hosts instant feedback on the new theme gradient +
 * emoji banner without having to close the sheet.
 */

import React from 'react';
import { useRouter } from 'expo-router';

import ToolSheet from '../../../components/ToolSheet';
import ThemePicker from '../../../components/ThemePicker';
import { useEventStore } from '../../../store/useEventStore';

export default function ThemeToolScreen() {
  const router = useRouter();
  const { draft, updateDraft, closeTool } = useEventStore();

  const handleClose = () => {
    closeTool();
    router.back();
  };

  return (
    <ToolSheet title="Theme" onClose={handleClose}>
      <ThemePicker
        selectedId={draft.theme_id}
        onSelect={(theme) => updateDraft({ theme_id: theme.id })}
      />
    </ToolSheet>
  );
}

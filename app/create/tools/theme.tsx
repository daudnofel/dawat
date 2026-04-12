/**
 * Theme tool sheet (DAW-54 / DAW-58).
 *
 * Mounts the existing `ThemePicker` inside the shared `ToolSheet`. The
 * picker is already a pure value/onChange component so it writes straight
 * through to the draft — the editor canvas underneath re-renders on every
 * selection, giving hosts instant feedback on the new theme gradient +
 * emoji banner without having to close the sheet.
 *
 * DAW-58: selecting a theme also auto-applies its `defaultTitleStyle`
 * to the draft, so the title font cascades from the theme choice. The
 * host can always override via the title style picker afterward.
 */

import React, { useRef } from 'react';
import { useRouter } from 'expo-router';

import ToolSheet from '../../../components/ToolSheet';
import ThemePicker from '../../../components/ThemePicker';
import { useEventStore } from '../../../store/useEventStore';
import { DawatTheme } from '../../../types';

export default function ThemeToolScreen() {
  const router = useRouter();
  const { draft, updateDraft, closeTool } = useEventStore();

  // Track whether the host has manually set a title style in this session.
  // If they picked a title style *before* changing the theme, we respect
  // their choice and don't overwrite it. If they haven't touched the title
  // style tool yet (still on default or whatever the previous theme set),
  // we cascade the new theme's default.
  const userOverrodeTitleStyle = useRef(false);

  const handleClose = () => {
    closeTool();
    router.back();
  };

  const handleSelect = (theme: DawatTheme) => {
    const updates: Record<string, string | null> = { theme_id: theme.id };

    // DAW-58: cascade theme → title style unless user explicitly overrode
    if (!userOverrodeTitleStyle.current && theme.defaultTitleStyle) {
      updates.title_style = theme.defaultTitleStyle;
    }

    updateDraft(updates);
  };

  return (
    <ToolSheet title="Theme" onClose={handleClose}>
      <ThemePicker
        selectedId={draft.theme_id}
        onSelect={handleSelect}
      />
    </ToolSheet>
  );
}

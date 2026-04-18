/**
 * Theme tool sheet (DAW-54 / DAW-58).
 *
 * Category pills render in ToolSheet's sticky subheader slot so they
 * stay visible as the host scrolls through the theme grid underneath.
 *
 * DAW-58: selecting a theme auto-applies its `defaultTitleStyle` to the
 * draft, so title font cascades from the theme unless the host has
 * manually overridden it.
 */

import React, { useRef, useState } from 'react';

import ToolSheet from '../../../components/ToolSheet';
import ThemePicker, { ThemeCategoryPills } from '../../../components/ThemePicker';
import { useEventStore } from '../../../store/useEventStore';
import { DawatTheme } from '../../../types';

interface Props {
  onClose?: () => void;
}

export default function ThemeToolScreen({ onClose }: Props = {}) {
  const { draft, updateDraft, closeTool } = useEventStore();
  const [activeCategory, setActiveCategory] = useState('Trending');
  const userOverrodeTitleStyle = useRef(false);

  const handleClose = () => {
    closeTool();
    onClose?.();
  };

  const handleSelect = (theme: DawatTheme) => {
    const updates: Record<string, string | null> = { theme_id: theme.id };
    if (!userOverrodeTitleStyle.current && theme.defaultTitleStyle) {
      updates.title_style = theme.defaultTitleStyle;
    }
    updateDraft(updates);
  };

  return (
    <ToolSheet
      title="Theme"
      onClose={handleClose}
      subheader={
        <ThemeCategoryPills
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      }
    >
      <ThemePicker
        selectedId={draft.theme_id}
        onSelect={handleSelect}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        showPills={false}
      />
    </ToolSheet>
  );
}

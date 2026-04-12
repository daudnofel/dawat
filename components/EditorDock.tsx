/**
 * EditorDock — the floating tool bar at the bottom of the creation editor
 * (DAW-37). Five tool buttons (Poster / Theme / Effect / Details / Audience)
 * laid out horizontally over the live event preview. Tapping any button
 * fires `onToolPress(tool)`.
 *
 * In DAW-37 (foundation) every button is rendered as an outlined pill with
 * a gold glyph + muted label. The screen that mounts the dock wires
 * `onToolPress` to a "Coming soon" toast until DAW-54 lights the tool
 * sheets up — the buttons themselves are not disabled, so haptics and press
 * feedback still fire and we can tell everything is wired correctly.
 *
 * Styling: dark card background at 90% alpha with a hairline gold border so
 * it feels like a floating glass bar — does not compete with the poster
 * hero above it. Safe-area aware: callers pass the bottom inset.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';
import { EditorToolId } from '../store/useEventStore';

interface ToolDef {
  id: EditorToolId;
  glyph: string;
  label: string;
}

// Order matters — this is the visual left-to-right sequence in the dock.
// Publish is deliberately NOT here; it lives in the top-right EditorChrome
// pill so the dock stays focused on creative decisions.
const TOOLS: ToolDef[] = [
  { id: 'poster', glyph: '🖼', label: 'Poster' },
  { id: 'theme', glyph: '🎨', label: 'Theme' },
  { id: 'title-style', glyph: 'Aa', label: 'Title' },
  { id: 'effect', glyph: '✨', label: 'Effect' },
  { id: 'details', glyph: '📍', label: 'Details' },
  { id: 'audience', glyph: '🌟', label: 'Audience' },
];

export interface EditorDockProps {
  activeTool: EditorToolId | null;
  onToolPress: (tool: EditorToolId) => void;
  /** Extra bottom padding for the home-indicator safe area. */
  bottomInset?: number;
}

export default function EditorDock({
  activeTool,
  onToolPress,
  bottomInset = SPACING.xl,
}: EditorDockProps) {
  const handlePress = (tool: EditorToolId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToolPress(tool);
  };

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: bottomInset + SPACING.sm },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barContent}
        >
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <Pressable
                key={tool.id}
                onPress={() => handlePress(tool.id)}
                style={({ pressed }) => [
                  styles.toolButton,
                  isActive && styles.toolButtonActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${tool.label} tool`}
              >
                <Text style={styles.toolGlyph}>{tool.glyph}</Text>
                <Text
                  style={[
                    styles.toolLabel,
                    isActive && styles.toolLabelActive,
                  ]}
                >
                  {tool.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  bar: {
    backgroundColor: 'rgba(22,22,22,0.92)',
    borderRadius: RADIUS.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201,168,76,0.24)',
    overflow: 'hidden',
  },
  barContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  toolButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minWidth: 64,
    gap: 4,
  },
  toolButtonActive: {
    backgroundColor: 'rgba(201,168,76,0.14)',
  },
  toolGlyph: {
    fontSize: 20,
  },
  toolLabel: {
    fontSize: 11,
    ...FONTS.medium,
    color: COLORS.muted,
    letterSpacing: 0.2,
  },
  toolLabelActive: {
    color: COLORS.gold,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});

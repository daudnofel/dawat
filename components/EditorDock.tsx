/**
 * EditorDock — the floating tool bar at the bottom of the creation editor
 * (DAW-37). Six tool buttons laid out horizontally over the live event
 * preview. Tapping any button fires `onToolPress(tool)`.
 *
 * Styling: matches the main app's GlassTabBar — an `expo-glass-effect`
 * `GlassView` with a light dark tint, hairline white border, and a rounded
 * pill silhouette. Sits over the preview and blurs whatever is underneath.
 * Safe-area aware: callers pass the bottom inset.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { GlassView } from 'expo-glass-effect';
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

// Matches GlassTabBar's proportions so the two bars read as a set:
// full pill silhouette, ~64pt tall, white-tint active highlight.
const DOCK_HEIGHT = 64;
const DOCK_RADIUS = DOCK_HEIGHT / 2;

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
      <View style={styles.shadow}>
        <GlassView
          style={styles.bar}
          glassEffectStyle="clear"
          colorScheme="dark"
        >
          <View style={styles.barTint} pointerEvents="none" />
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
        </GlassView>
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
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderRadius: DOCK_RADIUS,
  },
  bar: {
    height: DOCK_HEIGHT,
    borderRadius: DOCK_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  barTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  barContent: {
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    gap: 2,
  },
  toolButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    height: DOCK_HEIGHT - 8,
    borderRadius: (DOCK_HEIGHT - 8) / 2,
    minWidth: 64,
    gap: 3,
  },
  // Same white-tint highlight the main tab bar uses for the focused tab.
  toolButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  toolGlyph: {
    fontSize: 18,
  },
  toolLabel: {
    fontSize: 10,
    ...FONTS.medium,
    color: 'rgba(255,255,255,0.35)',
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

/**
 * EditorDock — the floating tool bar at the bottom of the creation editor.
 *
 * Mirrors the main app's GlassTabBar exactly:
 *   - Fixed width, centered, floats above the home indicator
 *   - `expo-glass-effect` GlassView background, dark tint, white border
 *   - White-tint indicator behind the active tool
 *   - Thin SVG line icons (no emoji) so the visual weight matches the tabs
 *
 * Six tools fit into the same overall pill width by giving each tab
 * slightly less horizontal room than the main app's five tabs.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { COLORS, FONTS } from '../lib/theme';
import { EditorToolId } from '../store/useEventStore';

// ─── Icons (thin line, same stroke weight as GlassTabBar) ──────────────

interface IconProps {
  active: boolean;
}

const stroke = (active: boolean) => (active ? '#FFF' : 'rgba(255,255,255,0.45)');

function PosterIcon({ active }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={stroke(active)} strokeWidth={1.8} />
      <Circle cx="8.5" cy="8.5" r="1.5" stroke={stroke(active)} strokeWidth={1.8} />
      <Path d="M21 15L16 10L5 21" stroke={stroke(active)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ThemeIcon({ active }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2c5.06 0 9 3.5 9 8 0 2.5-1.79 4.5-4 4.5h-2c-.83 0-1.5.67-1.5 1.5 0 .39.15.74.39 1 .25.27.41.62.41 1.01 0 .83-.67 1.5-1.5 1.5L12 22z"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx="6.5" cy="11.5" r="1.2" fill={stroke(active)} />
      <Circle cx="9.5" cy="7" r="1.2" fill={stroke(active)} />
      <Circle cx="14.5" cy="7" r="1.2" fill={stroke(active)} />
      <Circle cx="17.5" cy="11" r="1.2" fill={stroke(active)} />
    </Svg>
  );
}

function TitleIcon({ active }: IconProps) {
  // "Aa" letterforms drawn as paths so weight matches other icons
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 18L7 6L11 18M4.5 14H9.5" stroke={stroke(active)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 18C16.79 18 15 16.21 15 14C15 11.79 16.79 10 19 10C20.1 10 21 10.45 21.5 11.1V18M21.5 14C21.5 16.21 20.6 18 19 18" stroke={stroke(active)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function EffectIcon({ active }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" stroke={stroke(active)} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M19 16L19.6 17.4L21 18L19.6 18.6L19 20L18.4 18.6L17 18L18.4 17.4L19 16Z" stroke={stroke(active)} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

function DetailsIcon({ active }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21S5 14.5 5 10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10C19 14.5 12 21 12 21Z"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="10" r="2.5" stroke={stroke(active)} strokeWidth={1.8} />
    </Svg>
  );
}

function AudienceIcon({ active }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21V19C16 16.79 14.21 15 12 15H6C3.79 15 2 16.79 2 19V21"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="7" r="4" stroke={stroke(active)} strokeWidth={1.8} />
      <Path
        d="M22 21V19C22 17.13 20.72 15.55 19 15.13"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3.13C17.72 3.55 19 5.13 19 7C19 8.87 17.72 10.45 16 10.87"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Tools ────────────────────────────────────────────────────

interface ToolDef {
  id: EditorToolId;
  label: string;
  Icon: React.ComponentType<IconProps>;
}

const TOOLS: ToolDef[] = [
  { id: 'poster', label: 'Poster', Icon: PosterIcon },
  { id: 'theme', label: 'Theme', Icon: ThemeIcon },
  { id: 'title-style', label: 'Title', Icon: TitleIcon },
  { id: 'effect', label: 'Effect', Icon: EffectIcon },
  { id: 'details', label: 'Details', Icon: DetailsIcon },
  { id: 'audience', label: 'Audience', Icon: AudienceIcon },
];

// ─── Layout — match GlassTabBar visually ──────────────────────

const DOCK_WIDTH = 360; // GlassTabBar is 340 for 5 tabs; 360 fits 6 with the same density
const DOCK_HEIGHT = 64;
const INDICATOR_PADDING = 4;
const TAB_WIDTH = DOCK_WIDTH / TOOLS.length;
const INDICATOR_HEIGHT = DOCK_HEIGHT - INDICATOR_PADDING * 2;
const FLOAT_FROM_BOTTOM = 28; // same as GlassTabBar's `bottom: 28`

export interface EditorDockProps {
  activeTool: EditorToolId | null;
  onToolPress: (tool: EditorToolId) => void;
  /** Bottom safe area inset from the screen that mounts the dock. */
  bottomInset?: number;
}

export default function EditorDock({
  activeTool,
  onToolPress,
  bottomInset = 0,
}: EditorDockProps) {
  const handlePress = (tool: EditorToolId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToolPress(tool);
  };

  // Index of the currently-active tool. -1 if none.
  const activeIndex = TOOLS.findIndex((t) => t.id === activeTool);

  return (
    <View
      style={[
        styles.wrapper,
        { bottom: FLOAT_FROM_BOTTOM + bottomInset },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.shadow}>
        <GlassView
          style={styles.container}
          glassEffectStyle="clear"
          colorScheme="dark"
        >
          <View style={styles.barTint} pointerEvents="none" />

          {/* White-tint indicator behind the active tool */}
          {activeIndex !== -1 && (
            <View
              pointerEvents="none"
              style={[
                styles.indicatorWrapper,
                { left: activeIndex * TAB_WIDTH },
              ]}
            >
              <View style={styles.indicatorHighlight} />
            </View>
          )}

          <View style={styles.tabs}>
            {TOOLS.map((tool) => {
              const isActive = activeTool === tool.id;
              const Icon = tool.Icon;
              return (
                <Pressable
                  key={tool.id}
                  style={styles.tabItem}
                  onPress={() => handlePress(tool.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${tool.label} tool`}
                >
                  <Icon active={isActive} />
                  <Text
                    style={[
                      styles.label,
                      isActive && styles.labelActive,
                    ]}
                  >
                    {tool.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  container: {
    width: DOCK_WIDTH,
    height: DOCK_HEIGHT,
    borderRadius: DOCK_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  barTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  indicatorWrapper: {
    position: 'absolute',
    top: INDICATOR_PADDING,
    width: TAB_WIDTH,
    height: INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorHighlight: {
    width: TAB_WIDTH - 8,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.2,
    ...FONTS.medium,
  },
  labelActive: {
    color: COLORS.gold,
  },
});

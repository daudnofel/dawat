// components/DiscoverViewToggle.tsx
// DAW-27 — Segmented control for switching Discover between List and Calendar
// modes. Header-anchored (not floating) to keep the tab bar clean.
//
// Visual: glass pill with two equal segments. Active segment has a gold-tinted
// filled background with a hairline ring and an accent dot under the label.
// Inactive segment is transparent with muted text.

import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

export type DiscoverViewMode = 'list' | 'calendar';

interface Props {
  mode: DiscoverViewMode;
  onChange: (mode: DiscoverViewMode) => void;
}

const SEGMENTS: { key: DiscoverViewMode; label: string }[] = [
  { key: 'list', label: 'List' },
  { key: 'calendar', label: 'Calendar' },
];

export default function DiscoverViewToggle({ mode, onChange }: Props) {
  const handlePress = (next: DiscoverViewMode) => {
    if (next === mode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(next);
  };

  return (
    <View
      style={styles.track}
      accessibilityRole="tablist"
      accessibilityLabel="Discover view mode"
    >
      {SEGMENTS.map((seg) => {
        const active = seg.key === mode;
        return (
          <Pressable
            key={seg.key}
            onPress={() => handlePress(seg.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${seg.label} view`}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {seg.label}
            </Text>
            {active && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  segment: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: 'rgba(201, 168, 76, 0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.55)',
  },
  label: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.medium,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: COLORS.gold2,
    ...FONTS.bold,
  },
  activeDot: {
    position: 'absolute',
    bottom: 1,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gold2,
  },
});

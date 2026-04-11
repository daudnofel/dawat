// components/MomentBanner.tsx
// DAW-36 — Warm Muslim-moment banner for Discover's calendar mode.
//
// Sits at the top of DiscoverAgendaPanel and surfaces culturally
// significant days — Jumu'ah, Ramadan, Eid, Laylatul Qadr, Arafah,
// Muharram, Ashura, Mawlid — using the copy defined in
// lib/islamicMoments.ts (DAW-33).
//
// Design intent:
//   • Lives ONLY in the selected-day panel, never in the month grid.
//     The grid stays legibility-first.
//   • Three tonal variants (blessed / celebration / reflection) pull
//     slightly different accent colors from the Dawat palette so the
//     warmth is felt without becoming a second brand.
//   • Pure presentational. No data fetching, no hooks beyond props.
//   • Graceful: renders nothing when the day has no moment.
//
// This component is deliberately quiet — one emoji, one title, one
// subtitle, one subtle tinted background. Nothing competes with the
// events on the day.

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { IslamicMoment, MomentTone } from '../lib/islamicMoments';

// ─── Tonal palette ────────────────────────────────────────────────────
// Each tone gets a soft tinted background + a subtle border in the same
// hue. All colors sourced from the Dawat design tokens so the banner
// never feels off-brand.
interface ToneStyle {
  background: string;
  border: string;
  accent: string;
}

const TONE_STYLES: Record<MomentTone, ToneStyle> = {
  blessed: {
    // Gold — for Jumu'ah, Mawlid. The warm masjid glow.
    background: 'rgba(201, 168, 76, 0.14)',
    border: 'rgba(255, 223, 161, 0.32)',
    accent: COLORS.gold2,
  },
  celebration: {
    // Warm orange — for Eid days. Festive without being loud.
    background: 'rgba(232, 118, 10, 0.14)',
    border: 'rgba(232, 118, 10, 0.32)',
    accent: COLORS.orange,
  },
  reflection: {
    // Cool blue — for Ramadan, Laylatul Qadr, Arafah, Muharram, Ashura.
    // Quiet, contemplative, fajr-sky.
    background: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.28)',
    accent: COLORS.blue,
  },
};

// ─── Types ────────────────────────────────────────────────────────────
interface Props {
  moment: IslamicMoment | null;
}

// ─── Component ────────────────────────────────────────────────────────
export default function MomentBanner({ moment }: Props) {
  if (!moment) return null;

  const tone = TONE_STYLES[moment.tone];

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: tone.background, borderColor: tone.border },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${moment.title}. ${moment.subtitle}`}
    >
      <Text style={styles.emoji}>{moment.emoji}</Text>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: tone.accent }]}>
          {moment.title}
        </Text>
        <Text style={styles.subtitle}>{moment.subtitle}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: SPACING.lg,
  },
  emoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    ...FONTS.bold,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.regular,
    lineHeight: 17,
  },
});

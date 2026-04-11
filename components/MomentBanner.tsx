// components/MomentBanner.tsx
// DAW-36 — Original: card-with-border + 28px emoji block for cultural moments.
// DAW-51 — Editorial refactor: drops the border and the emoji-first row
//          in favor of a magazine-style slab: left accent bar in the
//          tonal color, small uppercase kicker, title, single-sentence
//          subtitle. Reads like a pull-quote, not a notification.
//
// Design intent:
//   • Lives ONLY in the selected-day panel, never in the month grid.
//   • Three tonal variants (blessed / celebration / reflection) pull
//     accent colors from the Dawat palette. Each variant gets a 3px
//     left bar + a matching soft tint.
//   • Pure presentational. No data fetching, no hooks beyond props.
//   • Graceful: renders nothing when the day has no moment.

import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { IslamicMoment, MomentTone } from '../lib/islamicMoments';

// ─── Tonal palette ────────────────────────────────────────────────────
// DAW-51: border is gone. Only a soft background tint and a left accent
// bar remain. Alphas are dropped from 0.14 → 0.10 so the banner reads
// as quiet editorial rather than a card.
interface ToneStyle {
  background: string;
  accent: string;
}

const TONE_STYLES: Record<MomentTone, ToneStyle> = {
  blessed: {
    // Gold — Jumu'ah, Mawlid. The warm masjid glow.
    background: 'rgba(201, 168, 76, 0.10)',
    accent: COLORS.gold2,
  },
  celebration: {
    // Warm orange — Eid days. Festive without being loud.
    background: 'rgba(232, 118, 10, 0.10)',
    accent: COLORS.orange,
  },
  reflection: {
    // Cool blue — Ramadan, Laylatul Qadr, Arafah, Muharram, Ashura.
    // Quiet, contemplative, fajr-sky.
    background: 'rgba(96, 165, 250, 0.10)',
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
      style={[styles.wrap, { backgroundColor: tone.background }]}
      accessibilityRole="summary"
      accessibilityLabel={`${moment.kicker}. ${moment.title}. ${moment.subtitle}`}
    >
      {/* 3px left accent bar — the visual hook of the editorial slab. */}
      <View style={[styles.accentBar, { backgroundColor: tone.accent }]} />

      <View style={styles.textCol}>
        <Text style={[styles.kicker, { color: tone.accent }]}>
          {moment.kicker}
        </Text>
        <Text style={styles.title}>
          {moment.emoji}  {moment.title}
        </Text>
        <Text style={styles.subtitle}>{moment.subtitle}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const ACCENT_BAR_WIDTH = 3;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: RADIUS.md,
    // Inner padding + left accent bar live inside wrap. No border.
    paddingRight: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  accentBar: {
    width: ACCENT_BAR_WIDTH,
    borderTopRightRadius: 1.5,
    borderBottomRightRadius: 1.5,
    marginRight: SPACING.lg,
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  kicker: {
    fontSize: 10,
    ...FONTS.bold,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  title: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    lineHeight: 18,
  },
});

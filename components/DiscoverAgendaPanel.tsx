// components/DiscoverAgendaPanel.tsx
// DAW-30 — The selected-date agenda for Discover's calendar mode.
// DAW-36 — Mounts MomentBanner at the top of the panel and swaps in
//          moment-aware empty state copy on Jumu'ah so a quiet Friday
//          feels like an invitation, not a void.
// DAW-52 — Editorial hierarchy pass. The old bold-date + gold-count-chip
//          row duplicated the visual weight of the MomentBanner above
//          it. Replaced with an editorial stack:
//            • Small uppercase kicker (TODAY'S AGENDA / UPCOMING /
//              JUMU'AH / FILTERED)
//            • 22px bold date title with inline secondary "· N events"
//          Empty state flattened (no card bg/border), emoji dropped
//          from 38 → 32, and the gap between banner → header → list
//          tightened by a grade so the panel reads as a single flow.
//
// Sits beneath MonthGrid. When the user taps a day, this panel shows a
// friendly day label ("Today" / "Tomorrow" / "Friday Apr 18") and all
// events on that day as horizontal EventCards. When the day is empty it
// shows a warm, on-brand empty state with a "Start something" CTA that
// drops the user into the create flow.
//
// Data comes from the parent (eventsByDate + selectedDate) — this panel
// owns no state.

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { DiscoverEvent } from '../lib/hooks/useDiscoverFeed';
import { renderEventCard } from './DiscoverListView';
import MomentBanner from './MomentBanner';
import { getMomentForDate } from '../lib/islamicMoments';

// ─── Helpers ──────────────────────────────────────────────────────────
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/** Friendly label: "Today" / "Tomorrow" / "Friday Apr 18". */
function friendlyLabel(d: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/** Short form used in empty state copy: "Friday" / "Saturday". */
function weekdayOnly(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Picks the small uppercase kicker shown above the date title.
 * Order of precedence: filter → moment → today → default.
 */
function kickerFor(
  selectedDate: Date,
  today: Date,
  isFiltered: boolean,
  momentKicker: string | null
): string {
  if (isFiltered) return 'FILTERED';
  if (momentKicker) return momentKicker;
  if (isSameDay(selectedDate, today)) return "TODAY'S AGENDA";
  return 'UPCOMING';
}

// ─── Types ────────────────────────────────────────────────────────────
interface Props {
  selectedDate: Date | null;
  eventsByDate: Map<string, DiscoverEvent[]>;
  /** DAW-31 — true when a DiscoverFilter is actively narrowing results. */
  isFiltered?: boolean;
  /** DAW-31 — called when user taps the in-panel "Clear filter" button. */
  onClearFilter?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────
export default function DiscoverAgendaPanel({
  selectedDate,
  eventsByDate,
  isFiltered = false,
  onClearFilter,
}: Props) {
  const router = useRouter();

  if (!selectedDate) {
    return null;
  }

  const events = eventsByDate.get(dateKey(selectedDate)) ?? [];
  const label = friendlyLabel(selectedDate);
  const weekday = weekdayOnly(selectedDate);
  const moment = getMomentForDate(selectedDate);

  // DAW-36 — Jumu'ah gets a softer, more inviting empty-state copy.
  // The weekly Jumu'ah moment from islamicMoments.ts carries id "jumuah".
  const isJumuah = moment?.id === 'jumuah';

  // DAW-52 — kicker copy for the editorial header. Same `today` the
  // rest of the calendar uses; computed locally because the panel
  // owns no other date state.
  const today = new Date();
  const kicker = kickerFor(selectedDate, today, isFiltered, moment?.kicker ?? null);

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/create');
  };

  const handleClearFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClearFilter?.();
  };

  return (
    <View style={styles.wrap}>
      {/* DAW-36 — Muslim-moment banner (only renders on culturally
          significant days; silent otherwise). */}
      <MomentBanner moment={moment} />

      {/* DAW-52 — Editorial header: kicker → date title with inline count */}
      <View style={styles.header}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.headerLabel}>
          {label}
          {events.length > 0 && (
            <Text style={styles.headerCount}>
              {'  ·  '}
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </Text>
          )}
        </Text>
      </View>

      {events.length === 0 ? (
        // ─── Warm empty state with CTA ──────────────────────────────
        // DAW-31: when a filter is hiding events, swap copy + CTA to
        //   "Clear filter" instead of pushing the user to create.
        // DAW-36: on Jumu'ah, lean into the moment with softer copy so
        //   a quiet Friday feels like an invitation, not a void.
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>
            {isFiltered ? '🔍' : isJumuah ? '🕌' : '✨'}
          </Text>
          <Text style={styles.emptyTitle}>
            {isFiltered
              ? `No matching events on ${weekday}`
              : isJumuah
              ? `A quiet Jumu'ah`
              : `Nothing yet on ${weekday}`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isFiltered
              ? 'Try clearing your filter to see everything on this day.'
              : isJumuah
              ? 'A good day to start something. Invite the brothers, invite the sisters — the barakah follows the gathering.'
              : 'Be the first to host something the community will remember.'}
          </Text>
          {isFiltered ? (
            <Pressable
              onPress={handleClearFilter}
              style={({ pressed }) => [
                styles.ctaButton,
                styles.ctaButtonSecondary,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Clear filter"
            >
              <Text style={styles.ctaTextSecondary}>Clear filter</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleCreate}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Start something — create a new event"
            >
              <Text style={styles.ctaText}>Start something</Text>
            </Pressable>
          )}
        </View>
      ) : (
        // ─── Event list for the day ────────────────────────────────
        <View style={styles.list}>
          {events.map((event) => (
            <View key={event.id} style={styles.cardWrap}>
              {renderEventCard(event)}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrap: {
    marginTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  // DAW-52 — Editorial header. Kicker + large date title with inline
  // secondary count. No standalone gold chip.
  header: {
    marginBottom: SPACING.sm,
  },
  kicker: {
    fontSize: 10,
    color: COLORS.gold2,
    ...FONTS.bold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerLabel: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.4,
  },
  headerCount: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    letterSpacing: 0,
  },

  list: {
    gap: SPACING.md,
  },
  cardWrap: {
    marginBottom: SPACING.md,
  },

  // DAW-52 — Empty state flattened. No rgba background, no hairline
  // border — the panel's own container now carries the visual weight.
  // Relies on padding + centered text + looser subtitle line-height.
  emptyCard: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.2,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    lineHeight: 20,
  },
  ctaButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold2,
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.55)',
  },
  ctaText: {
    fontSize: 14,
    color: COLORS.dark,
    ...FONTS.bold,
    letterSpacing: 0.2,
  },
  ctaTextSecondary: {
    fontSize: 14,
    color: COLORS.gold2,
    ...FONTS.bold,
    letterSpacing: 0.2,
  },
});

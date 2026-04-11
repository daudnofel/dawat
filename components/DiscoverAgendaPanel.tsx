// components/DiscoverAgendaPanel.tsx
// DAW-30 — The selected-date agenda for Discover's calendar mode.
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

// ─── Types ────────────────────────────────────────────────────────────
interface Props {
  selectedDate: Date | null;
  eventsByDate: Map<string, DiscoverEvent[]>;
}

// ─── Component ────────────────────────────────────────────────────────
export default function DiscoverAgendaPanel({
  selectedDate,
  eventsByDate,
}: Props) {
  const router = useRouter();

  if (!selectedDate) {
    return null;
  }

  const events = eventsByDate.get(dateKey(selectedDate)) ?? [];
  const label = friendlyLabel(selectedDate);
  const weekday = weekdayOnly(selectedDate);

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/create');
  };

  return (
    <View style={styles.wrap}>
      {/* Day label header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>{label}</Text>
        {events.length > 0 && (
          <View style={styles.countChip}>
            <Text style={styles.countText}>
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </Text>
          </View>
        )}
      </View>

      {events.length === 0 ? (
        // ─── Warm empty state with CTA ──────────────────────────────
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>
            Nothing yet on {weekday}
          </Text>
          <Text style={styles.emptySubtitle}>
            Be the first to host something the community will remember.
          </Text>
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
    marginTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLabel: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.3,
  },
  countChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(201, 168, 76, 0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.35)',
  },
  countText: {
    fontSize: 11,
    color: COLORS.gold2,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },

  list: {
    gap: SPACING.md,
  },
  cardWrap: {
    marginBottom: SPACING.md,
  },

  // Empty state card
  emptyCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.14)',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 38,
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
    lineHeight: 19,
  },
  ctaButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold2,
  },
  ctaText: {
    fontSize: 14,
    color: COLORS.dark,
    ...FONTS.bold,
    letterSpacing: 0.2,
  },
});

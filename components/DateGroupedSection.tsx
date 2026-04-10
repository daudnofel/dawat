// components/DateGroupedSection.tsx
// DAW-31 — "All upcoming" renderer that groups events by day with polished
// day headers (Today / Tomorrow / weekday + date) and an event count chip.
//
// Visual pattern: large gold-accented day header, hairline divider, then a
// stack of horizontal EventCards. Designed to render inside a single FlashList
// row — it manages its own internal layout, no nested lists.

import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../lib/theme';
import { DateGroup } from '../lib/hooks/useDiscoverFeed';

interface Props {
  groups: DateGroup[];
  /** Renderer for an individual event row — caller controls card variant. */
  renderEvent: (event: DateGroup['events'][number]) => ReactNode;
}

export default function DateGroupedSection({ groups, renderEvent }: Props) {
  if (groups.length === 0) return null;

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.date} style={styles.group}>
          <View style={styles.dayHeader}>
            <View style={styles.dayHeaderLeft}>
              <View style={styles.goldDot} />
              <Text style={styles.dayLabel}>{group.label}</Text>
            </View>
            <Text style={styles.countChip}>
              {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.eventStack}>
            {group.events.map((evt) => renderEvent(evt))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
  },
  group: {
    marginBottom: SPACING.xl,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  dayLabel: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.2,
  },
  countChip: {
    fontSize: 11,
    color: COLORS.gold2,
    ...FONTS.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 223, 161, 0.18)',
    marginBottom: SPACING.md,
  },
  eventStack: {
    gap: 0,
  },
});

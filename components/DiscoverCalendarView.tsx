// components/DiscoverCalendarView.tsx
// DAW-27 — Calendar mode stub. Real month grid, date selection, and agenda
// panel arrive in DAW-28 → DAW-30. For the foundation ticket this renders a
// polished placeholder so the toggle is immediately testable.

import { View, StyleSheet } from 'react-native';
import EmptyState from './EmptyState';
import { DiscoverEvent, DateGroup, DiscoverFilter } from '../lib/hooks/useDiscoverFeed';
import { SPACING } from '../lib/theme';

interface Props {
  byDate: DateGroup[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  filter: DiscoverFilter;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DiscoverCalendarView(_props: Props) {
  return (
    <View style={styles.container}>
      <EmptyState
        emoji="🗓️"
        title="Calendar coming together"
        subtitle="Month grid + themed dot markers land in the next few tickets."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
});

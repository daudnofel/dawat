// components/DiscoverListView.tsx
// DAW-27 — List mode for Discover. Owns its FlashList, section renderer, and
// empty/error/skeleton states. Data comes from the parent shell (trending.tsx)
// via props so the feed hook is fetched once and shared with Calendar mode.
//
// This file is a lift-and-shift from the old inline list rendering in
// trending.tsx — no behaviour changes in DAW-27.

import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import EventCard from './EventCard';
import HomeSection from './HomeSection';
import EmptyState from './EmptyState';
import TonightFeaturedGrid from './TonightFeaturedGrid';
import DateGroupedSection from './DateGroupedSection';
import DiscoverFeedSkeleton from './DiscoverFeedSkeleton';
import { DiscoverEvent, DateGroup, DiscoverFilter } from '../lib/hooks/useDiscoverFeed';

// ─── Section model ────────────────────────────────────────────────────
type Section =
  | { type: 'tonight'; data: DiscoverEvent[] }
  | { type: 'thisWeek'; data: DiscoverEvent[] }
  | { type: 'byDate'; data: DateGroup[] }
  | { type: 'popular'; data: DiscoverEvent[] };

interface Props {
  tonight: DiscoverEvent[];
  thisWeek: DiscoverEvent[];
  popular: DiscoverEvent[];
  byDate: DateGroup[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  filter: DiscoverFilter;
  onClearFilter: () => void;
}

// ─── Shared card renderer ─────────────────────────────────────────────
export function renderEventCard(event: DiscoverEvent) {
  const rsvps = event.rsvps ?? [];
  const yesRsvps = rsvps.filter((r) => r.status === 'yes');
  const yesCount = yesRsvps.reduce(
    (sum, r) => sum + 1 + (r.children_count ?? 0) + (r.plus_one_names?.length ?? 0),
    0
  );
  const inshallahCount = rsvps.filter((r) => r.status === 'inshallah').length;
  return (
    <EventCard
      key={event.id}
      id={event.id}
      title={event.title}
      theme_id={event.theme_id}
      poster_url={event.poster_url}
      description={event.description}
      variant="horizontal"
      org_name="Community Event"
      host_name="Community Event"
      date_label={
        event.date_time
          ? new Date(event.date_time).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'Date TBD'
      }
      location_name={event.location_name ?? 'Location TBD'}
      price={event.price}
      gender_mode={event.gender_mode}
      is_halal_venue={event.is_halal_venue}
      yes_count={yesCount}
      inshallah_count={inshallahCount}
      capacity={event.capacity}
      attendee_avatar_urls={event.attendees.map((a) => a.avatarUrl)}
    />
  );
}

// ─── List view ────────────────────────────────────────────────────────
export default function DiscoverListView({
  tonight,
  thisWeek,
  popular,
  byDate,
  loading,
  error,
  refresh,
  filter,
  onClearFilter,
}: Props) {
  const filterActive = !!(filter.time || filter.category || filter.audience);

  const sections: Section[] = [];
  if (tonight.length) sections.push({ type: 'tonight', data: tonight });
  if (thisWeek.length) sections.push({ type: 'thisWeek', data: thisWeek });
  if (byDate.length) sections.push({ type: 'byDate', data: byDate });
  if (popular.length) sections.push({ type: 'popular', data: popular });

  // ─── Section renderer ──────────────────────────────────────────
  const renderSection = useCallback(({ item }: { item: Section }) => {
    switch (item.type) {
      case 'tonight':
        return (
          <View style={styles.tonightSection}>
            <View style={styles.tonightHeader}>
              <Text style={styles.tonightTitle}>Tonight ✨</Text>
              <Text style={styles.tonightSubtitle}>Happening today</Text>
            </View>
            <TonightFeaturedGrid events={item.data} />
          </View>
        );
      case 'thisWeek':
        return (
          <HomeSection title="This Week" subtitle="Coming up in the next 7 days">
            {item.data.map(renderEventCard)}
          </HomeSection>
        );
      case 'byDate':
        return (
          <View style={styles.byDateSection}>
            <View style={styles.byDateHeader}>
              <Text style={styles.byDateTitle}>All upcoming</Text>
              <Text style={styles.byDateSubtitle}>Browse by day</Text>
            </View>
            <DateGroupedSection groups={item.data} renderEvent={renderEventCard} />
          </View>
        );
      case 'popular':
        return (
          <HomeSection title="Popular 🔥" subtitle="Most RSVPs this week">
            {item.data.map(renderEventCard)}
          </HomeSection>
        );
    }
  }, []);

  // ─── Header / empty / error ────────────────────────────────────
  const renderHeader = useCallback(() => {
    if (loading && sections.length === 0) {
      return <DiscoverFeedSkeleton />;
    }

    if (error) {
      return (
        <View style={styles.headerContent}>
          <EmptyState
            emoji="⚠️"
            title="Couldn't load Discover"
            subtitle={error}
          />
          <Pressable
            onPress={refresh}
            style={({ pressed }) => [
              styles.retryBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    if (sections.length === 0) {
      if (filterActive) {
        return (
          <View style={styles.headerContent}>
            <EmptyState
              emoji="🪄"
              title="No events match these filters"
              subtitle="Try clearing a filter or two"
            />
            <Pressable
              onPress={onClearFilter}
              style={({ pressed }) => [
                styles.clearFiltersBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </Pressable>
          </View>
        );
      }
      return (
        <View style={styles.headerContent}>
          <EmptyState
            emoji="🌙"
            title="No events to discover"
            subtitle="Create the first event for your community"
          />
        </View>
      );
    }

    return null;
  }, [loading, error, sections.length, filterActive, refresh, onClearFilter]);

  return (
    <FlashList
      data={sections}
      keyExtractor={(item) => item.type}
      renderItem={renderSection}
      getItemType={(item) => item.type}
      estimatedItemSize={400}
      contentContainerStyle={styles.feedListContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={COLORS.gold}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  feedListContent: { paddingBottom: 120 },

  headerContent: { paddingHorizontal: SPACING.xl },

  // Tonight section header
  tonightSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  tonightHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  tonightTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.3,
  },
  tonightSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 2,
  },

  // byDate section header
  byDateSection: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  byDateHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  byDateTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.3,
  },
  byDateSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 2,
  },

  clearFiltersBtn: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.55)',
    backgroundColor: 'rgba(201, 168, 76, 0.18)',
  },
  clearFiltersText: {
    color: COLORS.gold2,
    fontSize: 14,
    ...FONTS.bold,
  },
  retryBtn: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.55)',
    backgroundColor: 'rgba(201, 168, 76, 0.18)',
  },
  retryText: {
    color: COLORS.gold2,
    fontSize: 14,
    ...FONTS.bold,
  },
});

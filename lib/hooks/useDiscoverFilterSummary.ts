// lib/hooks/useDiscoverFilterSummary.ts
// DAW-31 — Small helper that turns a DiscoverFilter object into a
// human-readable label + a hasActiveFilter boolean. Used by the
// calendar view to show a "Clear filter" affordance and reword empty
// states when a filter is hiding events.

import { useMemo } from 'react';
import { DiscoverFilter } from './useDiscoverFeed';

const TIME_LABELS: Record<NonNullable<DiscoverFilter['time']>, string> = {
  tonight: 'Tonight',
  this_week: 'This Week',
  after_maghrib: 'After Maghrib',
};

const CATEGORY_LABELS: Record<NonNullable<DiscoverFilter['category']>, string> = {
  social: 'Social',
  food: 'Food',
  active: 'Active',
  deen: 'Deen',
  family: 'Family',
};

const AUDIENCE_LABELS: Record<NonNullable<DiscoverFilter['audience']>, string> = {
  sisters: 'Sisters',
  brothers: 'Brothers',
  singles: 'Singles',
};

export interface DiscoverFilterSummary {
  /** True when any filter key is set. */
  isActive: boolean;
  /** Human-readable chip labels for the active filters. */
  labels: string[];
  /** Joined label like "Deen · Sisters". Empty string when inactive. */
  combined: string;
}

export function useDiscoverFilterSummary(
  filter: DiscoverFilter
): DiscoverFilterSummary {
  return useMemo(() => {
    const labels: string[] = [];
    if (filter.time) labels.push(TIME_LABELS[filter.time]);
    if (filter.category) labels.push(CATEGORY_LABELS[filter.category]);
    if (filter.audience) labels.push(AUDIENCE_LABELS[filter.audience]);
    return {
      isActive: labels.length > 0,
      labels,
      combined: labels.join(' · '),
    };
  }, [filter.time, filter.category, filter.audience]);
}

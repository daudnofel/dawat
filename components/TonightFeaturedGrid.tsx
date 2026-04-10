// components/TonightFeaturedGrid.tsx
// DAW-29 — Editorial mixed-layout grid for the Tonight section.
// Renders a 2-column grid of FeaturedCardCompact tiles, with every Nth event
// promoted to a full-width FeaturedCardLarge hero. Walks the event list once
// and emits a flat sequence of layout blocks (hero / pair) so the result is
// a clean Flexbox column — no nested lists.

import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../lib/theme';
import { DiscoverEvent } from '../lib/hooks/useDiscoverFeed';
import FeaturedCardLarge from './FeaturedCardLarge';
import FeaturedCardCompact from './FeaturedCardCompact';

interface Props {
  events: DiscoverEvent[];
  /** How often to insert a full-width hero. Default: every 5 events. */
  heroEvery?: number;
}

type Block =
  | { type: 'hero'; event: DiscoverEvent }
  | { type: 'pair'; events: DiscoverEvent[] };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_PADDING = SPACING.xl;
const COL_GAP = SPACING.md;
const AVAILABLE = SCREEN_WIDTH - SCREEN_PADDING * 2;
const HERO_WIDTH = AVAILABLE;
const COMPACT_WIDTH = (AVAILABLE - COL_GAP) / 2;

function buildBlocks(events: DiscoverEvent[], heroEvery: number): Block[] {
  const blocks: Block[] = [];
  let pendingPair: DiscoverEvent[] = [];

  events.forEach((evt, i) => {
    const isHero = i % heroEvery === 0;
    if (isHero) {
      // Flush any half-built pair before emitting a hero.
      if (pendingPair.length > 0) {
        blocks.push({ type: 'pair', events: pendingPair });
        pendingPair = [];
      }
      blocks.push({ type: 'hero', event: evt });
    } else {
      pendingPair.push(evt);
      if (pendingPair.length === 2) {
        blocks.push({ type: 'pair', events: pendingPair });
        pendingPair = [];
      }
    }
  });

  if (pendingPair.length > 0) {
    blocks.push({ type: 'pair', events: pendingPair });
  }

  return blocks;
}

export default function TonightFeaturedGrid({ events, heroEvery = 5 }: Props) {
  if (events.length === 0) return null;

  const blocks = buildBlocks(events, heroEvery);

  return (
    <View style={styles.container}>
      {blocks.map((block, idx) => {
        if (block.type === 'hero') {
          return (
            <FeaturedCardLarge
              key={`hero-${block.event.id}`}
              event={block.event}
              width={HERO_WIDTH}
            />
          );
        }
        return (
          <View key={`pair-${idx}-${block.events[0].id}`} style={styles.pairRow}>
            {block.events.map((evt) => (
              <FeaturedCardCompact key={evt.id} event={evt} width={COMPACT_WIDTH} />
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_PADDING,
  },
  pairRow: {
    flexDirection: 'row',
    gap: COL_GAP,
    marginBottom: SPACING.md,
  },
});

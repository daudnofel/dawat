import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

interface Props {
  /** Host name or community / org name. */
  host?: string;
  /** Pre-formatted date label, e.g. "Apr 12 · 7:30 PM". */
  dateLabel?: string;
  /** Location name or city. */
  location?: string;
  /** Price in cents/whole units. 0 → "Free". */
  price?: number;
}

/**
 * One-line meta row used by Discover cards.
 *
 * Renders host · date · location with dot separators, and a small price chip
 * pinned to the right. Truncates each segment intelligently — host gets the
 * least space, location gets the most, dates always render in full.
 */
export default function EventMetaRow({ host, dateLabel, location, price }: Props) {
  const segments: string[] = [];
  if (host) segments.push(host);
  if (dateLabel) segments.push(dateLabel);
  if (location) segments.push(location);

  if (segments.length === 0 && price == null) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {segments.join('  ·  ')}
      </Text>
      {price != null && (
        <View style={styles.priceChip}>
          <Text style={styles.priceText}>
            {price > 0 ? `$${price}` : 'Free'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.medium,
  },
  priceChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.25)',
    backgroundColor: 'rgba(201, 168, 76, 0.10)',
  },
  priceText: {
    fontSize: 11,
    color: COLORS.gold2,
    ...FONTS.bold,
  },
});

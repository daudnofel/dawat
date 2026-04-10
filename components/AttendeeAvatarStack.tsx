import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';

interface Props {
  /** Avatar URLs to render. Up to 3 are shown; the rest collapse into the +N count. */
  avatarUrls: (string | null)[];
  /** Total number of people going (drives the "+N going" label). */
  totalCount: number;
  /** Visual size variant. */
  size?: 'sm' | 'md';
}

const SIZE_MAP = {
  sm: 20,
  md: 24,
};

const OVERLAP_MAP = {
  sm: -6,
  md: -8,
};

/**
 * Overlapping avatar stack with a "+N going" label.
 *
 * Renders up to 3 avatars side-by-side with a hairline separator border, then
 * a count of total attendees. Falls back to placeholder circles when no
 * avatar URLs are available, so the social-proof slot stays visible.
 */
export default function AttendeeAvatarStack({
  avatarUrls,
  totalCount,
  size = 'sm',
}: Props) {
  if (totalCount <= 0) return null;

  const dim = SIZE_MAP[size];
  const overlap = OVERLAP_MAP[size];

  // Always reserve up to 3 visible slots, even if some URLs are null
  const visible = avatarUrls.slice(0, 3);
  const placeholdersNeeded = Math.max(0, Math.min(3, totalCount) - visible.length);
  const slots: (string | null)[] = [
    ...visible,
    ...Array(placeholdersNeeded).fill(null),
  ];

  return (
    <View style={styles.row}>
      <View style={styles.stack}>
        {slots.map((url, i) => (
          <View
            key={i}
            style={[
              styles.avatarFrame,
              {
                width: dim,
                height: dim,
                borderRadius: dim / 2,
                marginLeft: i === 0 ? 0 : overlap,
                zIndex: slots.length - i,
              },
            ]}
          >
            {url ? (
              <Image
                source={{ uri: url }}
                style={{ width: dim - 2, height: dim - 2, borderRadius: (dim - 2) / 2 }}
              />
            ) : (
              <View
                style={[
                  styles.placeholder,
                  { width: dim - 2, height: dim - 2, borderRadius: (dim - 2) / 2 },
                ]}
              />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.label}>{totalCount} going</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarFrame: {
    backgroundColor: COLORS.dark,
    borderWidth: 1.5,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: COLORS.card2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  label: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.medium,
  },
});

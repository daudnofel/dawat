import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import AnimatedPress from './AnimatedPress';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { GenderMode } from '../types';
import { getThemeById } from '../lib/themes';
import GenderBadge from './GenderBadge';
import HalalBadge from './HalalBadge';

interface EventCardProps {
  id: string;
  title: string;
  theme_id: string;
  org_name: string;
  date_label: string;
  location_name: string;
  price: number;
  gender_mode: GenderMode;
  is_halal_venue: boolean;
  yes_count: number;
  inshallah_count: number;
  capacity: number | null;
}

export default function EventCard(props: EventCardProps) {
  const router = useRouter();
  const theme = getThemeById(props.theme_id);
  const totalGoing = props.yes_count + props.inshallah_count;

  const priceLabel = props.price > 0
    ? `$${(props.price / 100).toFixed(0)}`
    : 'Free';

  return (
    <AnimatedPress
      style={styles.cardOuter}
      onPress={() => router.push(`/event/${props.id}`)}
    >
      {/* Glass card — translucent surface with blur + glassy border */}
      <View style={styles.glassBorder}>
        <BlurView intensity={30} tint="dark" style={styles.blurCard}>
          <View style={styles.cardInner}>

            {/* Top edge highlight — brighter, like light catching glass */}
            <View style={styles.topHighlight} />

            {/* Emoji — small, top-left with warm radiant glow */}
            <View style={styles.emojiRow}>
              <View style={styles.emojiGlowOuter}>
                <View style={styles.emojiGlow}>
                  <Text style={styles.emoji}>{theme?.defaultEmoji ?? '🌙'}</Text>
                </View>
              </View>
            </View>

          {/* Title — editorial scale */}
          <Text style={styles.title} numberOfLines={2}>{props.title}</Text>
          <Text style={styles.orgName} numberOfLines={1}>{props.org_name}</Text>

          {/* Vertical meta stack with icons */}
          <View style={styles.metaStack}>
            <View style={styles.metaLine}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.meta}>{props.date_label}</Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.meta} numberOfLines={1}>{props.location_name}</Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={styles.metaIcon}>💲</Text>
              <Text style={styles.meta}>{priceLabel}</Text>
            </View>
          </View>

          {/* Bottom — badge left, going right */}
          <View style={styles.bottomRow}>
            <View style={styles.badgeGroup}>
              <GenderBadge mode={props.gender_mode} />
              {props.is_halal_venue && <HalalBadge />}
            </View>
            <Text style={styles.goingText}>
              {totalGoing > 0 ? `${totalGoing} going` : 'Be the first'}
            </Text>
          </View>
          </View>
        </BlurView>
      </View>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    marginBottom: SPACING.xl,
    borderRadius: 22,
  },
  glassBorder: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  blurCard: {
    borderRadius: 21,
    overflow: 'hidden',
  },
  cardInner: {
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    padding: SPACING.xl,
  },

  // Top edge highlight — brighter line simulating light reflection on glass
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Emoji — warm radiant glow (two layers for soft falloff)
  emojiRow: {
    marginBottom: SPACING.lg,
  },
  emojiGlowOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 223, 161, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGlow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 223, 161, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },

  // Typography — editorial hierarchy
  title: {
    fontSize: 28,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  orgName: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.medium,
    marginBottom: SPACING.xl,
  },

  // Meta — vertical stack with icon prefix
  metaStack: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  metaIcon: {
    fontSize: 14,
    width: 22,
    textAlign: 'center',
  },
  meta: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.regular,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  goingText: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.medium,
  },
});

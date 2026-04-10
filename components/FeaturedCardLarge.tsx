// components/FeaturedCardLarge.tsx
// DAW-29 — Full-width hero card for the Tonight featured grid.
// Large poster, gradient overlay from bottom, title + meta overlaid,
// AttendeeAvatarStack pinned bottom-left.

import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import AnimatedPress from './AnimatedPress';
import AttendeeAvatarStack from './AttendeeAvatarStack';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { getThemeById } from '../lib/themes';
import { DiscoverEvent } from '../lib/hooks/useDiscoverFeed';

interface Props {
  event: DiscoverEvent;
  width: number;
}

const HERO_HEIGHT = 280;

export default function FeaturedCardLarge({ event, width }: Props) {
  const router = useRouter();
  const theme = getThemeById(event.theme_id);
  const gradId = `hero_${event.id.slice(0, 8).replace(/\W/g, '')}`;
  const gradientStops = theme?.background?.stops ?? [COLORS.card, COLORS.card2];
  const themePrimary = theme?.accents?.primary ?? COLORS.gold;
  const themeBorder = theme?.surface?.border ?? 'rgba(255, 255, 255, 0.12)';

  const dateLabel = event.date_time
    ? new Date(event.date_time).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Date TBD';

  const avatarUrls = event.attendees.map((a) => a.avatarUrl);

  return (
    <AnimatedPress
      style={[styles.card, { width, height: HERO_HEIGHT, borderColor: themeBorder }]}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      {/* Poster or themed gradient fallback */}
      {event.poster_url ? (
        <Image
          source={{ uri: event.poster_url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={StyleSheet.absoluteFill}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                {gradientStops.map((stop, i, arr) => (
                  <Stop
                    key={i}
                    offset={arr.length === 1 ? '0' : (i / (arr.length - 1)).toString()}
                    stopColor={stop}
                  />
                ))}
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId})`} />
          </Svg>
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{theme?.defaultEmoji ?? '🌙'}</Text>
          </View>
        </View>
      )}

      {/* Bottom-to-top scrim for text legibility */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={`${gradId}_scrim`} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#000" stopOpacity="0.85" />
            <Stop offset="0.55" stopColor="#000" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#000" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId}_scrim)`} />
      </Svg>

      {/* Content overlay */}
      <View style={styles.content}>
        <View style={styles.featuredPill}>
          <View style={[styles.pillDot, { backgroundColor: themePrimary }]} />
          <Text style={styles.featuredText}>Featured tonight</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          {dateLabel}
          {event.location_name ? ` · ${event.location_name}` : ''}
        </Text>

        <View style={styles.bottomRow}>
          <AttendeeAvatarStack
            avatarUrls={avatarUrls}
            totalCount={event.going}
            size="md"
          />
        </View>
      </View>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
  },
  emojiWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 96,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  featuredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: SPACING.sm,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featuredText: {
    fontSize: 11,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  meta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    ...FONTS.medium,
    marginTop: 2,
  },
  bottomRow: {
    marginTop: SPACING.md,
  },
});

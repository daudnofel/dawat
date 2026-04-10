// components/FeaturedCardCompact.tsx
// DAW-29 — 2-column tile variant for the Tonight featured grid.
// Square poster on top, title + meta below, AttendeeAvatarStack at the bottom.

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

export default function FeaturedCardCompact({ event, width }: Props) {
  const router = useRouter();
  const theme = getThemeById(event.theme_id);
  const gradId = `compact_${event.id.slice(0, 8).replace(/\W/g, '')}`;
  const gradientStops = theme?.background?.stops ?? [COLORS.card, COLORS.card2];
  const themeBorder = theme?.surface?.border ?? 'rgba(255, 255, 255, 0.10)';
  const cardBg = theme?.surface?.cardBg ?? 'rgba(30, 30, 30, 0.55)';

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
      style={[
        styles.card,
        { width, backgroundColor: cardBg, borderColor: themeBorder },
      ]}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      {/* Poster */}
      <View style={[styles.posterWrap, { height: width }]}>
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
                      offset={
                        arr.length === 1 ? '0' : (i / (arr.length - 1)).toString()
                      }
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
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {dateLabel}
        </Text>
        {event.location_name && (
          <Text style={styles.location} numberOfLines={1}>
            {event.location_name}
          </Text>
        )}
        <View style={styles.bottomRow}>
          <AttendeeAvatarStack
            avatarUrls={avatarUrls}
            totalCount={event.going}
            size="sm"
          />
        </View>
      </View>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  posterWrap: {
    width: '100%',
    backgroundColor: COLORS.card,
  },
  emojiWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 56,
  },
  body: {
    padding: SPACING.md,
    gap: 2,
  },
  title: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.medium,
    marginTop: 4,
  },
  location: {
    fontSize: 11,
    color: COLORS.hint,
    ...FONTS.regular,
  },
  bottomRow: {
    marginTop: SPACING.sm,
  },
});

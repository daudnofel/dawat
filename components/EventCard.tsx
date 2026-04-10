// components/EventCard.tsx
// DAW-22 — Partiful-inspired event card with three variants:
//   vertical   → carousel/featured: tall, theme gradient bg, poster centered
//   horizontal → list: compact, poster-left, details-right
//   mini       → recently viewed: poster thumbnail + title only

import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import AnimatedPress from './AnimatedPress';
import AttendeeAvatarStack from './AttendeeAvatarStack';
import EventMetaRow from './EventMetaRow';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { GenderMode } from '../types';
import { getThemeById } from '../lib/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Props ──────────────────────────────────────────────────

export type EventCardVariant = 'vertical' | 'horizontal' | 'mini';

interface EventCardProps {
  id: string;
  title: string;
  theme_id: string;
  poster_url?: string | null;
  org_name?: string;
  date_label?: string;
  location_name?: string;
  description?: string | null;
  price?: number;
  gender_mode?: GenderMode;
  is_halal_venue?: boolean;
  yes_count?: number;
  inshallah_count?: number;
  capacity?: number | null;
  variant?: EventCardVariant;
  width?: number;
  /** DAW-30: avatar URLs for the AttendeeAvatarStack (horizontal variant). */
  attendee_avatar_urls?: (string | null)[];
  /** DAW-30: host or org name for the EventMetaRow (horizontal variant). */
  host_name?: string;
}

export default function EventCard({
  variant = 'horizontal',
  ...props
}: EventCardProps) {
  const router = useRouter();
  const theme = getThemeById(props.theme_id);
  const hasPoster = !!props.poster_url;
  const totalGoing = (props.yes_count ?? 0) + (props.inshallah_count ?? 0);
  const themePrimary = theme?.accents?.primary ?? COLORS.gold;

  const handlePress = () => router.push(`/event/${props.id}`);

  if (variant === 'mini') {
    return (
      <MiniCard
        title={props.title}
        posterUrl={props.poster_url}
        emoji={theme?.defaultEmoji ?? '🌙'}
        gradientStops={theme?.background?.stops ?? [COLORS.card, COLORS.card2]}
        onPress={handlePress}
        width={props.width}
      />
    );
  }

  if (variant === 'vertical') {
    return (
      <VerticalCard
        title={props.title}
        dateLabel={props.date_label}
        locationName={props.location_name}
        description={props.description}
        posterUrl={props.poster_url}
        emoji={theme?.defaultEmoji ?? '🌙'}
        gradientStops={theme?.background?.stops ?? [COLORS.card, COLORS.card2]}
        totalGoing={totalGoing}
        themePrimary={themePrimary}
        themeBorder={theme?.surface?.border ?? 'rgba(255, 255, 255, 0.08)'}
        onPress={handlePress}
        width={props.width}
      />
    );
  }

  // Default: horizontal
  return (
    <HorizontalCard
      title={props.title}
      dateLabel={props.date_label}
      locationName={props.location_name}
      description={props.description}
      posterUrl={props.poster_url}
      emoji={theme?.defaultEmoji ?? '🌙'}
      gradientStops={theme?.background?.stops ?? [COLORS.card, COLORS.card2]}
      totalGoing={totalGoing}
      themePrimary={themePrimary}
      themeBorder={theme?.surface?.border ?? 'rgba(255, 255, 255, 0.08)'}
      cardBg={theme?.surface?.cardBg ?? 'rgba(30, 30, 30, 0.55)'}
      onPress={handlePress}
      hostName={props.host_name}
      price={props.price}
      attendeeAvatarUrls={props.attendee_avatar_urls ?? []}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// VERTICAL — tall carousel card with theme gradient background
// ═══════════════════════════════════════════════════════════════

interface VerticalCardProps {
  title: string;
  dateLabel?: string;
  locationName?: string;
  description?: string | null;
  posterUrl?: string | null;
  emoji: string;
  gradientStops: string[];
  totalGoing: number;
  themePrimary: string;
  themeBorder: string;
  onPress: () => void;
  width?: number;
}

function VerticalCard(p: VerticalCardProps) {
  const cardW = p.width ?? 280;
  const posterW = cardW * 0.82;
  const gradId = `vcard_${p.title.slice(0, 8).replace(/\W/g, '')}`;

  return (
    <AnimatedPress
      style={[v.card, { width: cardW, borderColor: p.themeBorder }]}
      onPress={p.onPress}
    >
      {/* Theme gradient background */}
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0.3" y2="1">
            {p.gradientStops.map((stop, i, arr) => (
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

      {/* Poster or emoji fallback */}
      <View style={[v.posterWrap, { width: posterW, height: posterW }]}>
        {p.posterUrl ? (
          <Image source={{ uri: p.posterUrl }} style={v.posterImage} resizeMode="cover" />
        ) : (
          <View style={v.emojiFallback}>
            <Text style={v.emoji}>{p.emoji}</Text>
          </View>
        )}
      </View>

      {/* Text content */}
      <View style={v.textBlock}>
        <Text style={v.title} numberOfLines={2}>{p.title}</Text>
        {p.dateLabel && (
          <Text style={v.meta} numberOfLines={1}>
            {p.dateLabel}{p.locationName ? ` · ${p.locationName}` : ''}
          </Text>
        )}
        {p.description && (
          <Text style={v.description} numberOfLines={2}>{p.description}</Text>
        )}
      </View>

      {/* Bottom row */}
      <View style={v.bottomRow}>
        <View style={v.goingWrap}>
          {p.totalGoing > 0 && (
            <View style={[v.accentDot, { backgroundColor: p.themePrimary }]} />
          )}
          <Text style={[v.goingText, p.totalGoing > 0 && { color: p.themePrimary }]}>
            {p.totalGoing > 0 ? `${p.totalGoing} going` : 'Be the first'}
          </Text>
        </View>
        <Text style={v.shareIcon}>↗</Text>
      </View>
    </AnimatedPress>
  );
}

const v = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    paddingBottom: SPACING.lg,
  },
  posterWrap: {
    alignSelf: 'center',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  emojiFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  emoji: {
    fontSize: 48,
  },
  textBlock: {
    paddingHorizontal: SPACING.lg,
    gap: 3,
  },
  title: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    ...FONTS.medium,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    ...FONTS.regular,
    lineHeight: 18,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  goingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  goingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    ...FONTS.medium,
  },
  shareIcon: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.45)',
    ...FONTS.medium,
  },
});

// ═══════════════════════════════════════════════════════════════
// HORIZONTAL — compact list card, poster-left details-right
// ═══════════════════════════════════════════════════════════════

interface HorizontalCardProps {
  title: string;
  dateLabel?: string;
  locationName?: string;
  description?: string | null;
  posterUrl?: string | null;
  emoji: string;
  gradientStops: string[];
  totalGoing: number;
  themePrimary: string;
  themeBorder: string;
  cardBg: string;
  onPress: () => void;
  hostName?: string;
  price?: number;
  attendeeAvatarUrls: (string | null)[];
}

function HorizontalCard(p: HorizontalCardProps) {
  const gradId = `hcard_${p.title.slice(0, 8).replace(/\W/g, '')}`;

  return (
    <AnimatedPress
      style={[h.card, { borderColor: p.themeBorder }]}
      onPress={p.onPress}
    >
      <View style={[h.inner, { backgroundColor: p.cardBg }]}>
        {/* Poster thumbnail or gradient+emoji fallback */}
        <View style={h.posterWrap}>
          {p.posterUrl ? (
            <Image source={{ uri: p.posterUrl }} style={h.posterImage} resizeMode="cover" />
          ) : (
            <View style={h.posterFallback}>
              <Svg style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                    {p.gradientStops.map((stop, i, arr) => (
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
              <Text style={h.emoji}>{p.emoji}</Text>
            </View>
          )}
        </View>

        {/* Details column */}
        <View style={h.details}>
          <View style={h.textStack}>
            <Text style={h.title} numberOfLines={2}>{p.title}</Text>
            <View style={h.metaRowWrap}>
              <EventMetaRow
                host={p.hostName}
                dateLabel={p.dateLabel}
                location={p.locationName}
                price={p.price}
              />
            </View>
            {p.description && (
              <Text style={h.description} numberOfLines={2}>{p.description}</Text>
            )}
          </View>

          <View style={h.bottomRow}>
            {p.totalGoing > 0 ? (
              <AttendeeAvatarStack
                avatarUrls={p.attendeeAvatarUrls}
                totalCount={p.totalGoing}
                size="sm"
              />
            ) : (
              <View style={h.goingWrap}>
                <Text style={h.goingText}>Be the first</Text>
              </View>
            )}
            <Text style={h.shareIcon}>↗</Text>
          </View>
        </View>
      </View>
    </AnimatedPress>
  );
}

const POSTER_THUMB = 110;

const h = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  posterWrap: {
    width: POSTER_THUMB,
    height: POSTER_THUMB,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
    zIndex: 1,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textStack: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.2,
  },
  metaRowWrap: {
    marginTop: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.hint,
    ...FONTS.regular,
    lineHeight: 17,
    marginTop: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  goingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  goingText: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.medium,
  },
  shareIcon: {
    fontSize: 16,
    color: COLORS.hint,
    ...FONTS.medium,
  },
});

// ═══════════════════════════════════════════════════════════════
// MINI — poster thumbnail + title only (recently viewed)
// ═══════════════════════════════════════════════════════════════

interface MiniCardProps {
  title: string;
  posterUrl?: string | null;
  emoji: string;
  gradientStops: string[];
  onPress: () => void;
  width?: number;
}

function MiniCard(p: MiniCardProps) {
  const cardW = p.width ?? 110;
  const gradId = `mcard_${p.title.slice(0, 8).replace(/\W/g, '')}`;

  return (
    <AnimatedPress style={[m.card, { width: cardW }]} onPress={p.onPress}>
      <View style={[m.posterWrap, { height: cardW }]}>
        {p.posterUrl ? (
          <Image source={{ uri: p.posterUrl }} style={m.posterImage} resizeMode="cover" />
        ) : (
          <View style={m.posterFallback}>
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                  {p.gradientStops.map((stop, i, arr) => (
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
            <Text style={m.emoji}>{p.emoji}</Text>
          </View>
        )}
      </View>
      <Text style={m.title} numberOfLines={2}>{p.title}</Text>
    </AnimatedPress>
  );
}

const m = StyleSheet.create({
  card: {
    marginRight: SPACING.md,
  },
  posterWrap: {
    width: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
    zIndex: 1,
  },
  title: {
    fontSize: 12,
    color: COLORS.white,
    ...FONTS.medium,
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
});

import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
// GlassView removed — caused color flickering on scroll
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
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

// Parse the theme's bannerBgImage gradient into color stops
function getGradientColors(theme: any): [string, string, string] {
  if (!theme?.bannerBgImage) return [theme?.bannerBg ?? COLORS.card2, COLORS.card2, COLORS.card];
  // Extract colors from "linear-gradient(135deg, #0A1628 0%, #1A2744 50%, #0D1B33 100%)"
  const matches = theme.bannerBgImage.match(/#[0-9A-Fa-f]{6}/g);
  if (matches && matches.length >= 2) {
    return [matches[0], matches[1], matches[matches.length - 1]];
  }
  return [theme.bannerBg, theme.bannerBg, COLORS.card];
}

export default function EventCard(props: EventCardProps) {
  const router = useRouter();
  const theme = getThemeById(props.theme_id);
  const [gradStart, gradMid, gradEnd] = getGradientColors(theme);

  const spotsLeft = props.capacity ? props.capacity - props.yes_count : null;
  const showUrgency = spotsLeft !== null && spotsLeft < 20 && spotsLeft > 0;
  const totalGoing = props.yes_count + props.inshallah_count;

  return (
    <AnimatedPress
      style={styles.cardOuter}
      onPress={() => router.push(`/event/${props.id}`)}
    >
      <View style={styles.card}>

      {/* Gradient Banner */}
      <View style={styles.banner}>
        <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={`grad-${props.id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradStart} />
              <Stop offset="0.5" stopColor={gradMid} />
              <Stop offset="1" stopColor={gradEnd} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#grad-${props.id})`} />
        </Svg>

        <Text style={styles.bannerEmoji}>{theme?.defaultEmoji ?? '🌙'}</Text>

        {showUrgency && (
          <View style={styles.urgencyBadge}>
            <Text style={styles.urgencyText}>Only {spotsLeft} spots left!</Text>
          </View>
        )}

        {/* Smooth fade into card body */}
        <Svg style={styles.bannerFade} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={`fade-${props.id}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={COLORS.card} stopOpacity="0" />
              <Stop offset="1" stopColor={COLORS.card} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#fade-${props.id})`} />
        </Svg>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{props.title}</Text>
        <Text style={styles.orgName} numberOfLines={1}>{props.org_name}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{props.date_label}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta} numberOfLines={1}>{props.location_name}</Text>
          {props.price > 0 && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaPrice}>${(props.price / 100).toFixed(0)}</Text>
            </>
          )}
        </View>

        <View style={styles.tagRow}>
          <GenderBadge mode={props.gender_mode} />
          {props.is_halal_venue && <HalalBadge />}
          {props.price === 0 && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>Free</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.goingDots}>
            {[...Array(Math.min(totalGoing, 3))].map((_, i) => (
              <View key={i} style={[styles.avatarDot, { left: i * 14, backgroundColor: i === 0 ? COLORS.gold : i === 1 ? COLORS.blue : COLORS.purple }]} />
            ))}
          </View>
          <Text style={[styles.goingText, totalGoing > 0 && { marginLeft: Math.min(totalGoing, 3) * 14 + 8 }]}>
            {totalGoing > 0 ? `${totalGoing} going` : 'Be the first to RSVP'}
          </Text>
        </View>
      </View>
    </View>
    </AnimatedPress>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  card: {
    borderRadius: RADIUS.xl, overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  banner: {
    height: 110, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  bannerEmoji: { fontSize: 44, zIndex: 1 },
  bannerFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 50,
  },
  urgencyBadge: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm, zIndex: 2,
    backgroundColor: COLORS.red, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  urgencyText: { color: COLORS.white, fontSize: 10, ...FONTS.bold },
  body: { padding: SPACING.lg, paddingTop: SPACING.sm },
  title: { fontSize: 17, color: COLORS.white, ...FONTS.bold, marginBottom: 3 },
  orgName: { fontSize: 13, color: COLORS.gold, ...FONTS.medium, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, flexWrap: 'wrap' },
  meta: { fontSize: 12, color: COLORS.muted, ...FONTS.regular },
  metaDot: { fontSize: 12, color: COLORS.hint, marginHorizontal: 5 },
  metaPrice: { fontSize: 12, color: COLORS.gold, ...FONTS.semibold },
  tagRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  freeBadge: {
    backgroundColor: `${COLORS.teal}20`, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: `${COLORS.teal}40`,
  },
  freeBadgeText: { fontSize: 11, color: COLORS.teal, ...FONTS.semibold },
  bottomRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', minHeight: 20 },
  goingDots: { flexDirection: 'row', position: 'absolute', left: 0, top: 0 },
  avatarDot: {
    width: 20, height: 20, borderRadius: 10, position: 'absolute',
    borderWidth: 2, borderColor: COLORS.card,
  },
  goingText: { fontSize: 12, color: COLORS.muted, ...FONTS.medium },
});

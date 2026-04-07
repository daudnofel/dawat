import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { THEMES } from '../lib/themes';
import { useEventStore } from '../store/useEventStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

// Featured trending themes for the carousel
const FEATURED_IDS = [
  'ramadan_kareem',
  'eid_gala',
  'iftar_glow',
  'nikah_garden',
  'sisters_halaqa',
  'community_table',
];

function getGradientColors(theme: any): [string, string] {
  if (!theme?.bannerBgImage) return [theme?.bannerBg ?? COLORS.card2, COLORS.card];
  const matches = theme.bannerBgImage.match(/#[0-9A-Fa-f]{6}/g);
  if (matches && matches.length >= 2) {
    return [matches[0], matches[matches.length - 1]];
  }
  return [theme.bannerBg, COLORS.card];
}

export default function HomeThemeCarousel() {
  const router = useRouter();
  const { reset, updateDraft } = useEventStore();

  const featured = FEATURED_IDS
    .map((id) => THEMES.find((t) => t.id === id))
    .filter(Boolean);

  const handleThemePress = (themeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    updateDraft({ theme_id: themeId });
    router.push('/(tabs)/create');
  };

  const handleCreatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();
    router.push('/(tabs)/create');
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING.md}
      >
        {featured.map((theme: any) => {
          const [grad1, grad2] = getGradientColors(theme);
          return (
            <Pressable
              key={theme.id}
              style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.97 }] }]}
              onPress={() => handleThemePress(theme.id)}
            >
              <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
                <Defs>
                  <SvgLinearGradient id={`g-${theme.id}`} x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={grad1} />
                    <Stop offset="1" stopColor={grad2} />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill={`url(#g-${theme.id})`} />
              </Svg>
              <View style={styles.cardOverlay} />
              <Text style={styles.cardEmoji}>{theme.defaultEmoji}</Text>
              <Text style={styles.cardName} numberOfLines={1}>{theme.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.ctaWrap}>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.97 }] }]}
          onPress={handleCreatePress}
        >
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgLinearGradient id="ctaHomeGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFDFA1" />
                <Stop offset="0.5" stopColor="#E6C27A" />
                <Stop offset="1" stopColor="#FFDFA1" />
              </SvgLinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" rx={RADIUS.md} fill="url(#ctaHomeGrad)" />
          </Svg>
          <Text style={styles.ctaText}>Create event</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  cardName: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.bold,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
    letterSpacing: -0.2,
  },
  ctaWrap: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
  },
  cta: {
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaText: {
    fontSize: 16,
    color: COLORS.dark,
    ...FONTS.bold,
    zIndex: 1,
  },
});

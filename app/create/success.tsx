import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';
import { generateSlug } from '../../lib/slugify';
import AnimatedPress from '../../components/AnimatedPress';

export default function SuccessScreen({ onDone }: { onDone?: () => void }) {
  const { draft, reset } = useEventStore();
  const confettiRef = useRef<any>(null);

  const slug = generateSlug(draft.title || 'event');
  const link = `dawatapp.com/e/${slug}`;

  // Entrance animations
  const emojiScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    emojiScale.value = withSpring(1, { damping: 8, stiffness: 150 });
    titleOpacity.value = withDelay(200, withSpring(1));
    contentOpacity.value = withDelay(400, withSpring(1));
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const handleCopyLink = () => {
    Share.share({ message: `Check out this event on Dawat: ${link}` });
  };

  const handleViewEvent = () => {
    reset();
    onDone?.();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ConfettiCannon
        ref={confettiRef}
        count={80}
        origin={{ x: -10, y: 0 }}
        autoStart
        fadeOut
        colors={[COLORS.gold, COLORS.gold2, '#FFFFFF', COLORS.amber]}
      />

      <View style={styles.content}>
        <Animated.Text style={[styles.confettiEmoji, emojiStyle]}>🎉</Animated.Text>
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>You're live!</Text>
          <Text style={styles.subtitle}>Your event is ready to share</Text>
        </Animated.View>

        <Animated.View style={[styles.actions, contentStyle]}>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
          </View>

          <AnimatedPress style={styles.shareButton} haptic="medium" onPress={handleCopyLink}>
            <Text style={styles.shareText}>Share Link</Text>
          </AnimatedPress>

          <AnimatedPress style={styles.whatsappButton} haptic="medium" onPress={handleCopyLink}>
            <Text style={styles.whatsappText}>Share to WhatsApp</Text>
          </AnimatedPress>

          <AnimatedPress style={styles.viewButton} onPress={handleViewEvent}>
            <Text style={styles.viewText}>Go to Home</Text>
          </AnimatedPress>
        </Animated.View>

        <Text style={styles.footer}>JazakAllah khair for using Dawat 🤲</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  confettiEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  title: { fontSize: 28, color: COLORS.white, ...FONTS.bold, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: 16, color: COLORS.muted, ...FONTS.regular, textAlign: 'center', marginBottom: SPACING.xxl },
  actions: { width: '100%' },
  linkBox: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    width: '100%', marginBottom: SPACING.lg,
  },
  linkText: { color: COLORS.gold, fontSize: 15, ...FONTS.medium, textAlign: 'center' },
  shareButton: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center', marginBottom: SPACING.md,
  },
  shareText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
  whatsappButton: {
    backgroundColor: '#25D366', borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center', marginBottom: SPACING.md,
  },
  whatsappText: { color: COLORS.white, fontSize: 16, ...FONTS.bold },
  viewButton: {
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center', marginBottom: SPACING.xxl,
  },
  viewText: { color: COLORS.white, fontSize: 16, ...FONTS.medium },
  footer: { color: COLORS.hint, fontSize: 13, ...FONTS.regular },
});

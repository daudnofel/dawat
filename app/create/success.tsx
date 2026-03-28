import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';
import { generateSlug } from '../../lib/slugify';

export default function SuccessScreen({ onDone }: { onDone?: () => void }) {
  const { draft, reset } = useEventStore();

  const slug = generateSlug(draft.title || 'event');
  const link = `dawatapp.com/e/${slug}`;

  const handleCopyLink = () => {
    Share.share({ message: `Check out this event on Dawat: ${link}` });
  };

  const handleViewEvent = () => {
    reset();
    onDone?.();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.confettiEmoji}>🎉</Text>
        <Text style={styles.title}>You're live!</Text>
        <Text style={styles.subtitle}>Your event is ready to share</Text>

        {/* Event Link */}
        <View style={styles.linkBox}>
          <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.copyButton, pressed && { opacity: 0.8 }]}
          onPress={handleCopyLink}
        >
          <Text style={styles.copyText}>Share Link</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.whatsappButton, pressed && { opacity: 0.8 }]}
          onPress={handleCopyLink}
        >
          <Text style={styles.whatsappText}>Share to WhatsApp</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.viewButton, pressed && { opacity: 0.8 }]}
          onPress={handleViewEvent}
        >
          <Text style={styles.viewText}>Go to Home</Text>
        </Pressable>

        <Text style={styles.footer}>JazakAllah khair for using Dawat</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  confettiEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  title: { fontSize: 28, color: COLORS.white, ...FONTS.bold, marginBottom: SPACING.sm },
  subtitle: { fontSize: 16, color: COLORS.muted, ...FONTS.regular, marginBottom: SPACING.xxl },
  linkBox: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    width: '100%', marginBottom: SPACING.lg,
  },
  linkText: { color: COLORS.gold, fontSize: 15, ...FONTS.medium, textAlign: 'center' },
  copyButton: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  copyText: { color: COLORS.dark, fontSize: 16, ...FONTS.bold },
  whatsappButton: {
    backgroundColor: '#25D366', borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  whatsappText: { color: COLORS.white, fontSize: 16, ...FONTS.bold },
  viewButton: {
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: SPACING.lg, width: '100%', alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  viewText: { color: COLORS.white, fontSize: 16, ...FONTS.medium },
  footer: { color: COLORS.hint, fontSize: 13, ...FONTS.regular },
});

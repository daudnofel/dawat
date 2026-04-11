import { View, Text, Pressable, StyleSheet, Modal, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { Toast } from './Toast';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  eventTitle: string;
  eventSlug: string;
}

const EVENT_BASE_URL = 'https://dawat.app/e';

export default function ShareSheet({ visible, onClose, eventTitle, eventSlug }: ShareSheetProps) {
  const eventUrl = `${EVENT_BASE_URL}/${eventSlug}`;
  const shareMessage = `You're invited to ${eventTitle} on Dawat!\n${eventUrl}`;

  const handleCopyLink = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(eventUrl);
    Toast.success('Link copied to clipboard');
    onClose();
  };

  const handleNativeShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({ message: shareMessage });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Share Event</Text>
          <Text style={styles.eventName} numberOfLines={1}>{eventTitle}</Text>

          <View style={styles.urlRow}>
            <Text style={styles.urlText} numberOfLines={1}>{eventUrl}</Text>
            <Pressable style={styles.copyButton} onPress={handleCopyLink}>
              <Text style={styles.copyText}>Copy</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.shareButton, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={handleNativeShare}
          >
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl + 8,
    paddingTop: SPACING.md,
  },
  handle: {
    width: 36, height: 4, borderRadius: RADIUS.full,
    backgroundColor: COLORS.border, alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 18, color: COLORS.white, ...FONTS.bold,
    textAlign: 'center',
  },
  eventName: {
    fontSize: 14, color: COLORS.muted, ...FONTS.regular,
    textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl,
  },
  urlRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.input, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingLeft: SPACING.lg, paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  urlText: {
    flex: 1, fontSize: 13, color: COLORS.muted, ...FONTS.regular,
  },
  copyButton: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  copyText: {
    fontSize: 13, color: COLORS.dark, ...FONTS.bold,
  },
  shareButton: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, alignItems: 'center',
  },
  shareText: {
    fontSize: 16, color: COLORS.dark, ...FONTS.bold,
  },
});

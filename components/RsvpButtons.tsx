import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { RsvpStatus } from '../types';

interface RsvpButtonsProps {
  currentStatus: RsvpStatus | null;
  onSelect: (status: RsvpStatus) => void;
}

const OPTIONS = [
  { status: RsvpStatus.Yes, label: 'Yes!', emoji: '✅', color: COLORS.green },
  { status: RsvpStatus.Inshallah, label: 'Inshallah', emoji: '🤲', color: COLORS.amber },
  { status: RsvpStatus.No, label: "Can't Go", emoji: '❌', color: COLORS.hint },
];

export default function RsvpButtons({ currentStatus, onSelect }: RsvpButtonsProps) {
  return (
    <View style={styles.container}>
      {currentStatus === RsvpStatus.Waitlist && (
        <Text style={styles.waitlistBanner}>You're on the waitlist — the host will admit you when a spot opens</Text>
      )}
      <Text style={styles.prompt}>Will you be attending?</Text>
      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const isActive = currentStatus === opt.status;
          return (
            <Pressable
              key={opt.status}
              style={[
                styles.button,
                isActive && { borderColor: opt.color, backgroundColor: `${opt.color}20` },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSelect(opt.status);
              }}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={[styles.label, isActive && { color: opt.color }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.lg },
  prompt: {
    fontSize: 15, color: COLORS.muted, ...FONTS.medium,
    textAlign: 'center', marginBottom: SPACING.md,
  },
  row: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'center' },
  waitlistBanner: {
    fontSize: 13, color: COLORS.blue, ...FONTS.medium,
    textAlign: 'center', marginBottom: SPACING.md,
    backgroundColor: `${COLORS.blue}15`, paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md, borderRadius: RADIUS.md,
  },
  button: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md, borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.10)',
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
  },
  emoji: { fontSize: 20, marginBottom: SPACING.xs },
  label: { fontSize: 13, color: COLORS.muted, ...FONTS.semibold },
});

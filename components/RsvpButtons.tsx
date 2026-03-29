import { View, Text, StyleSheet } from 'react-native';
import AnimatedPress from './AnimatedPress';
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
      <Text style={styles.prompt}>Will you be attending?</Text>
      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const isActive = currentStatus === opt.status;
          return (
            <AnimatedPress
              key={opt.status}
              style={[
                styles.button,
                isActive && { borderColor: opt.color, backgroundColor: `${opt.color}15` },
              ]}
              scaleValue={0.95}
              haptic="medium"
              onPress={() => onSelect(opt.status)}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={[styles.label, isActive && { color: opt.color }]}>{opt.label}</Text>
            </AnimatedPress>
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
  button: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  emoji: { fontSize: 20, marginBottom: SPACING.xs },
  label: { fontSize: 13, color: COLORS.muted, ...FONTS.semibold },
});

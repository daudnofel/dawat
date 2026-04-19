// components/RsvpButtons.tsx
// DAW-22 — clean inline RSVP bar (Partiful-style), replaces the old chunky cards.
// Three options in a compact dark pill: Yes · Inshallah · Can't Go

import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';
import { RsvpStatus } from '../types';

interface RsvpButtonsProps {
  currentStatus: RsvpStatus | null;
  onSelect: (status: RsvpStatus) => void;
}

const OPTIONS = [
  { status: RsvpStatus.Yes, label: 'Yes', color: COLORS.green },
  { status: RsvpStatus.Inshallah, label: 'Inshallah', color: COLORS.amber },
  { status: RsvpStatus.No, label: "Can't Go", color: COLORS.red },
];

export default function RsvpButtons({ currentStatus, onSelect }: RsvpButtonsProps) {
  return (
    <View style={styles.container}>
      {currentStatus === RsvpStatus.Waitlist && (
        <Text style={styles.waitlistBanner}>
          You're on the waitlist — the host will admit you when a spot opens
        </Text>
      )}
      {/* DAW-6 — host approval mode: show pending state to the guest */}
      {currentStatus === RsvpStatus.Pending && (
        <Text style={styles.pendingBanner}>
          Awaiting host approval — you'll get a notification when it's confirmed
        </Text>
      )}

      <View style={styles.pill}>
        {OPTIONS.map((opt, i) => {
          const isActive = currentStatus === opt.status;
          return (
            <View key={opt.status} style={styles.optionWrap}>
              {i > 0 && <View style={styles.divider} />}
              <Pressable
                style={[
                  styles.option,
                  isActive && { backgroundColor: `${opt.color}20` },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onSelect(opt.status);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && { color: opt.color, ...FONTS.bold },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  waitlistBanner: {
    fontSize: 13,
    color: COLORS.blue,
    ...FONTS.medium,
    textAlign: 'center',
    marginBottom: SPACING.md,
    backgroundColor: `${COLORS.blue}15`,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  pendingBanner: {
    fontSize: 13,
    color: COLORS.amber,
    ...FONTS.medium,
    textAlign: 'center',
    marginBottom: SPACING.md,
    backgroundColor: `${COLORS.amber}15`,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 30, 0.65)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  optionWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.semibold,
  },
});

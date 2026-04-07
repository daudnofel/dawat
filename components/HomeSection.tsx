import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

interface HomeSectionProps {
  title: string;
  subtitle?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  children: ReactNode;
}

export default function HomeSection({
  title,
  subtitle,
  viewAllLabel = 'View all',
  onViewAll,
  children,
}: HomeSectionProps) {
  const handleViewAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewAll?.();
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {onViewAll && (
          <Pressable
            style={({ pressed }) => [styles.viewAllPill, pressed && { opacity: 0.7 }]}
            onPress={handleViewAll}
          >
            <Text style={styles.viewAllText}>{viewAllLabel}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 2,
  },
  viewAllPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(53, 53, 52, 0.30)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 223, 161, 0.12)',
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.medium,
  },
});

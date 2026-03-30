import { Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

interface MapPreviewProps {
  locationName: string | null;
  locationAddress: string | null;
  isHidden: boolean;
}

export default function MapPreview({ locationName, locationAddress, isHidden }: MapPreviewProps) {
  if (!locationName || isHidden) return null;

  const query = encodeURIComponent(locationAddress || locationName);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });

    Linking.openURL(url!);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && { transform: [{ scale: 0.97 }] }]}
      onPress={handlePress}
    >
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.label} numberOfLines={1}>
        {locationName}
      </Text>
      <Text style={styles.action}>Directions →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  icon: { fontSize: 16 },
  label: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.medium,
  },
  action: {
    fontSize: 13,
    color: COLORS.gold,
    ...FONTS.semibold,
  },
});

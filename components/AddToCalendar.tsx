import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../lib/theme';

interface AddToCalendarProps {
  title: string;
  dateTime: string | null;
  locationName: string | null;
  description: string | null;
}

export default function AddToCalendar({ title, dateTime, locationName, description }: AddToCalendarProps) {
  if (!dateTime) return null;

  const startDate = new Date(dateTime);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2h duration

  const formatICSDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const handleAppleCalendar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Apple Calendar deep link via webcal-style URL
    const params = new URLSearchParams({
      startDate: formatICSDate(startDate),
      endDate: formatICSDate(endDate),
      title,
      ...(locationName ? { location: locationName } : {}),
      ...(description ? { notes: description } : {}),
    });

    // Use calshow on iOS to open Calendar app
    const calUrl = `calshow:${Math.floor(startDate.getTime() / 1000)}`;
    Linking.openURL(calUrl).catch(() => {
      // Fallback: open Google Calendar in browser
      openGoogleCalendar();
    });
  };

  const openGoogleCalendar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatICSDate(startDate)}/${formatICSDate(endDate)}`,
      ...(locationName ? { location: locationName } : {}),
      ...(description ? { details: description } : {}),
    });

    Linking.openURL(`https://calendar.google.com/calendar/render?${params.toString()}`);
  };

  const handlePress = () => {
    Alert.alert('Add to Calendar', 'Choose your calendar app', [
      { text: 'Apple Calendar', onPress: handleAppleCalendar },
      { text: 'Google Calendar', onPress: openGoogleCalendar },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.97 }] }]}
      onPress={handlePress}
    >
      <Text style={styles.icon}>📅</Text>
      <Text style={styles.text}>Add to Calendar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  icon: { fontSize: 16 },
  text: { fontSize: 14, color: COLORS.gold, ...FONTS.semibold },
});

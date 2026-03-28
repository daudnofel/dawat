import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.dark },
        animation: 'slide_from_right',
      }}
    />
  );
}

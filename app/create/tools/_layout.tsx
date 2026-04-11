import { Stack } from 'expo-router';

/**
 * Tools stack (DAW-54) — each screen is a transparent modal so the live
 * editor canvas stays visible behind the bottom sheet. Animation is set
 * to `none` because `ToolSheet` owns its own Reanimated spring entrance;
 * the router transition would otherwise double-animate on iOS and cause
 * a visible double-slide.
 */
export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        animation: 'none',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}

import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

/**
 * Creation stack (DAW-37 — Creation V2).
 *
 * New routes:
 *   - essentials — the 4-field bottom-sheet form (modal presentation)
 *   - editor     — the preview-led canvas editor
 *   - success    — post-publish celebration (unchanged from V1)
 *
 * Legacy step routes (step1-theme, step2-basics, step-poster, step-effect,
 * step3-details, step4-settings) still resolve because their files exist
 * on disk; DAW-55 deletes them for real once tool sheets + publish land.
 */
export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.dark },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="essentials"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="editor"
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

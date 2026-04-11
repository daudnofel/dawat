import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

/**
 * Creation stack (DAW-37 — Creation V2, extended in DAW-54).
 *
 * Routes:
 *   - essentials — the 4-field bottom-sheet form (modal presentation)
 *   - editor     — the preview-led canvas editor
 *   - tools/*    — nested transparent-modal stack for the 5 editor tool
 *                  sheets (poster / theme / effect / details / audience),
 *                  layered over the editor canvas. See
 *                  `app/create/tools/_layout.tsx`.
 *   - success    — post-publish celebration (unchanged from V1)
 *
 * The 6 legacy wizard step routes were deleted in DAW-55.
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
      <Stack.Screen
        name="tools"
        options={{
          // The nested `tools/_layout.tsx` stack declares each tool as a
          // transparentModal; this outer shell just needs to let the
          // nested group take over without its own transition.
          headerShown: false,
          animation: 'none',
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  );
}

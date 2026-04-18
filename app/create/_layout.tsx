import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

/**
 * Creation stack.
 *
 * Routes:
 *   - essentials — first-tap sheet: title / date / host / audience
 *   - editor     — preview-led canvas editor. Hosts EditorToolSheet
 *                  (a @gorhom/bottom-sheet) which renders all tool
 *                  content inline — tools are NOT routes.
 *   - success    — post-publish celebration
 *
 * Files under app/create/tools/* remain on disk but are never navigated
 * to; they're imported by EditorToolSheet as regular React components.
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

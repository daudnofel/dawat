/**
 * Create tab — DAW-37 redirector.
 *
 * The legacy create tab rendered the entire 6-step wizard inline. Under
 * Creation V2, creation lives outside the tab tree entirely:
 *
 *   1. User taps the Create tab in GlassTabBar.
 *   2. This screen focuses, pushes /create/essentials as a modal, and
 *      switches the underlying tab back to home so the modal overlays
 *      the home feed (not an empty create screen).
 *   3. On Cancel in essentials → router.back() → home. Clean.
 *   4. On Start designing → router.replace('/create/editor') → full-
 *      bleed editor over home. Back from the editor also returns to
 *      home via step 3's replace.
 *
 * We guard with a ref so the focus callback doesn't trigger a loop when
 * returning from the modal. The 6 legacy wizard step files were removed
 * in DAW-55 — the only entry point into creation is now the essentials
 * modal this redirector pushes.
 */

import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { COLORS } from '../../lib/theme';

export default function CreateTabRedirect() {
  const router = useRouter();
  const pushed = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (pushed.current) {
        // Returning from a dismissed essentials/editor — bounce to home.
        pushed.current = false;
        router.replace('/(tabs)');
        return;
      }
      pushed.current = true;
      // Fire on the next frame so the tab transition settles before the
      // modal animates in — prevents a jarring double-slide.
      requestAnimationFrame(() => {
        router.push('/create/essentials');
      });
    }, [router]),
  );

  return <View style={{ flex: 1, backgroundColor: COLORS.dark }} />;
}

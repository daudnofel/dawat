/**
 * EditorToolSheet — the bottom sheet that hosts all editor tool screens.
 *
 * Mounted inline in `app/create/editor.tsx`. NOT a route. Using
 * `@gorhom/bottom-sheet` instead of iOS native formSheet because native
 * formSheet doesn't mesh with Expo Router's nested stack architecture.
 *
 * Flow:
 *   - EditorDock fires `openTool('theme')` → store's `activeTool` becomes 'theme'
 *   - This component's effect sees the change and calls `snapToIndex(0)`
 *   - BottomSheet animates up to the 55% snap point
 *   - Content inside switches based on `activeTool`
 *   - User drags down or taps Done → `closeTool()` clears state → effect
 *     calls `close()` → sheet animates down
 *   - User taps a DIFFERENT tool while sheet is open → activeTool swaps,
 *     content re-renders, sheet stays at current snap
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../lib/theme';
import { useEventStore } from '../store/useEventStore';

import PosterToolScreen from '../app/create/tools/poster';
import ThemeToolScreen from '../app/create/tools/theme';
import EffectToolScreen from '../app/create/tools/effect';
import TitleStyleToolScreen from '../app/create/tools/title-style';
import DetailsToolScreen from '../app/create/tools/details';
import AudienceToolScreen from '../app/create/tools/audience';
import PublishToolScreen from '../app/create/tools/publish';

export default function EditorToolSheet() {
  const { activeTool, closeTool } = useEventStore();
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  // Cap how high the sheet can travel in PIXELS, not percent. The safe-area
  // inset gives us the status bar / Dynamic Island height for whichever
  // iPhone is running the app; a small breathing buffer keeps the sheet
  // from butting up against it. With topInset set, '100%' means "from the
  // top inset down to the bottom of the screen" — scales correctly across
  // every device (SE through 16 Pro Max).
  const topInset = insets.top + 12;

  const snapPoints = useMemo(() => ['55%', '100%'], []);

  // Drive the sheet from store state. Opening a tool snaps to index 0;
  // clearing the tool closes.
  useEffect(() => {
    if (activeTool) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [activeTool]);

  // If the user drags the sheet closed (index -1), sync the store so the
  // dock's active-tool highlight clears.
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1 && activeTool) {
        closeTool();
      }
    },
    [activeTool, closeTool],
  );

  // Backdrop fades in as the sheet rises. Tapping it dismisses.
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleClose = useCallback(() => {
    closeTool();
  }, [closeTool]);

  const content = () => {
    switch (activeTool) {
      case 'poster':
        return <PosterToolScreen onClose={handleClose} />;
      case 'theme':
        return <ThemeToolScreen onClose={handleClose} />;
      case 'effect':
        return <EffectToolScreen onClose={handleClose} />;
      case 'title-style':
        return <TitleStyleToolScreen onClose={handleClose} />;
      case 'details':
        return <DetailsToolScreen onClose={handleClose} />;
      case 'audience':
        return <AudienceToolScreen onClose={handleClose} />;
      case 'publish':
        return <PublishToolScreen onClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      topInset={topInset}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      {content()}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.card,
  },
  handle: {
    backgroundColor: 'rgba(201,168,76,0.55)',
    width: 44,
    height: 5,
  },
  content: {
    flex: 1,
  },
});

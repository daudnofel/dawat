/**
 * EditorToolSheet — the bottom sheet that hosts all editor tool screens.
 *
 * Mounted inline in `app/create/editor.tsx`. NOT a route. Using
 * `@gorhom/bottom-sheet` instead of iOS native formSheet because native
 * formSheet doesn't mesh with Expo Router's nested stack architecture.
 *
 * Flow:
 *   - EditorDock fires `openTool('theme')` → store's `activeTool` becomes 'theme'
 *   - The `index` prop of <BottomSheet> is bound to a derived value:
 *       activeTool == null  →  index = -1 (closed)
 *       activeTool != null  →  index =  0 (medium snap)
 *     So the sheet opens declaratively from state — no imperative
 *     `sheetRef.current?.snapToIndex(0)` race on the very first tap.
 *   - User drags down → onChange fires with index=-1, we sync the store
 *     so the dock highlight clears.
 *   - User taps a different tool while sheet is open → activeTool swaps,
 *     content re-renders, sheet stays at current snap.
 */

import React, { useCallback, useMemo } from 'react';
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
  const insets = useSafeAreaInsets();

  // Cap how high the sheet can travel in PIXELS — safe-area inset gives
  // us status bar / Dynamic Island height per device.
  const topInset = insets.top + 12;

  const snapPoints = useMemo(() => ['55%', '100%'], []);

  // Declarative open/close — no ref, no race on first tap.
  const sheetIndex = activeTool ? 0 : -1;

  // If the user drags the sheet closed, sync the store.
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1 && activeTool) {
        closeTool();
      }
    },
    [activeTool, closeTool],
  );

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

  const renderContent = () => {
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
      index={sheetIndex}
      snapPoints={snapPoints}
      topInset={topInset}
      enablePanDownToClose
      animateOnMount={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      {renderContent()}
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
});

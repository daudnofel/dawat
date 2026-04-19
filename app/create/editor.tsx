/**
 * Editor — the preview-led event editor.
 *
 * Full-bleed live preview of the in-progress draft with the EditorDock
 * glass bar floating at the bottom. Tapping a dock button (or a zone on
 * the canvas) sets `activeTool` in the store; `EditorToolSheet` — a
 * `@gorhom/bottom-sheet` mounted below — reacts by opening to its 55%
 * detent. No navigation involved: the sheet is a component, not a route.
 *
 * The screen is guarded: if a user lands here with an empty draft, we
 * bounce them back to /create/essentials.
 *
 * Publish opens the publish tool in the same sheet. On success, that tool
 * itself calls router.replace('/create/success') to leave the editor.
 */

import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { COLORS } from '../../lib/theme';
import { useEventStore, EditorToolId } from '../../store/useEventStore';
import { getThemeById } from '../../lib/themes';
import EventPreview, { PreviewZone } from '../../components/EventPreview';
import EditorChrome from '../../components/EditorChrome';
import EditorDock from '../../components/EditorDock';
import EditorToolSheet from '../../components/EditorToolSheet';

// Map a preview-zone tap to the tool it should open. The editor canvas
// and the editor dock funnel through the same openTool call so the store
// stays the single source of truth for "which tool is open".
function zoneToTool(zone: PreviewZone): EditorToolId {
  switch (zone) {
    case 'poster':
      return 'poster';
    case 'title':
      return 'title-style';
    case 'details':
      return 'details';
    case 'audience':
      return 'audience';
  }
}

export default function EditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, activeTool, openTool } = useEventStore();

  const titleOk = draft.title.trim().length >= 2;
  const hostOk = draft.host_name.trim().length >= 2;
  const essentialsReady = titleOk && hostOk;

  useFocusEffect(
    useCallback(() => {
      if (!essentialsReady) {
        router.replace('/create/essentials');
      }
    }, [essentialsReady, router]),
  );

  useEffect(() => {
    if (!essentialsReady) {
      router.replace('/create/essentials');
    }
  }, [essentialsReady, router]);

  const theme = getThemeById(draft.theme_id);
  const pageBg = theme?.background?.stops?.[0] ?? theme?.bannerBg ?? COLORS.dark;
  const textColor = theme?.textColor ?? COLORS.white;

  const handleToolPress = (tool: EditorToolId) => {
    openTool(tool);
  };

  const handleZoneTap = (zone: PreviewZone) => {
    handleToolPress(zoneToTool(zone));
  };

  const handleBack = () => {
    router.back();
  };

  const handlePublish = () => {
    if (!essentialsReady) return;
    openTool('publish');
  };

  return (
    // No top safe-area edge — the background gradient bleeds behind the
    // status bar (clock + battery). EventPreview renders the full-bleed
    // gradient, and the topBar slot inside it pads its own status-bar
    // height so the back/Publish buttons don't sit under the notch.
    <View style={[styles.container, { backgroundColor: pageBg }]}>
      <EventPreview
        data={{
          title: draft.title,
          description: draft.description,
          theme_id: draft.theme_id,
          poster_url: draft.poster_url,
          effect_id: draft.effect_id,
          title_style: draft.title_style,
          gender_mode: draft.gender_mode,
          date_time: draft.date_time,
          date_tbd: draft.date_tbd,
          location_name: draft.location_name,
          location_address: draft.location_address,
          is_location_hidden: draft.is_location_hidden,
          is_halal_venue: draft.is_halal_venue,
          price: draft.price,
          capacity: draft.capacity,
          rsvp_deadline: draft.rsvp_deadline,
          use_poster_as_bg: draft.use_poster_as_bg,
        }}
        onZoneTap={handleZoneTap}
        showTitle
        revealLocation
        topBar={
          <EditorChrome
            onBack={handleBack}
            onPublish={handlePublish}
            canPublish={essentialsReady}
            textColor={textColor}
          />
        }
        afterBodySlot={<View style={{ height: 140 }} />}
      />

      <EditorDock
        activeTool={activeTool}
        onToolPress={handleToolPress}
        bottomInset={insets.bottom}
      />

      <EditorToolSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

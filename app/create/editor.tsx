/**
 * Editor — the preview-led event editor (DAW-37 + DAW-54).
 *
 * Full-bleed live preview of the in-progress draft rendered via
 * `EventPreview`, with `EditorChrome` as the top slot and `EditorDock`
 * floating over the bottom. Tapping any canvas zone (poster / title /
 * details / audience) OR any dock button calls `handleToolPress(...)`,
 * which routes to the matching tool sheet at `/create/tools/<id>`. The
 * tool routes are `transparentModal`s so the canvas stays visible and
 * re-renders live as `updateDraft` fires from inside each sheet.
 *
 * The screen is guarded: if a user lands here with an empty draft (e.g.
 * a deep link or a hot reload while the store is clean), we bounce them
 * back to /create/essentials. There is no valid state where the editor
 * has no title + no host.
 *
 * Publish opens the publish tool sheet (DAW-55) which runs the final
 * readiness checklist and calls `publishEvent(...)` to insert into
 * Supabase, then replaces to the success screen.
 */

import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { COLORS } from '../../lib/theme';
import { useEventStore, EditorToolId } from '../../store/useEventStore';
import { getThemeById } from '../../lib/themes';
import EventPreview, { PreviewZone } from '../../components/EventPreview';
import EditorChrome from '../../components/EditorChrome';
import EditorDock from '../../components/EditorDock';

// Map a preview-zone tap to the tool it should open. The editor canvas
// and the editor dock funnel through the same openTool call so the store
// stays the single source of truth for "which tool is open".
function zoneToTool(zone: PreviewZone): EditorToolId {
  switch (zone) {
    case 'poster':
      return 'poster';
    case 'title':
      // Title and date both live in the "essentials" area — for now we
      // surface them through the details tool. DAW-54 may introduce a
      // dedicated title/date tool if the UX calls for it.
      return 'details';
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

  // Guard: no essentials → bounce to the essentials sheet. Only fires
  // when the screen is focused, so hot-reload while typing on the
  // essentials sheet doesn't kick the user around.
  useFocusEffect(
    useCallback(() => {
      if (!essentialsReady) {
        router.replace('/create/essentials');
      }
    }, [essentialsReady, router]),
  );

  // Also guard synchronously on first mount so the empty-preview frame
  // never flashes in.
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
    router.push(`/create/tools/${tool}`);
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
    router.push('/create/tools/publish');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: pageBg }]}
      edges={['top']}
    >
      <EventPreview
        data={{
          title: draft.title,
          description: draft.description,
          theme_id: draft.theme_id,
          poster_url: draft.poster_url,
          effect_id: draft.effect_id,
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

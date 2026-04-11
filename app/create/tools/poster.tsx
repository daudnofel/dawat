/**
 * Poster tool sheet (DAW-54).
 *
 * Two ways to set `draft.poster_url`:
 *   1. Upload row at the top — launches `expo-image-picker` with 1:1 crop
 *      and writes the local URI into the draft (converted to a public URL
 *      at publish time in DAW-55's publish sheet).
 *   2. `PosterLibraryBrowser` — curated Supabase-hosted posters.
 *
 * Shows a small preview strip of the current poster with a "Remove" X so
 * hosts can go back to the theme emoji banner without closing the sheet.
 * Permission flow mirrors the legacy `step-poster.tsx` — permanently
 * denied users are routed to iOS Settings instead of being silently
 * stonewalled.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import ToolSheet from '../../../components/ToolSheet';
import PosterLibraryBrowser from '../../../components/PosterLibraryBrowser';
import { useEventStore } from '../../../store/useEventStore';
import { PosterType, PosterLibraryItem } from '../../../types';
import { Toast } from '../../../components/Toast';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../lib/theme';

const BUCKET_BASE =
  'https://gwjhsbadranzzculpitm.supabase.co/storage/v1/object/public/poster-library';

export default function PosterToolScreen() {
  const router = useRouter();
  const { draft, updateDraft, closeTool } = useEventStore();
  const [picking, setPicking] = useState(false);

  const hasPoster = !!draft.poster_url;

  const handleClose = () => {
    closeTool();
    router.back();
  };

  const handlePickPoster = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPicking(true);

    try {
      const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
      let status = existing.status;

      if (status !== 'granted') {
        if (existing.canAskAgain) {
          const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
          status = req.status;
        }
        if (status !== 'granted') {
          setPicking(false);
          Alert.alert(
            'Photo access needed',
            'Dawat needs access to your photo library to pick a poster. Open Settings to enable it.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'livePhotos'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]) {
        setPicking(false);
        return;
      }

      updateDraft({
        poster_url: result.assets[0].uri,
        poster_type: PosterType.Upload,
        poster_library_id: null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not pick image';
      Toast.error(message);
    } finally {
      setPicking(false);
    }
  };

  const handleRemovePoster = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateDraft({
      poster_url: null,
      poster_type: null,
      poster_library_id: null,
    });
  };

  const handleSelectFromLibrary = (item: PosterLibraryItem) => {
    const fullUrl = `${BUCKET_BASE}/${item.storage_path}`;
    updateDraft({
      poster_url: fullUrl,
      poster_type: PosterType.Library,
      poster_library_id: item.id,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ToolSheet title="Poster" onClose={handleClose}>
      {/* Current poster preview (if any) */}
      {hasPoster && (
        <View style={styles.previewRow}>
          <Image
            source={{ uri: draft.poster_url! }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.previewMeta}>
            <Text style={styles.previewKicker}>CURRENT POSTER</Text>
            <Text style={styles.previewLabel}>
              {draft.poster_type === PosterType.Upload
                ? 'Uploaded from photos'
                : 'From library'}
            </Text>
            <Pressable onPress={handleRemovePoster} hitSlop={8}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Upload row */}
      <Pressable
        onPress={handlePickPoster}
        disabled={picking}
        style={({ pressed }) => [
          styles.uploadRow,
          pressed && styles.pressed,
        ]}
      >
        {picking ? (
          <ActivityIndicator color={COLORS.gold} />
        ) : (
          <>
            <Text style={styles.uploadIcon}>＋</Text>
            <View style={styles.uploadMeta}>
              <Text style={styles.uploadLabel}>Upload from photos</Text>
              <Text style={styles.uploadHint}>
                Any square image or GIF, cropped to 1:1
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </>
        )}
      </Pressable>

      {/* Divider with "or choose from library" kicker */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>OR CHOOSE FROM LIBRARY</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Curated library grid */}
      <PosterLibraryBrowser
        selectedId={draft.poster_library_id ?? null}
        onSelect={handleSelectFromLibrary}
      />
    </ToolSheet>
  );
}

const styles = StyleSheet.create({
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,223,161,0.12)',
    marginBottom: SPACING.lg,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.input,
  },
  previewMeta: { flex: 1, gap: 2 },
  previewKicker: {
    fontSize: 10,
    color: COLORS.muted,
    ...FONTS.bold,
    letterSpacing: 1.2,
  },
  previewLabel: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semibold,
  },
  removeText: {
    fontSize: 13,
    color: COLORS.red,
    ...FONTS.semibold,
    marginTop: 4,
  },

  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.input,
    borderWidth: 1.5,
    borderColor: 'rgba(255,223,161,0.20)',
    borderStyle: 'dashed',
    marginBottom: SPACING.xl,
  },
  pressed: { opacity: 0.85 },
  uploadIcon: {
    fontSize: 32,
    color: COLORS.gold,
    lineHeight: 34,
    width: 40,
    textAlign: 'center',
  },
  uploadMeta: { flex: 1 },
  uploadLabel: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semibold,
  },
  uploadHint: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.regular,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.hint,
    ...FONTS.regular,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,223,161,0.16)',
  },
  dividerLabel: {
    fontSize: 10,
    color: COLORS.muted,
    ...FONTS.bold,
    letterSpacing: 1.2,
  },
});

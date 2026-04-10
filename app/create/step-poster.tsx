import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';
import { PosterType, PosterLibraryItem } from '../../types';
import PosterLibraryBrowser from '../../components/PosterLibraryBrowser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_SIZE = SCREEN_WIDTH - SPACING.xl * 2;
const BUCKET_BASE = 'https://gwjhsbadranzzculpitm.supabase.co/storage/v1/object/public/poster-library';

type PosterTab = 'library' | 'upload';

export default function StepPoster() {
  const { draft, updateDraft, nextStep, prevStep } = useEventStore();
  const [activeTab, setActiveTab] = useState<PosterTab>('library');
  const [picking, setPicking] = useState(false);

  const hasPoster = !!draft.poster_url;

  const handlePickPoster = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPicking(true);

    try {
      // Check existing status first — requesting again once denied does nothing on iOS
      const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
      let status = existing.status;

      if (status !== 'granted') {
        if (existing.canAskAgain) {
          // We can still show the native prompt
          const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
          status = req.status;
        }

        if (status !== 'granted') {
          // Permanently denied — the only way back is iOS Settings
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

      // We carry the local URI in the draft. Resizing to 1280×1280 and
      // re-encoding will happen at publish-time in step 5, OR server-side
      // after upload — whichever we pick. expo-image-picker already cropped
      // to a 1:1 square via allowsEditing + aspect [1,1].
      updateDraft({
        poster_url: result.assets[0].uri,
        poster_type: PosterType.Upload,
        poster_library_id: null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not pick image');
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

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    nextStep();
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

  const handleSkip = () => {
    Haptics.selectionAsync();
    updateDraft({ poster_url: null, poster_type: null, poster_library_id: null });
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => prevStep()} hitSlop={10}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.stepLabel}>Step 2 of 6</Text>
        <Pressable onPress={handleSkip} hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View
            key={s}
            style={[
              styles.dot,
              s <= 2 && styles.dotActive,
              s === 2 && styles.dotCurrent,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Add a poster</Text>
        <Text style={styles.subtitle}>
          The hero image for your event. Make it pop on WhatsApp & Instagram.
        </Text>

        {/* Preview when a poster is selected (from either tab) */}
        {hasPoster && (
          <View style={styles.posterWrap}>
            <View style={styles.posterContainer}>
              <Image source={{ uri: draft.poster_url! }} style={styles.posterImage} />
              <Pressable
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleRemovePoster}
                hitSlop={12}
              >
                <Text style={styles.removeIcon}>✕</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Tab switcher — Library / Upload */}
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tab, activeTab === 'library' && styles.tabActive]}
            onPress={() => setActiveTab('library')}
          >
            <Text style={[styles.tabText, activeTab === 'library' && styles.tabTextActive]}>
              Library
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'upload' && styles.tabActive]}
            onPress={() => setActiveTab('upload')}
          >
            <Text style={[styles.tabText, activeTab === 'upload' && styles.tabTextActive]}>
              Upload
            </Text>
          </Pressable>
        </View>

        {/* Library tab — curated poster grid */}
        {activeTab === 'library' && (
          <PosterLibraryBrowser
            selectedId={draft.poster_library_id ?? null}
            onSelect={handleSelectFromLibrary}
          />
        )}

        {/* Upload tab — pick from camera roll */}
        {activeTab === 'upload' && (
          <View style={styles.posterWrap}>
            <Pressable
              style={({ pressed }) => [
                styles.placeholder,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handlePickPoster}
              disabled={picking}
            >
              {picking ? (
                <ActivityIndicator color={COLORS.gold} size="large" />
              ) : (
                <>
                  <Text style={styles.placeholderIcon}>+</Text>
                  <Text style={styles.placeholderText}>Choose from Photos</Text>
                  <Text style={styles.placeholderHint}>Any square image or GIF</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleContinue}
        >
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="ctaPoster" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFDFA1" />
                <Stop offset="0.5" stopColor="#E6C27A" />
                <Stop offset="1" stopColor="#FFDFA1" />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx={RADIUS.md}
              fill="url(#ctaPoster)"
            />
          </Svg>
          <Text style={styles.buttonText}>
            {hasPoster ? 'Continue' : 'Continue without poster'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  backText: { color: COLORS.gold, fontSize: 16, ...FONTS.medium },
  skipText: { color: COLORS.muted, fontSize: 14, ...FONTS.medium },
  stepLabel: { color: COLORS.muted, fontSize: 13, ...FONTS.medium },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: { backgroundColor: COLORS.gold },
  dotCurrent: { width: 24 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 32 },

  title: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    ...FONTS.regular,
    marginBottom: SPACING.xl,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabActive: {
    backgroundColor: `${COLORS.gold}20`,
    borderColor: `${COLORS.gold}50`,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 14,
    ...FONTS.semibold,
  },
  tabTextActive: {
    color: COLORS.gold,
  },

  posterWrap: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  posterContainer: {
    width: POSTER_SIZE,
    height: POSTER_SIZE,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 13, 13, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  removeIcon: {
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.bold,
    lineHeight: 18,
  },

  placeholder: {
    width: POSTER_SIZE,
    height: POSTER_SIZE,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.input,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 223, 161, 0.16)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  placeholderIcon: {
    fontSize: 48,
    color: COLORS.gold,
    ...FONTS.regular,
    lineHeight: 52,
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semibold,
    marginTop: SPACING.xs,
  },
  placeholderHint: {
    fontSize: 12,
    color: COLORS.muted,
    ...FONTS.regular,
  },

  secondaryButton: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 161, 0.25)',
    backgroundColor: 'rgba(30, 30, 30, 0.45)',
  },
  secondaryButtonText: {
    color: COLORS.gold,
    fontSize: 14,
    ...FONTS.semibold,
  },

  bottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 223, 161, 0.10)',
    marginBottom: 90,
  },
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    color: COLORS.dark,
    fontSize: 16,
    ...FONTS.bold,
    zIndex: 1,
  },
});

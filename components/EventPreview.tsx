/**
 * EventPreview — the shared event-page canvas.
 *
 * DAW-37 (Creation V2, foundation). A pure, prop-driven renderer used in
 * TWO places:
 *
 *   1. The public event detail page (`app/event/[id].tsx`) — renders a real
 *      Supabase row with live data (guest list, map, comments) injected via
 *      slot props, so the page stays behaviorally identical to the old
 *      inline JSX.
 *
 *   2. The new "preview-led" creation editor (`app/create/editor.tsx`) —
 *      renders the in-progress EventDraft. `onZoneTap` becomes defined,
 *      which turns the hero / date / details / audience zones into tappable
 *      handles that open the matching tool sheet.
 *
 * The renderer itself owns:
 *   - Theme background gradient (SVG multi-stop) + safe-area page bg
 *   - Optional ambient effect overlay (EventEffect)
 *   - Poster hero OR theme emoji banner w/ gender + halal badges
 *   - Optional title above the date (editor only — event page never
 *     rendered a title in the body, so parity requires `showTitle={false}`
 *     by default)
 *   - Date (big bold) + time
 *   - Hosted-by label (caller injects avatars as a slot)
 *   - Location row + address
 *   - Map slot
 *   - Capacity / price / rsvp deadline info rows
 *   - Description
 *   - afterBodySlot for guest list, comments, spacer, etc.
 *
 * The renderer does NOT own:
 *   - SafeAreaView (caller wraps if needed)
 *   - Floating RSVP bar (absolute overlay, lives on the event page)
 *   - Any live data fetching
 *   - Navigation
 */

import React, { ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';
import { getThemeById } from '../lib/themes';
import { getTitleTextStyle } from '../lib/title-styles';
import { GenderMode, EffectId } from '../types';
import EventEffect from './EventEffect';
import ThemePattern, { PatternId } from './ThemePattern';
import ThemeTexture, { TextureType } from './ThemeTexture';

// ─── Types ────────────────────────────────────────────────────────────

export type PreviewZone = 'title' | 'poster' | 'details' | 'audience';

/**
 * The narrow shape EventPreview cares about. Both `Event` (DB row, dates as
 * strings) and `EventDraft` (dates as JS Date) conform — we normalize inside.
 */
export interface EventPreviewData {
  title: string;
  description: string | null;
  theme_id: string;
  poster_url: string | null;
  effect_id: EffectId | string | null;
  title_style?: string | null;
  gender_mode: GenderMode;
  date_time: Date | string | null;
  date_tbd: boolean;
  location_name: string | null;
  location_address: string | null;
  is_location_hidden: boolean;
  is_halal_venue: boolean;
  price: number;
  capacity: number | null;
  rsvp_deadline: Date | string | null;
}

export interface EventPreviewProps {
  data: EventPreviewData;

  /**
   * When provided, zones become tappable (editor mode). Each tap fires
   * `onZoneTap(zone)` + a light haptic. If undefined, the preview is
   * a pure passive renderer — the event page case.
   */
  onZoneTap?: (zone: PreviewZone) => void;

  /**
   * Render the event title above the date block. Default `false` so the
   * public event page keeps byte-for-byte layout parity (it never rendered
   * a title in the body). The editor sets this `true` so the host can
   * actually see their title as they build.
   */
  showTitle?: boolean;

  /**
   * If false, a hidden location is masked as "Address revealed after RSVP".
   * Default `true`. Pass `false` from the event page for non-host viewers
   * who haven't said Yes yet.
   */
  revealLocation?: boolean;

  /**
   * Confirmed-yes headcount used for the "X/Y spots left" calculation.
   * Default `0`.
   */
  yesCount?: number;

  /** Sticky top bar slot (e.g., back arrow + share + more menu). */
  topBar?: ReactNode;

  /** Rendered immediately under the "Hosted by" label. */
  hostedBySlot?: ReactNode;

  /** Rendered after the location address (e.g., `<MapPreview />`). */
  mapSlot?: ReactNode;

  /** Rendered after the description (guest list, comments, spacer, etc). */
  afterBodySlot?: ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────

const GENDER_LABEL: Record<GenderMode, string> = {
  [GenderMode.Mixed]: '🌟 Mixed',
  [GenderMode.SistersOnly]: '🌸 Sisters Only',
  [GenderMode.BrothersOnly]: '💪 Brothers',
  [GenderMode.Family]: '👨\u200d👩\u200d👧 Family',
};

function toDate(value: Date | string | null): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function formatDateMain(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDeadline(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────

export default function EventPreview({
  data,
  onZoneTap,
  showTitle = false,
  revealLocation = true,
  yesCount = 0,
  topBar,
  hostedBySlot,
  mapSlot,
  afterBodySlot,
}: EventPreviewProps) {
  const theme = getThemeById(data.theme_id);
  const textColor = theme?.textColor ?? COLORS.white;
  const mutedTextColor = theme?.textColor ? `${theme.textColor}AA` : COLORS.muted;
  const subtleTextColor = theme?.textColor ? `${theme.textColor}88` : COLORS.muted;
  const pageBg = theme?.background?.stops?.[0] ?? theme?.bannerBg ?? COLORS.dark;

  const dateObj = toDate(data.date_time);
  const deadlineObj = toDate(data.rsvp_deadline);

  const locationVisible = !data.is_location_hidden || revealLocation;
  const locationText = locationVisible
    ? data.location_name ?? 'Location TBD'
    : 'Address revealed after RSVP';

  const spotsLeft =
    data.capacity != null ? Math.max(data.capacity - yesCount, 0) : null;

  const genderLabel = GENDER_LABEL[data.gender_mode] ?? GENDER_LABEL[GenderMode.Mixed];

  // Zone-tap helper — wraps a region in a Pressable when the editor is
  // driving us, a plain View otherwise. Keeps the event page exactly as
  // it was (no tap targets, no press states, no haptics).
  const Zone = ({
    zone,
    children,
    style,
  }: {
    zone: PreviewZone;
    children: ReactNode;
    style?: object;
  }) => {
    if (!onZoneTap) {
      return <View style={style}>{children}</View>;
    }
    return (
      <Pressable
        style={({ pressed }) => [
          style,
          pressed && styles.zonePressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onZoneTap(zone);
        }}
      >
        {children}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: pageBg }]}>
      {/* Full-bleed theme gradient as the page background */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="pagePreviewGrad" x1="0" y1="0" x2="0" y2="1">
            {(theme?.background?.stops ?? [pageBg, pageBg]).map((stop, i, arr) => (
              <Stop
                key={`pg-${i}`}
                offset={arr.length === 1 ? '0' : (i / (arr.length - 1)).toString()}
                stopColor={stop}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pagePreviewGrad)" />
      </Svg>

      {/* DAW-57 — Islamic geometric pattern overlay */}
      {theme?.background?.pattern && theme.background.pattern !== 'none' && (
        <ThemePattern
          pattern={theme.background.pattern as PatternId}
          color={theme.textColor}
          opacity={theme.background.overlayOpacity ?? 0.08}
        />
      )}

      {/* DAW-57 — Film grain / paper texture overlay */}
      {theme?.background?.texture && (
        <ThemeTexture
          type={theme.background.texture as TextureType}
          color={theme.textColor}
          opacity={theme.background.textureOpacity ?? 0.05}
        />
      )}

      {/* Ambient effect overlay (rose petals, lanterns, etc.) */}
      {data.effect_id && (
        <EventEffect effectId={data.effect_id as EffectId} />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {topBar}

        {/* ── Hero: poster (DAW-22) OR theme emoji banner ── */}
        <Zone zone="poster">
          {data.poster_url ? (
            <View style={styles.posterHero}>
              <Image
                source={{ uri: data.poster_url }}
                style={styles.posterHeroImage}
                resizeMode="cover"
              />
              {/* Bottom fade that blends the poster into the page bg */}
              <Svg style={styles.posterFadeOverlay} pointerEvents="none">
                <Defs>
                  <LinearGradient id="posterFadePreview" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={COLORS.dark} stopOpacity="0" />
                    <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0.95" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#posterFadePreview)" />
              </Svg>
              <View style={styles.badgeRow}>
                <Zone zone="audience">
                  <View style={styles.genderBadge}>
                    <Text style={styles.genderBadgeText}>{genderLabel}</Text>
                  </View>
                </Zone>
                {data.is_halal_venue && (
                  <View style={styles.halalBadge}>
                    <Text style={styles.halalBadgeText}>✅ Halal</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.banner}>
              <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="bannerGradPreview" x1="0" y1="0" x2="1" y2="1">
                    {(theme?.background?.stops ?? [
                      theme?.bannerBg ?? COLORS.card2,
                      COLORS.card,
                    ]).map((stop, i, arr) => (
                      <Stop
                        key={`b-${i}`}
                        offset={arr.length === 1 ? '0' : (i / (arr.length - 1)).toString()}
                        stopColor={stop}
                      />
                    ))}
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#bannerGradPreview)" />
              </Svg>
              <Text style={styles.bannerEmoji}>{theme?.defaultEmoji ?? '🌙'}</Text>
              <View style={styles.badgeRow}>
                <Zone zone="audience">
                  <View style={styles.genderBadge}>
                    <Text style={styles.genderBadgeText}>{genderLabel}</Text>
                  </View>
                </Zone>
                {data.is_halal_venue && (
                  <View style={styles.halalBadge}>
                    <Text style={styles.halalBadgeText}>✅ Halal</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </Zone>

        <View style={styles.body}>
          {/* Title — editor-only render (see showTitle prop) */}
          {showTitle && data.title.trim().length > 0 && (
            <Zone zone="title">
              <Text style={[styles.title, getTitleTextStyle(data.title_style), { color: textColor }]}>
                {data.title}
              </Text>
            </Zone>
          )}

          {/* Date block */}
          <Zone zone="title">
            <Text style={[styles.dateMain, { color: textColor }]}>
              {data.date_tbd || !dateObj ? 'Date TBD' : formatDateMain(dateObj)}
            </Text>
            {dateObj && !data.date_tbd && (
              <Text style={[styles.dateTime, { color: textColor }]}>
                {formatTime(dateObj)}
              </Text>
            )}
          </Zone>

          {/* Hosted by */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🎯</Text>
            <Text style={[styles.infoLabel, { color: mutedTextColor }]}>
              Hosted by
            </Text>
          </View>
          {hostedBySlot}

          {/* Location */}
          <Zone zone="details">
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {locationText}
              </Text>
            </View>
            {data.location_address && locationVisible && (
              <Text style={[styles.locationAddress, { color: subtleTextColor }]}>
                {data.location_address}
              </Text>
            )}
          </Zone>

          {mapSlot}

          {/* Capacity */}
          {spotsLeft != null && data.capacity != null && (
            <Zone zone="details">
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>👥</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {spotsLeft}/{data.capacity} spots left
                </Text>
              </View>
            </Zone>
          )}

          {/* Price */}
          {data.price > 0 && (
            <Zone zone="details">
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🎟</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  ${(data.price / 100).toFixed(0)}
                </Text>
              </View>
            </Zone>
          )}

          {/* RSVP deadline */}
          {deadlineObj && (
            <Zone zone="details">
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>⏳</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  RSVP by {formatDeadline(deadlineObj)}
                </Text>
              </View>
            </Zone>
          )}

          {/* Description */}
          {data.description && data.description.trim().length > 0 && (
            <Text style={[styles.description, { color: textColor }]}>
              {data.description}
            </Text>
          )}

          {afterBodySlot}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles (ported verbatim from app/event/[id].tsx for parity) ──────

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  scroll: { backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 0 },

  // Hero — poster
  posterHero: {
    alignSelf: 'center',
    width: '88%',
    aspectRatio: 1,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    position: 'relative',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  posterHeroImage: { width: '100%', height: '100%' },
  posterFadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },

  // Hero — fallback emoji banner
  banner: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bannerEmoji: { fontSize: 56 },

  // Badges row (sits inside the hero)
  badgeRow: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  genderBadgeText: { color: COLORS.white, fontSize: 12, ...FONTS.medium },
  halalBadge: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  halalBadgeText: { color: COLORS.green, fontSize: 12, ...FONTS.medium },

  // Body
  body: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },

  title: {
    // fontSize, fontFamily, fontWeight, letterSpacing come from
    // getTitleTextStyle(data.title_style) applied inline (DAW-56).
    marginBottom: SPACING.md,
  },

  dateMain: { fontSize: 28, ...FONTS.bold, letterSpacing: -0.3 },
  dateTime: { fontSize: 18, ...FONTS.regular, marginBottom: SPACING.xl },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  infoIcon: { fontSize: 18, width: 28 },
  infoLabel: { fontSize: 16, ...FONTS.medium },
  infoValue: { fontSize: 18, ...FONTS.bold },
  locationAddress: {
    fontSize: 15,
    ...FONTS.regular,
    marginLeft: 28 + SPACING.md,
    marginBottom: SPACING.sm,
  },

  description: {
    fontSize: 17,
    ...FONTS.regular,
    lineHeight: 28,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },

  zonePressed: { opacity: 0.85 },
});

/**
 * Publish tool sheet (DAW-55).
 *
 * The final step of the creation flow: a readiness checklist for the host
 * to sanity-check their event, a warm Bismillah line, and the big gold
 * "Publish event" button that calls `publishEvent(...)` and navigates to
 * the success screen with the inserted slug.
 *
 * Checklist semantics:
 *   - Title / Host / Audience are REQUIRED — green ✅ when present.
 *   - Date is required UNLESS `date_tbd` is true (then still ✅ — TBD is a
 *     valid choice, not a gap).
 *   - Poster + Theme are OPTIONAL — amber ⚠️ with a "skip" hint when empty
 *     so the host knows they can still publish without them.
 *
 * The "Publish event" button is only enabled when the *required* rows are
 * green. Optional warnings never block publish.
 *
 * DAW-61 — migrated to Dawat primitives (DText, DButton).
 */

import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

import ToolSheet from '../../../components/ToolSheet';
import { useEventStore } from '../../../store/useEventStore';
import { Toast } from '../../../components/Toast';
import { getCurrentUserId } from '../../../lib/auth-cache';
import { publishEvent, PublishEventError } from '../../../lib/publishEvent';
import { GenderMode } from '../../../types';
import { DText, DButton } from '../../../components/ui';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../lib/theme';

interface Props {
  onClose?: () => void;
}

interface ChecklistRow {
  label: string;
  value: string;
  ok: boolean;
  required: boolean;
}

function genderLabel(mode: GenderMode): string {
  switch (mode) {
    case GenderMode.Mixed:
      return 'Mixed — open to all';
    case GenderMode.SistersOnly:
      return 'Sisters only';
    case GenderMode.BrothersOnly:
      return 'Brothers only';
    case GenderMode.Family:
      return 'Family — parents + kids';
  }
}

export default function PublishToolScreen({ onClose }: Props = {}) {
  const router = useRouter();
  const { draft, closeTool } = useEventStore();
  const [publishing, setPublishing] = useState(false);

  const handleClose = () => {
    if (publishing) return;
    closeTool();
    onClose?.();
  };

  // ── Checklist rows ──────────────────────────────────────────────────
  const titleOk = draft.title.trim().length >= 2;
  const hostOk = draft.host_name.trim().length >= 2;
  const dateOk = draft.date_tbd || draft.date_time instanceof Date;
  const audienceOk = !!draft.gender_mode;
  const posterOk = !!draft.poster_url;
  const themeOk = !!draft.theme_id;

  const rows: ChecklistRow[] = [
    {
      label: 'Title',
      value: titleOk ? draft.title : 'Add an event title',
      ok: titleOk,
      required: true,
    },
    {
      label: 'Host',
      value: hostOk ? draft.host_name : 'Add who\'s hosting',
      ok: hostOk,
      required: true,
    },
    {
      label: 'Date',
      value: draft.date_tbd
        ? 'To be announced'
        : draft.date_time
          ? format(draft.date_time, 'EEE, MMM d · h:mm a')
          : 'Pick a date or mark TBD',
      ok: dateOk,
      required: true,
    },
    {
      label: 'Audience',
      value: genderLabel(draft.gender_mode),
      ok: audienceOk,
      required: true,
    },
    {
      label: 'Theme',
      value: themeOk ? 'Picked' : 'Using default — tap Theme to style it',
      ok: themeOk,
      required: false,
    },
    {
      label: 'Poster',
      value: posterOk ? 'Attached' : 'Skipped — you can publish without one',
      ok: posterOk,
      required: false,
    },
  ];

  const requiredReady = rows.every((r) => !r.required || r.ok);

  // ── Publish action ──────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!requiredReady || publishing) return;

    setPublishing(true);

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        Toast.error('You need to be signed in to publish.');
        setPublishing(false);
        return;
      }

      const { slug } = await publishEvent(draft, userId);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeTool();
      router.replace({
        pathname: '/create/success',
        params: { slug },
      });
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        e instanceof PublishEventError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Something went wrong publishing your event.';
      Toast.error(msg);
      setPublishing(false);
    }
  };

  return (
    <ToolSheet title="Review & publish" onClose={handleClose}>
      <DText variant="meta" color={COLORS.muted} style={styles.intro}>
        Take one last look — you can still edit anything after publishing.
      </DText>

      <View style={styles.card}>
        {rows.map((row, idx) => (
          <View
            key={row.label}
            style={[
              styles.row,
              idx < rows.length - 1 && styles.rowBorder,
            ]}
          >
            <View
              style={[
                styles.badge,
                row.ok
                  ? styles.badgeOk
                  : row.required
                    ? styles.badgeMissing
                    : styles.badgeWarn,
              ]}
            >
              <DText
                style={[
                  styles.badgeMark,
                  {
                    color: row.ok
                      ? COLORS.green
                      : row.required
                        ? COLORS.red
                        : COLORS.amber,
                  },
                ]}
              >
                {row.ok ? '✓' : row.required ? '!' : '⚠'}
              </DText>
            </View>
            <View style={styles.rowText}>
              <DText variant="kicker" color={COLORS.muted} style={{ marginBottom: 2 }}>
                {row.label}
              </DText>
              <DText
                variant="meta"
                color={
                  !row.ok && !row.required
                    ? COLORS.amber
                    : !row.ok && row.required
                      ? COLORS.red
                      : COLORS.white
                }
                style={{ fontSize: 15 }}
                numberOfLines={2}
              >
                {row.value}
              </DText>
            </View>
          </View>
        ))}
      </View>

      <DText
        color={COLORS.gold}
        style={styles.bismillah}
      >
        Bismillah — let's put this out into the world.
      </DText>

      {publishing ? (
        <View style={styles.loadingBtn}>
          <ActivityIndicator color={COLORS.dark} />
        </View>
      ) : (
        <DButton
          title={requiredReady ? 'Publish event' : 'Fill the required fields'}
          variant="gold"
          onPress={handlePublish}
          disabled={!requiredReady}
        />
      )}

      {!requiredReady && (
        <DText variant="hint" style={styles.hint}>
          Tap the red rows above to jump back and finish them.
        </DText>
      )}
    </ToolSheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,223,161,0.10)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,223,161,0.08)',
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOk: { backgroundColor: 'rgba(76,175,80,0.18)' },
  badgeMissing: { backgroundColor: 'rgba(239,68,68,0.18)' },
  badgeWarn: { backgroundColor: 'rgba(245,158,11,0.18)' },
  badgeMark: { fontSize: 13, ...FONTS.bold },
  rowText: { flex: 1 },
  bismillah: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    ...FONTS.medium,
  },
  loadingBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  hint: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

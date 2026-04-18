/**
 * publishEvent — extract of the old `step4-settings.handlePublish` (DAW-55).
 *
 * The legacy wizard put poster upload + Supabase insert + email trigger at
 * the bottom of a screen called "settings". That's three concerns masquerading
 * as one UI event handler. DAW-55 moves the *work* to this module so the
 * publish bottom sheet stays a pure UI concern, and so edit / duplicate /
 * recurring-series flows can all call the same function later.
 *
 * Contract:
 *   - Input: a filled `EventDraft` + the authenticated user's id.
 *   - Output: `{ id, slug }` of the newly inserted event row.
 *   - Side effects:
 *       1. If the host picked a LOCAL image (PosterType.Upload), upload it
 *          to the `event-posters` bucket and use the resulting public URL.
 *       2. Library posters pass through unchanged — they already live at
 *          a public URL.
 *       3. Fire-and-forget `event_published` email via `triggerEmail`.
 *          This never blocks or fails the publish flow.
 *   - On any failure before the insert, throws a `PublishEventError` with a
 *     stable `code` so the caller can render a friendly Toast.
 *
 * Transactional semantics: there is no compensating action if the insert
 * fails after a poster upload — the orphaned image is cheap and the next
 * publish attempt will overwrite the draft's poster_url anyway. We do NOT
 * catch the insert and re-upload.
 */

import { supabase } from './supabase';
import { generateSlug } from './slugify';
import { triggerEmail } from './email';
import { EventDraft, PosterType } from '../types';

export type PublishEventErrorCode =
  | 'missing_env'
  | 'poster_upload_failed'
  | 'network'
  | 'server';

export class PublishEventError extends Error {
  code: PublishEventErrorCode;
  constructor(code: PublishEventErrorCode, message: string) {
    super(message);
    this.name = 'PublishEventError';
    this.code = code;
  }
}

export interface PublishEventResult {
  id: string;
  slug: string;
}

const VALID_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'] as const;

export async function publishEvent(
  draft: EventDraft,
  userId: string,
): Promise<PublishEventResult> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new PublishEventError(
      'missing_env',
      'Supabase configuration is missing.',
    );
  }

  const slug = generateSlug(draft.title);

  // ── Poster upload ─────────────────────────────────────────────────
  let finalPosterUrl: string | null = null;

  if (draft.poster_url && draft.poster_type === PosterType.Upload) {
    try {
      const rawExt = draft.poster_url
        .split('.')
        .pop()
        ?.split('?')[0]
        ?.toLowerCase();
      const ext = (
        rawExt && (VALID_IMAGE_EXTS as readonly string[]).includes(rawExt)
          ? rawExt
          : 'jpg'
      );
      const filePath = `${userId}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const response = await fetch(draft.poster_url);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadErr } = await supabase.storage
        .from('event-posters')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: false,
        });

      if (uploadErr) {
        throw new PublishEventError(
          'poster_upload_failed',
          `Poster upload failed: ${uploadErr.message}`,
        );
      }

      const { data: urlData } = supabase.storage
        .from('event-posters')
        .getPublicUrl(filePath);
      finalPosterUrl = urlData.publicUrl;
    } catch (e) {
      if (e instanceof PublishEventError) throw e;
      const message = e instanceof Error ? e.message : 'Unknown error';
      throw new PublishEventError(
        'poster_upload_failed',
        `Poster upload failed: ${message}`,
      );
    }
  } else if (draft.poster_url && draft.poster_type === PosterType.Library) {
    finalPosterUrl = draft.poster_url;
  }

  // ── REST insert ───────────────────────────────────────────────────
  let res: Response;
  try {
    res = await fetch(`${supabaseUrl}/rest/v1/events`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        title: draft.title,
        description: draft.description || null,
        host_id: userId,
        theme_id: draft.theme_id,
        poster_url: finalPosterUrl,
        poster_type: draft.poster_type,
        poster_library_id: draft.poster_library_id,
        effect_id: draft.effect_id,
        title_style: draft.title_style ?? 'classic',
        gender_mode: draft.gender_mode,
        is_id_required: draft.is_id_required,
        date_time: draft.date_time?.toISOString() ?? null,
        date_tbd: draft.date_tbd,
        location_name: draft.location_name || null,
        location_address: draft.location_address || null,
        location_lat: draft.location_lat,
        location_lng: draft.location_lng,
        is_location_hidden: draft.is_location_hidden,
        is_halal_venue: draft.is_halal_venue,
        price: draft.price,
        capacity: draft.capacity,
        rsvp_deadline: draft.rsvp_deadline?.toISOString() ?? null,
        virtual_link: draft.virtual_link || null,
        allow_plus_ones: draft.allow_plus_ones,
        max_plus_ones: draft.max_plus_ones,
        // DAW-6 — external payment link + guest list privacy
        payment_link: draft.payment_link || null,
        hide_guest_list: draft.hide_guest_list,
        hide_headcount: draft.hide_headcount,
        anonymize_guests: draft.anonymize_guests,
        slug,
        is_published: true,
      }),
    });
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : 'Network error — check your connection';
    throw new PublishEventError('network', message);
  }

  if (!res.ok) {
    let serverMsg = 'Error publishing event';
    try {
      const err = await res.json();
      if (err?.message) serverMsg = err.message;
    } catch {
      /* non-JSON body — fall through to default */
    }
    throw new PublishEventError('server', serverMsg);
  }

  // PostgREST returns an array on insert+return=representation.
  let insertedId = '';
  try {
    const rows = (await res.json()) as Array<{ id: string }>;
    insertedId = rows?.[0]?.id ?? '';
  } catch {
    // Leave insertedId blank — caller still has slug + will look up by slug.
  }

  // ── Fire-and-forget email ─────────────────────────────────────────
  // Never block publish for email and never let an email bug throw.
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser?.email) {
      void triggerEmail({
        type: 'event_published',
        payload: {
          to: authUser.email,
          hostName: draft.host_name || 'there',
          eventTitle: draft.title,
          eventDate: draft.date_time
            ? draft.date_time.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            : 'TBD',
          eventUrl: `https://dawat.app/e/${slug}`,
        },
      });
    }
  } catch {
    // swallow
  }

  return { id: insertedId, slug };
}

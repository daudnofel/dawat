-- =============================================
-- DAWAT — Full Database Setup
-- Run this in Supabase SQL Editor (one time)
-- =============================================

-- 1. USERS
CREATE TABLE users (
  id              uuid         PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username        text         UNIQUE NOT NULL,
  display_name    text         NOT NULL,
  phone           text         UNIQUE,
  avatar_url      text,
  gender          text         CHECK (gender IN ('male','female','prefer_not_say')),
  gender_pref     text         DEFAULT 'all'
                               CHECK (gender_pref IN ('all','sisters_only','brothers_only','family')),
  is_id_verified  boolean      DEFAULT false,
  location_city   text,
  location_lat    float8,
  location_lng    float8,
  is_masjid_admin boolean      DEFAULT false,
  push_token      text,
  whatsapp_opt_in boolean      DEFAULT true,
  created_at      timestamptz  DEFAULT now()
);

-- 2. ORGANISATIONS
CREATE TABLE organisations (
  id                 uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text    NOT NULL,
  handle             text    UNIQUE NOT NULL,
  type               text    CHECK (type IN ('masjid','school','dawah','community','other')),
  description        text,
  logo_url           text,
  cover_url          text,
  location_city      text,
  location_address   text,
  website            text,
  instagram_handle   text,
  is_verified        boolean DEFAULT false,
  plan               text    DEFAULT 'free'
                             CHECK (plan IN ('free','starter','pro','enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at         timestamptz DEFAULT now()
);

-- 3. EVENTS
CREATE TABLE events (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text         NOT NULL,
  description        text,
  org_id             uuid         REFERENCES organisations(id),
  host_id            uuid         NOT NULL REFERENCES users(id),
  theme_id           text         NOT NULL,
  theme_custom_url   text,
  gender_mode        text         NOT NULL DEFAULT 'mixed'
                                  CHECK (gender_mode IN ('mixed','sisters_only','brothers_only','family')),
  is_id_required     boolean      DEFAULT false,
  date_time          timestamptz,
  date_tbd           boolean      DEFAULT false,
  hijri_date         text,
  location_name      text,
  location_address   text,
  location_lat       float8,
  location_lng       float8,
  is_location_hidden boolean      DEFAULT false,
  price              integer      DEFAULT 0,
  capacity           integer,
  is_halal_venue     boolean      DEFAULT false,
  prayer_info        text,
  custom_tags        text[],
  slug               text         UNIQUE NOT NULL,
  is_published       boolean      DEFAULT false,
  is_cancelled       boolean      DEFAULT false,
  stripe_account_id  text,
  created_at         timestamptz  DEFAULT now(),
  updated_at         timestamptz  DEFAULT now()
);

CREATE INDEX idx_events_date ON events(date_time ASC) WHERE is_published = true AND is_cancelled = false;
CREATE INDEX idx_events_gender ON events(gender_mode) WHERE is_published = true;
CREATE INDEX idx_events_org ON events(org_id) WHERE is_published = true;
CREATE INDEX idx_events_slug ON events(slug);

-- 4. RSVPS
CREATE TABLE rsvps (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id        uuid        REFERENCES users(id),
  guest_phone    text,
  guest_name     text,
  status         text        NOT NULL
                             CHECK (status IN ('yes','inshallah','no')),
  children_count integer     DEFAULT 0,
  children_names text[],
  checked_in     boolean     DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),

  UNIQUE(event_id, user_id),
  UNIQUE(event_id, guest_phone)
);

CREATE INDEX idx_rsvps_event ON rsvps(event_id);
CREATE INDEX idx_rsvps_user ON rsvps(user_id);

-- 5. ORG MEMBERS
CREATE TABLE org_members (
  org_id     uuid        NOT NULL REFERENCES organisations(id),
  user_id    uuid        NOT NULL REFERENCES users(id),
  role       text        DEFAULT 'admin' CHECK (role IN ('admin','editor','viewer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- 6. ORG FOLLOWERS
CREATE TABLE org_followers (
  org_id     uuid        NOT NULL REFERENCES organisations(id),
  user_id    uuid        NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- 7. HALAL SPOTS
CREATE TABLE halal_spots (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text    NOT NULL,
  type             text    CHECK (type IN ('restaurant','food_truck','venue','cafe','other')),
  is_halal_certified boolean DEFAULT false,
  address          text,
  city             text,
  lat              float8,
  lng              float8,
  emoji            text    DEFAULT '🍽️',
  checkin_count    integer DEFAULT 0,
  added_by         uuid    REFERENCES users(id),
  created_at       timestamptz DEFAULT now()
);

-- 8. NOTIFICATIONS
CREATE TABLE notifications (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid    REFERENCES users(id),
  event_id   uuid    REFERENCES events(id),
  type       text    CHECK (type IN ('event_invite','rsvp_update','reminder_48h','reminder_2h','text_blast','new_event_from_org','inshallah_nudge')),
  channel    text    CHECK (channel IN ('push','whatsapp','email')),
  message    text,
  sent_at    timestamptz DEFAULT now(),
  delivered  boolean DEFAULT false
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE halal_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can read any profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- EVENTS
CREATE POLICY "Published events are public" ON events FOR SELECT
  USING (is_published = true AND is_cancelled = false);
CREATE POLICY "Hosts can see own events" ON events FOR SELECT
  USING (host_id = auth.uid());
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Hosts manage their events" ON events FOR UPDATE
  USING (host_id = auth.uid());
CREATE POLICY "Hosts can delete their events" ON events FOR DELETE
  USING (host_id = auth.uid());

-- RSVPS
CREATE POLICY "Anyone can create RSVP" ON rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Users see own RSVPs" ON rsvps FOR SELECT
  USING (user_id = auth.uid() OR guest_phone IS NOT NULL);
CREATE POLICY "Event hosts see all RSVPs" ON rsvps FOR SELECT
  USING (EXISTS (SELECT 1 FROM events WHERE id = event_id AND host_id = auth.uid()));
CREATE POLICY "Users can update own RSVP" ON rsvps FOR UPDATE
  USING (user_id = auth.uid());

-- ORGANISATIONS
CREATE POLICY "Anyone reads orgs" ON organisations FOR SELECT USING (true);
CREATE POLICY "Org admins manage org" ON organisations FOR ALL
  USING (EXISTS (SELECT 1 FROM org_members WHERE org_id = id AND user_id = auth.uid()));

-- ORG MEMBERS
CREATE POLICY "Org members visible to members" ON org_members FOR SELECT USING (true);
CREATE POLICY "Org admins manage members" ON org_members FOR ALL
  USING (EXISTS (SELECT 1 FROM org_members om WHERE om.org_id = org_id AND om.user_id = auth.uid() AND om.role = 'admin'));

-- ORG FOLLOWERS
CREATE POLICY "Anyone reads followers" ON org_followers FOR SELECT USING (true);
CREATE POLICY "Users manage own follows" ON org_followers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow" ON org_followers FOR DELETE USING (auth.uid() = user_id);

-- HALAL SPOTS
CREATE POLICY "Anyone reads halal spots" ON halal_spots FOR SELECT USING (true);
CREATE POLICY "Authenticated users add spots" ON halal_spots FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- NOTIFICATIONS
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- =============================================
-- 9. COMMENT REACTIONS (DAW-39)
-- =============================================

CREATE TABLE comment_reactions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  uuid        NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji       text        NOT NULL,
  created_at  timestamptz DEFAULT now(),

  UNIQUE(comment_id, user_id, emoji)
);

CREATE INDEX idx_comment_reactions_comment ON comment_reactions(comment_id);

ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reactions" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add own reactions" ON comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── DAW-35: Threaded replies (one level deep) ────────────────────
ALTER TABLE comments ADD COLUMN parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- =============================================
-- 10. EVENT IDENTITY SYSTEM (DAW-22)
-- Poster + Theme + Effects — Partiful-style 3-layer refactor
-- =============================================

-- New columns on events for the 3 identity layers
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_url         text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_type        text;  -- 'upload' | 'library' | 'builder'
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_library_id  text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS effect_id          text;  -- nullable Lottie effect

COMMENT ON COLUMN events.poster_url IS 'Public URL of the hero image/GIF for this event';
COMMENT ON COLUMN events.poster_type IS 'Source of the poster: upload | library | builder';
COMMENT ON COLUMN events.poster_library_id IS 'If poster_type = library, references poster_library.id';
COMMENT ON COLUMN events.effect_id IS 'Optional ambient Lottie effect on the event detail page';

-- Curated poster library (our own assets)
CREATE TABLE IF NOT EXISTS poster_library (
  id              text        PRIMARY KEY,
  category        text        NOT NULL,       -- 'nikkah' | 'iftar' | 'eid' | ...
  storage_path    text        NOT NULL,
  thumbnail_path  text        NOT NULL,
  name            text,
  tags            text[]      DEFAULT '{}',
  sort_order      integer     DEFAULT 0,
  is_active       boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_poster_library_category
  ON poster_library(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_poster_library_sort
  ON poster_library(sort_order) WHERE is_active = true;

ALTER TABLE poster_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read poster library" ON poster_library;
CREATE POLICY "Anyone can read poster library" ON poster_library
  FOR SELECT USING (is_active = true);

-- ─── Storage buckets (created via API in this PR) ─────────────────
-- poster-library (public, 5MB, png/jpeg/webp/gif) — our curated assets
-- event-posters (private, 10MB, png/jpeg/webp/gif) — user-uploaded posters

-- Storage RLS: event-posters — users can only manage files under their own uid folder
DROP POLICY IF EXISTS "Users upload own event posters" ON storage.objects;
CREATE POLICY "Users upload own event posters" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event-posters'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users read own event posters" ON storage.objects;
CREATE POLICY "Users read own event posters" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'event-posters'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users delete own event posters" ON storage.objects;
CREATE POLICY "Users delete own event posters" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'event-posters'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: poster-library — anyone can read (it's public anyway, but make it explicit)
DROP POLICY IF EXISTS "Anyone reads poster library objects" ON storage.objects;
CREATE POLICY "Anyone reads poster library objects" ON storage.objects
  FOR SELECT USING (bucket_id = 'poster-library');

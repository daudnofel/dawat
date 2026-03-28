# DAWAT دعوت — Product Requirements Document v3.0
**The Muslim Community Events Platform**
**Status:** MVP Build Ready
**Last Updated:** March 2026

---

## Table of Contents

1. [The Idea & Why It Exists](#1-the-idea--why-it-exists)
2. [Philosophy & Brand](#2-philosophy--brand)
3. [Market Context](#3-market-context)
4. [UX & Design Philosophy](#4-ux--design-philosophy)
5. [Feature Set — Full Roadmap](#5-feature-set--full-roadmap)
6. [MVP Scope & Sprint Plan](#6-mvp-scope--sprint-plan)
7. [Tech Stack](#7-tech-stack)
8. [Database Schema](#8-database-schema)
9. [Screen-by-Screen Specs](#9-screen-by-screen-specs)
10. [Islamic Theme System](#10-islamic-theme-system)
11. [Shareable RSVP Link System](#11-shareable-rsvp-link-system)
12. [Notification & Messaging System](#12-notification--messaging-system)
13. [Payments & Monetisation](#13-payments--monetisation)
14. [Authentication & Users](#14-authentication--users)
15. [Running Costs](#15-running-costs)
16. [Build Guide — How to Use This PRD](#16-build-guide--how-to-use-this-prd)
17. [Pre-Launch Checklist](#17-pre-launch-checklist)
18. [Design Tokens](#18-design-tokens)

---

## 1. The Idea & Why It Exists

### 1.1 The Problem

Muslim communities around the world — in the US, UK, Canada, Australia — are vibrant, event-rich, and deeply relational. Iftars, halaqas, nikah walimas, masjid fundraisers, sisters' circles, Eid galas, scholar talks. These gatherings are the heartbeat of the Ummah.

And yet every single one of them is being organised with tools designed by and for people who have never thought about gender-segregated spaces, family registration with children, prayer time conflicts, halal venue requirements, or the Islamic calendar.

The current stack: a Facebook Events page nobody checks, a Google Form for dietary restrictions, a WhatsApp group where 200 messages bury the RSVP link, and a spreadsheet to count who's coming. Cobbled together. Every time. For every event.

**There is no single trusted platform designed for how Muslims actually gather.**

### 1.2 The Solution

Dawat is a Partiful-style social events platform built natively for Muslim communities. Beautiful, fast, and joyful to use — with Islamic values embedded in the product architecture from day one, not bolted on as features.

Dawat makes organising a Muslim event feel like the event itself: intentional, warm, and culturally yours.

### 1.3 The Name

**Dawat** (دعوت) means "invitation" in Arabic, Urdu, and across multiple Muslim languages. It is the word used for gatherings, for hospitality, for bringing people together. It is the most natural name in the world for this product.

### 1.4 The One Feature That Cannot Ship Broken

> **Guests must RSVP without downloading the app. Tap a link, enter phone number, done.**

This is Partiful's entire growth engine and it must be Dawat's too. Every organiser shares a link. Every guest RSVPs from that link without installing anything. This drives adoption without requiring either party to convince the other to download an app first. It must work perfectly on Day 1 — on Safari, Chrome, and WhatsApp's in-app browser.

---

## 2. Philosophy & Brand

### 2.1 Core Belief

The infrastructure of community life shapes the community itself. When the tools Muslims use to gather are built with intention — with their values, their family structures, their rhythms of worship — the community becomes stronger for it.

We are not building a Muslim version of a Western app. We are building the platform that should have existed first.

### 2.2 Brand Voice

**Warm.** Not corporate. Not clinical. Not preachy. The tone of a trusted community member, not a tech company.

**Confident.** We know who we're for. We don't hedge or apologise for our specificity. Sisters-only mode is not an "optional filter" — it's a first-class feature on the main creation screen.

**Joyful.** Gathering is a celebration. The app should feel like an invitation, not a form.

**Dignified.** Islamic aesthetics are not decoration. They are identity. Every theme, every colour choice, every piece of copy should reflect the beauty and dignity of the tradition.

### 2.3 Brand Aesthetic

- **Dark-first UI.** Deep blacks (#0D0D0D background, #161616 cards) with gold (#C9A84C) as the primary accent. Feels premium, warm, and distinct from every other event app.
- **Islamic art themes** as the visual centrepiece — geometric patterns, arabesque, calligraphy-inspired typography, crescent motifs — rendered as CSS/SVG, not stock photos.
- **Typography:** Bold, confident. Large headings. Arabic script (دعوت) displayed alongside the English wordmark.
- **Micro-copy with soul.** Confirmation screens that say *"JazakAllah khair"*. Inshallah as a real RSVP option, not a joke. Prayer time warnings that feel helpful, not nannying.

### 2.4 What Makes Dawat Feel Different to Users

When a Muslim organiser first creates an event on Dawat and sees the gender mode selector as a prominent, first-class choice — not buried in settings — they will feel, perhaps for the first time, that a piece of software was built *for them*.

That feeling is the product.

---

## 3. Market Context

### 3.1 Target Markets (Phase 1)

| Market | Muslim Population | Key Cities |
|--------|------------------|------------|
| United States | ~5.9M | NYC, Chicago, Houston, Dallas, LA, Detroit |
| United Kingdom | ~3.9M | London, Birmingham, Manchester, Bradford |
| Canada | ~1.8M | Toronto, Vancouver, Calgary |
| Australia | ~813K | Sydney, Melbourne |

**Combined Phase 1 TAM: ~12.4 million Muslims** in highly concentrated urban communities — ideal for platform density.

### 3.2 Benchmark Comparisons

| Company | What they proved | Relevance |
|---------|-----------------|-----------|
| Partiful | $140M valuation, 500K MAU, Google's Best App 2024. Events apps can reach enormous scale quickly. | Direct product model |
| Muzz | YC-backed Muslim dating app, 10M members. Investors *will* fund Muslim-niche social apps. | Funding precedent |
| LaunchGood | $688M raised by Muslim users across 155 countries. The community has deep platform loyalty when built right. | Community trust model |

### 3.3 Why Now

Muslim tech investment is accelerating. The Islamic digital economy is growing at 20%+ annually. Muslim Gen Z and Millennials are the exact demographic that expects beautiful, mobile-first software — and currently has none for their community life. The gap is widening, not closing.

---

## 4. UX & Design Philosophy

### 4.1 The Partiful Lessons — What We Take Directly

Partiful is the best-designed social events app in existence. These elements are proven and should be implemented faithfully:

**Phone-number login only.** No username/password. A phone number is all you need. Everyone in a Muslim community is reachable by phone. No friction, no forgotten passwords.

**No-install RSVP.** The shareable link works in any browser. Guests don't need the app to respond. This is non-negotiable — it's the growth engine.

**Visual event poster as the centrepiece.** The event page *is* the invite. Beautiful by default. Shareable as an image. When the link lands on WhatsApp, the Islamic art theme renders as the preview image — making every shared link a piece of community marketing.

**Three-tap event creation.** Creating an event should be fast and feel *fun*. The creation flow is joyful, not bureaucratic.

**Bottom tab navigation (Home / Create / Profile).** Simple, thumb-friendly, nothing to learn.

**Text blast to guests.** Organisers can send updates directly to all confirmed attendees. Replaces the chaotic WhatsApp group.

**Pull to refresh, infinite scroll, fast loads.** The app must feel as smooth as Instagram. Every list interaction should be buttery.

### 4.2 Where Dawat Diverges — Our Differentiating UX

**Gender mode is a first-class UI element, not a setting.**
In Partiful, you create an event and it's just an event. In Dawat, the gender gathering type is a prominent visual selector in Step 4 of creation — a beautiful 2×2 grid with icons. This signals to every Muslim organiser immediately: *this app gets us*.

**Islamic visual identity in the theme library.**
Partiful's themes are pop culture (Charli XCX, Shrek, memes). Dawat's 20 MVP themes are: geometric Islamic patterns, Ramadan lantern aesthetics, calligraphy-inspired typography, Eid colour palettes, arabesque motifs, nikah elegance. When a sister screenshots the event poster for her WhatsApp status, it looks like it was made for her community — because it was.

**Family RSVP as an integrated flow.**
After tapping "Going", there's one soft prompt: *"Will you be bringing family members?"* — a simple +1, +2, +3 with optional names. Five seconds. Gives the organiser headcount data they've never had before without chasing people.

**Prayer time awareness — ambient, not preachy.**
When an organiser sets a time that overlaps Maghrib or Asr, a soft inline banner appears: *"Heads up — this overlaps Maghrib (6:42pm). Many guests may arrive 15 minutes late."* No lecture. Just useful. This is the detail that makes a Muslim user feel seen.

**Confirmation copy with barakah.**
When a guest confirms their RSVP: *"JazakAllah khair — you're going! 🤲"* — not "You're confirmed." One line. Costs nothing to build. Creates a moment of warmth no Western app will ever replicate authentically.

**Inshallah as a real RSVP status.**
Not a joke. Not a meme. A genuine third state that reflects how Muslims actually respond to invitations — willing but contingent on God's will. Generates a 24h nudge before the event: *"Still planning to come? Update your RSVP 🤲"*

**Event series for recurring community events.**
Partiful is designed for one-off parties. Muslim community life runs on recurring events — weekly halaqa, monthly sisters' circle, 30 nights of Tarawih. Dawat supports event series: create once, repeat with one tap, attendees auto-notified each time. This is a Phase 2 feature but the data model supports it from day one.

### 4.3 The Smoothness Standard

The app must feel like a native iPhone app — not a React Native app that "feels close". This means:

- **60fps scrolling everywhere.** Use `FlashList` instead of `FlatList`. Avoid unnecessary re-renders. Memoize aggressively.
- **Haptic feedback** on RSVP buttons, on publish, on share. Subtle. Intentional.
- **Skeleton loading screens** — never show a blank white flash or a spinner on a dark background.
- **Gesture-driven navigation** — swipe back always works. No screens that trap users.
- **Spring animations** on button state changes, on tab switches, on modal slides.
- **Image loading** with blur-up placeholders (thumbhash) — no jarring content pop-in.
- **Offline tolerance** — the event feed and individual event pages should be readable from cache when offline.

---

## 5. Feature Set — Full Roadmap

### 5.1 Phase 1 — MVP (Months 1–9, Web-first then native)

| Feature | Priority | What it does |
|---------|----------|-------------|
| Phone OTP auth | 🔴 MUST | Supabase phone auth, no passwords |
| Event creation — 4-step flow | 🔴 MUST | Theme → Basics → Details → Settings |
| Islamic art theme picker (20 themes) | 🔴 MUST | Pure CSS/SVG, no external images |
| Gender mode selector | 🔴 MUST | Mixed / Sisters / Brothers / Family — first-class UI |
| Yes / Inshallah / No RSVP | 🔴 MUST | Three-state with Islamic meaning |
| Shareable link — no app needed | 🔴 MUST | Next.js web RSVP page with OG preview |
| Family registration | 🔴 MUST | Children count + names on RSVP |
| Islamic calendar integration | 🔴 MUST | Hijri dates, prayer time warnings |
| Home feed with gender filter tabs | 🔴 MUST | Filter by gathering type |
| Organisation profile pages | 🔴 MUST | Masjids, schools, dawah orgs |
| Follow / unfollow organisations | 🔴 MUST | Distribution moat — followers get notified |
| Push notifications | 🔴 MUST | Free via Expo/Firebase |
| WhatsApp notifications | 🔴 MUST | Via 360dialog (not Twilio — see Section 12) |
| Halal venue tagging | 🔴 MUST | Is_halal_venue flag + display badge |
| Publish + shareable link flow | 🔴 MUST | Confetti, copy link, WhatsApp share button |
| OG image generation | 🔴 MUST | Islamic theme as WhatsApp/iMessage preview |
| QR code for event | 🟡 SHOULD | Organiser shares for check-in at door |
| Trending feed | 🟡 SHOULD | Sorted by RSVP velocity last 24h |
| Halal spots discovery | 🟡 SHOULD | Near-me restaurant/venue cards |
| Scholar talks section | 🟡 SHOULD | Urgency badges, filtered section |
| Masjid Pro plan (paid) | 🟡 SHOULD | $49–99/mo subscription |
| Stripe ticket payments | 🟡 SHOULD | 2.5% platform fee |
| Ethnic community filters | 🟢 NICE | South Asian, Arab, Somali, etc. |
| ID verification | 🟢 NICE | Stripe Identity — Post-MVP |
| Family child sub-profiles | 🟢 NICE | Named children per family account |

### 5.2 Phase 2 — Growth (Months 10–18)

| Feature | What it does |
|---------|-------------|
| iOS + Android native apps | Expo → compiled native builds |
| Event feed & social discovery | Events from followed orgs + friends attending |
| Post-event photo sharing | Gender-aware galleries, memory layer |
| Community wall on org pages | Structured announcements + polls |
| Friend connections | See who you know is going — gender-privacy-aware |
| Event series builder | Create once, repeat, auto-notify |
| Organiser analytics dashboard | Attendance trends, repeat rate, demographics |
| Sadaqah / donation button | Per-event giving with Dawat processing fee |
| Inshallah nudge automation | 24h before event SMS to maybe RSVPs |

### 5.3 Phase 3 — Platform (Year 2–4)

| Feature | What it does |
|---------|-------------|
| Halal vendor marketplace | Caterers, photographers, décor — 10–15% commission |
| Venue directory | Halal-certified, wudu facilities, gender-flexible |
| Masjid CRM | Full membership + attendance management |
| Ramadan hub | 30-day event series, iftar capacity, Tarawih management |
| Dawah campaign tools | Multi-event educational series with landing pages |
| API for masjid apps | Embed Dawat event engine in branded org apps |
| Multi-language support | Arabic, Urdu, French, Bahasa |
| Hajj & Umrah group tools | Travel coordination, rooming, shared itineraries |

---

## 6. MVP Scope & Sprint Plan

### 6.1 Build Order

| Sprint | Section | What You Build | Time |
|--------|---------|----------------|------|
| 1 | Sec 8, 14 | Project setup, Supabase tables, auth, navigation shell | Week 1 |
| 2 | Sec 9.3, 10 | Event creation — 4-step flow with Islamic themes | Week 2 |
| 3 | Sec 11 | RSVP system — Yes/Inshallah/No + shareable links | Week 3 |
| 4 | Sec 9.2 | Home feed, gender filter tabs, event cards | Week 4 |
| 5 | Sec 9.5 | Trending feed, halal spots, scholar discovery | Week 5 |
| 6 | Sec 9.6 | Masjid community pages | Week 6 |
| 7 | Sec 12 | Notifications: push + WhatsApp Business API + email | Week 7 |
| 8 | Sec 13 | Payments, QR check-in, polish, App Store submission | Week 8 |

### 6.2 Weekly Milestones

**Week 1 ✅** — User can sign up with phone number and see an empty home screen

**Week 2 ✅** — Can create a themed event and get a shareable link

**Week 3 ✅** — Guests can RSVP from a link with no app download. Islamic theme shows in WhatsApp preview.

**Week 4 ✅** — Home feed shows real events, gender filter tabs work

**Week 5 ✅** — Trending tab functional with real data

**Week 6 ✅** — Masjids have profile pages with follower counts

**Week 7 ✅** — Users receive WhatsApp reminders and push notifications

**Week 8 ✅** — Paid ticketing works. App Store submitted.

---

## 7. Tech Stack

### 7.1 Full Stack

| Layer | Technology | Why | Monthly Cost |
|-------|-----------|-----|-------------|
| Mobile App | React Native + Expo SDK 51 | One codebase, iOS + Android, smooth native feel | Free |
| Web RSVP Pages | Next.js 14 + Vercel | Shareable links, no app install, OG images | Free tier |
| Database + Auth | Supabase (PostgreSQL) | Auth, real-time, storage, Row Level Security | Free → $25/mo |
| Animation | React Native Reanimated 3 | Buttery 60fps animations and gestures | Free |
| List Performance | FlashList (Shopify) | 10× faster than FlatList for event feeds | Free |
| State Management | Zustand | Lightweight global state, no boilerplate | Free |
| Navigation | Expo Router | File-based routing, deep linking built-in | Free |
| Push Notifications | Expo Notifications + Firebase FCM | iOS + Android push, free | Free |
| WhatsApp Business | 360dialog → Meta API | $50–100/mo flat + ~$0.03–0.06/conversation | $50–150/mo |
| Email | Resend | Transactional email, generous free tier | Free → $20/mo |
| Payments | Stripe | Tickets + subscriptions, Connect for payouts | 2.9% + 30c |
| Maps | Google Maps API | Venue search, directions | $200/mo free credit |
| OG Images | @vercel/og | Edge-rendered Islamic theme previews | Free |
| Analytics | PostHog | Funnels, retention, free self-host option | Free tier |
| Error Monitoring | Sentry | Crash reporting, free tier | Free |

### 7.2 Why These Choices

**React Native + Expo over Flutter:** The web RSVP page (Next.js) and the mobile app share TypeScript types and Supabase client code. Expo's managed workflow handles native builds without requiring Xcode knowledge. The smoothness gap vs Flutter is minimal with Reanimated 3.

**Supabase over Firebase:** PostgreSQL means proper relational queries (events JOIN rsvps JOIN organisations). Row Level Security handles privacy rules (gender-mode event visibility) at the database layer — not in application code where it can be bypassed.

**360dialog over Twilio for WhatsApp:** Twilio charges per message. 360dialog gives you direct access to Meta's WhatsApp Business API at per-conversation pricing (~$0.03–0.06/24h window regardless of message count). At scale this is 5–10× cheaper than Twilio for WhatsApp.

**Resend over SendGrid:** Cleaner API, React Email templates, generous free tier, better deliverability. Email is a fallback channel for Dawat, not primary — so cost and simplicity win.

### 7.3 Folder Structure

```
dawat/
  app/
    (auth)/
      login.tsx           # Phone number entry
      otp.tsx             # 6-digit OTP verification
      onboarding.tsx      # Profile setup (new users only)
    (tabs)/
      index.tsx           # Home feed
      trending.tsx        # Trending events
      create.tsx          # Create event entry point
      events.tsx          # My events (attending + hosting)
      profile.tsx         # User profile
    event/
      [id].tsx            # Event detail screen
    org/
      [id].tsx            # Organisation/masjid page
    create/
      step1-theme.tsx     # Theme picker
      step2-basics.tsx    # Title, host, description
      step3-details.tsx   # Date, location, price
      step4-settings.tsx  # Gender mode, ID req, location hide
      success.tsx         # Confetti + share screen
  components/
    EventCard.tsx         # Feed card component
    GenderBadge.tsx       # Sisters/Brothers/Mixed/Family pill
    RsvpButtons.tsx       # Yes / Inshallah / No
    ThemePicker.tsx       # Full-screen theme selection modal
    HalalBadge.tsx        # Green halal-certified badge
    SkeletonCard.tsx      # Loading placeholder
    OrgCard.tsx           # Organisation tile
    PrayerTimeWarning.tsx # Inline scheduling warning
  lib/
    supabase.ts           # Supabase client + typed helpers
    stripe.ts             # Stripe client
    whatsapp.ts           # 360dialog WhatsApp API
    email.ts              # Resend email client
    themes.ts             # All 20 Islamic themes
    prayer-times.ts       # Prayer time calculation (adhan.js)
    slugify.ts            # Slug generation for event URLs
  store/
    useEventStore.ts      # Event creation state
    useAuthStore.ts       # Current user state
    useFeedStore.ts       # Gender filter, feed pagination
  types/
    index.ts              # All shared TypeScript interfaces
  web/                    # Next.js app (separate deployment)
    app/
      e/[slug]/page.tsx   # Public RSVP page
      api/og/[themeId]/route.ts  # OG image generation
```

### 7.4 Environment Variables

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WhatsApp (360dialog)
THREESIXTY_DIALOG_API_KEY=xxxx
THREESIXTY_DIALOG_PHONE_NUMBER_ID=xxxx

# Email (Resend)
RESEND_API_KEY=re_xxxx

# Maps
EXPO_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...

# App
EXPO_PUBLIC_APP_URL=https://dawatapp.com
EXPO_PUBLIC_APP_ENV=production
```

### 7.5 Setup Commands

```bash
npx create-expo-app dawat --template tabs
cd dawat
npx expo install expo-router expo-constants expo-linking expo-haptics
npx expo install @supabase/supabase-js
npx expo install zustand
npx expo install stripe-react-native
npx expo install expo-notifications expo-device
npx expo install react-native-reanimated
npm install @shopify/flash-list
npm install adhan                    # Prayer time calculations
npm install date-fns                 # Date formatting
npm install react-native-confetti-cannon

# Web (separate Next.js app)
npx create-next-app@latest dawat-web
cd dawat-web
npm install @supabase/supabase-js @vercel/og resend
```

---

## 8. Database Schema

> All tables live in Supabase (PostgreSQL). Apply Row Level Security policies after creating tables.

### 8.1 users

```sql
CREATE TABLE users (
  id              uuid         PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username        text         UNIQUE NOT NULL,          -- e.g. @amira_dallas
  display_name    text         NOT NULL,
  phone           text         UNIQUE,                   -- Verified via OTP
  avatar_url      text,                                  -- Supabase storage URL
  gender          text         CHECK (gender IN ('male','female','prefer_not_say')),
  gender_pref     text         DEFAULT 'all'             -- Feed filter preference
                               CHECK (gender_pref IN ('all','sisters_only','brothers_only','family')),
  is_id_verified  boolean      DEFAULT false,
  location_city   text,                                  -- e.g. "London, UK"
  location_lat    float8,
  location_lng    float8,
  is_masjid_admin boolean      DEFAULT false,
  push_token      text,                                  -- Expo push token
  whatsapp_opt_in boolean      DEFAULT true,
  created_at      timestamptz  DEFAULT now()
);
```

### 8.2 events

```sql
CREATE TABLE events (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text         NOT NULL,
  description        text,
  org_id             uuid         REFERENCES organisations(id),   -- nullable
  host_id            uuid         NOT NULL REFERENCES users(id),
  theme_id           text         NOT NULL,                       -- maps to themes.ts
  theme_custom_url   text,                                        -- user-uploaded image
  gender_mode        text         NOT NULL DEFAULT 'mixed'
                                  CHECK (gender_mode IN ('mixed','sisters_only','brothers_only','family')),
  is_id_required     boolean      DEFAULT false,
  date_time          timestamptz,
  date_tbd           boolean      DEFAULT false,
  hijri_date         text,                                        -- Display only, e.g. "15 Ramadan 1447"
  location_name      text,
  location_address   text,
  location_lat       float8,
  location_lng       float8,
  is_location_hidden boolean      DEFAULT false,                  -- Reveal on confirmed RSVP only
  price              integer      DEFAULT 0,                      -- In cents/pence. 0 = free
  capacity           integer,                                     -- NULL = unlimited
  is_halal_venue     boolean      DEFAULT false,
  prayer_info        text,                                        -- e.g. "Maghrib: 6:42 PM"
  custom_tags        text[],                                      -- e.g. ['Hifz', 'Sisters 16+']
  slug               text         UNIQUE NOT NULL,                -- URL slug
  is_published       boolean      DEFAULT false,
  is_cancelled       boolean      DEFAULT false,
  stripe_account_id  text,                                        -- For paid events
  created_at         timestamptz  DEFAULT now(),
  updated_at         timestamptz  DEFAULT now()
);

-- Index for feed queries
CREATE INDEX idx_events_date ON events(date_time ASC) WHERE is_published = true AND is_cancelled = false;
CREATE INDEX idx_events_gender ON events(gender_mode) WHERE is_published = true;
CREATE INDEX idx_events_org ON events(org_id) WHERE is_published = true;
CREATE INDEX idx_events_slug ON events(slug);
```

### 8.3 rsvps

```sql
CREATE TABLE rsvps (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id        uuid        REFERENCES users(id),           -- NULL for guest RSVPs
  guest_phone    text,                                       -- For no-account RSVPs
  guest_name     text,
  status         text        NOT NULL
                             CHECK (status IN ('yes','inshallah','no')),
  children_count integer     DEFAULT 0,                      -- Family events
  children_names text[],                                     -- Optional child names
  checked_in     boolean     DEFAULT false,                  -- QR scan at door
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),

  -- A user or phone can only have one RSVP per event
  UNIQUE(event_id, user_id),
  UNIQUE(event_id, guest_phone)
);

CREATE INDEX idx_rsvps_event ON rsvps(event_id);
CREATE INDEX idx_rsvps_user ON rsvps(user_id);
```

### 8.4 organisations

```sql
CREATE TABLE organisations (
  id                 uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text    NOT NULL,                      -- e.g. "Islamic Center of Dallas"
  handle             text    UNIQUE NOT NULL,               -- e.g. "icd_dallas"
  type               text    CHECK (type IN ('masjid','school','dawah','community','other')),
  description        text,
  logo_url           text,
  cover_url          text,
  location_city      text,
  location_address   text,
  website            text,
  instagram_handle   text,
  is_verified        boolean DEFAULT false,                 -- Manual admin verification
  plan               text    DEFAULT 'free'
                             CHECK (plan IN ('free','starter','pro','enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at         timestamptz DEFAULT now()
);
```

### 8.5 org_members

```sql
CREATE TABLE org_members (
  org_id     uuid        NOT NULL REFERENCES organisations(id),
  user_id    uuid        NOT NULL REFERENCES users(id),
  role       text        DEFAULT 'admin' CHECK (role IN ('admin','editor','viewer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);
```

### 8.6 org_followers

```sql
CREATE TABLE org_followers (
  org_id     uuid        NOT NULL REFERENCES organisations(id),
  user_id    uuid        NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);
```

### 8.7 halal_spots

```sql
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

CREATE INDEX idx_halal_spots_location ON halal_spots USING gist(point(lng, lat));
```

### 8.8 notifications

```sql
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
```

### 8.9 Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE halal_spots ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can read any profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- EVENTS: Published events are public
CREATE POLICY "Published events are public" ON events FOR SELECT
  USING (is_published = true AND is_cancelled = false);
CREATE POLICY "Hosts manage their events" ON events FOR ALL
  USING (host_id = auth.uid());

-- RSVPS: Guests can create, users see own
CREATE POLICY "Anyone can create RSVP" ON rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Users see own RSVPs" ON rsvps FOR SELECT
  USING (user_id = auth.uid() OR guest_phone IS NOT NULL);
CREATE POLICY "Event hosts see all RSVPs" ON rsvps FOR SELECT
  USING (EXISTS (SELECT 1 FROM events WHERE id = event_id AND host_id = auth.uid()));

-- ORGANISATIONS: Public read
CREATE POLICY "Anyone reads orgs" ON organisations FOR SELECT USING (true);
CREATE POLICY "Org admins manage org" ON organisations FOR ALL
  USING (EXISTS (SELECT 1 FROM org_members WHERE org_id = id AND user_id = auth.uid()));

-- HALAL SPOTS: Public read, authenticated create
CREATE POLICY "Anyone reads halal spots" ON halal_spots FOR SELECT USING (true);
CREATE POLICY "Authenticated users add spots" ON halal_spots FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

---

## 9. Screen-by-Screen Specs

### 9.1 Auth Screens

**Phone Login:**
- Large phone number input with country code flag picker (react-native-phone-number-input)
- "Continue" button — disabled until valid number entered
- Below: "By continuing, you agree to our Terms & Privacy Policy"

**OTP Verification:**
- 6-digit auto-advancing input (react-native-otp-textinput)
- Resend code countdown timer (60s)
- Supabase `verifyOtp()` on 6th digit entered automatically

**Profile Setup (new users only — shown once):**
- Display name input (autofocus)
- Username input (auto-suggested from name, uniqueness checked live)
- Gender selector: Male / Female / Prefer not to say (required for gender-mode events)
- City search: Google Places Autocomplete, stores lat/lng
- Profile photo: camera or gallery (Expo ImagePicker → Supabase Storage)
- Feed preference: All Events / Sisters / Brothers / Family (sets default feed filter)
- `Complete Profile` button → home feed

### 9.2 Home Feed (`tabs/index.tsx`)

**Header:**
- Left: `DAWAT دعوت` wordmark (gold + white)
- Centre: City pill (e.g. "📍 London") — tap to change city
- Right: Bell icon with unread badge

**Gender Filter Tabs:**
```
[ All Events ] [ 🟦 Brothers ] [ 🌸 Sisters ] [ 👨‍👩‍👧 Family ]
```
- Active tab: gold gradient background, dark text, spring animation on switch
- State: Zustand `useFeedStore`, persisted to AsyncStorage
- Filtering logic: `sisters_only` tab shows only `gender_mode = 'sisters_only'` events. `All` shows `mixed` + all gender modes.

**Halal Spots Row:**
- Section title: `🔥 Halal Spots Near You` + `See all →`
- Horizontal scroll, 130px wide cards
- Card: emoji banner (80px), spot name, distance, type badge
- Badge: `✅ HALAL CERT` (green) or `🔥 {X} check-ins`
- Query: nearest 8 from `halal_spots` ordered by distance

**Events Feed:**
- `FlashList` with `EventCard` components (see below)
- Filtered by active gender tab
- Sorted by `date_time` ascending (soonest first)
- Pull-to-refresh, infinite scroll (20 per page, keyset pagination)
- Skeleton cards while loading (3 placeholder cards, shimmer animation)

**EventCard Component:**
- 90px theme banner: CSS gradient + central 40px emoji
- `Only {X} spots left!` red badge if `capacity - yes_count < 20`
- Title: 15px bold white
- Org name: 11px gold (tappable → org page)
- Meta row: date, location, price — 11px muted grey
- Tags: GenderBadge + `✓ ID Verified` badge (if required) + 1 custom tag
- Bottom row: 4 overlapping avatar circles + `{N} going` + RSVP state indicator
- Entire card is pressable → event detail (spring scale: 0.97 on press)

### 9.3 Create Event — 4-Step Flow

**Progress indicator:** 4 gold dots at top, animated fill as user advances. Step label underneath.

#### Step 1: Theme Picker (`create/step1-theme.tsx`)

```
Header: "Choose a theme"

Category pills (horizontal scroll):
  Trending | Ramadan | Eid | Sisters | Brothers | Family |
  Nikah | Iftar | Scholars | Minimal | Eclectic

3-column grid: portrait cards (aspect ratio 0.72)
  Each card: theme rendered as CSS background-gradient
  Selected: 2px gold border + white ✓ badge (top-right corner)

Live preview: small event card preview at bottom updates in real-time

Sticky bottom: "Use This Theme →" button (gold, full width)
```

#### Step 2: Event Basics (`create/step2-basics.tsx`)

```
"Name your event"
  Input: 20px font, autofocus
  Placeholder: "Eid Gala, Sisters Halaqa, Nikah Walima..."
  Character limit: 60

"Hosting as"
  Input: org search (if org admin) or personal name
  Placeholder: "Islamic Center of Dallas, or your name"

"Description"
  Textarea, max 500 chars with live counter
  Placeholder: "What's happening? Include any important details..."

Continue: disabled until title ≥ 2 chars + host ≥ 2 chars
```

#### Step 3: Date, Location, Price (`create/step3-details.tsx`)

```
"When is it?"
  Date picker (native DateTimePicker)
  Time picker
  "Date TBD" toggle — disables date/time fields when on

"Prayer time check" — inline component:
  On date/time change → calculate prayer times for city (adhan.js)
  If event overlaps prayer window by ≥15min:
    Show: "⚠️ This overlaps Maghrib (6:42 PM). Many guests may arrive late."

"Where?"
  Google Places Autocomplete
  Stores: location_name, location_address, lat, lng
  "Hide address from non-RSVPs" toggle (is_location_hidden)

"Halal venue?"
  Toggle: "This is a halal-certified venue"
  Shows green HALAL badge on event card when on

"How much?"
  Price pills: Free | £10 | £25 | £45 | £100 | Custom
  Custom → number input
  Free = price 0

"How many spots?"
  Optional number input — leave empty for unlimited
  Shows capacity progress bar on event card when set

Continue: disabled until location filled
```

#### Step 4: Settings (`create/step4-settings.tsx`)

```
"Who's this gathering for?"

2×2 grid (full-width cards):

  ┌──────────────────┬──────────────────┐
  │   🌟 Mixed       │  🌸 Sisters Only  │
  │  Open to all     │  Women only       │
  ├──────────────────┼──────────────────┤
  │  💪 Brothers     │  👨‍👩‍👧 Family      │
  │  Men only        │  Parents + kids   │
  └──────────────────┴──────────────────┘

Selected: gold border + checkmark
Sisters/Brothers: shows note "ID verification recommended"

"Require ID verification?"
  Toggle: guests must verify government ID via Stripe Identity
  Recommended for gender-only events

Preview card: renders EventCard with all entered details

"🚀 Publish Event" (gold button, full width)
  → Inserts to events table
  → Generates slug
  → Navigates to Success screen
```

#### Publish Success Screen

```
Full-screen:
  Confetti cannon (react-native-confetti-cannon, gold + white)
  Large: "You're live! 🎉"
  Subtext: "Your event is ready to share"

  Event link box:
    dawatapp.com/e/eid-gala-k3x9p
    [📋 Copy Link] button

  [📲 Share to WhatsApp] — opens WhatsApp pre-filled with link
  [View Event Page →] — navigates to event/[id]

  "JazakAllah khair for using Dawat 🤲" — bottom caption
```

### 9.4 Event Detail (`event/[id].tsx`)

```
Back button (gold chevron) + Share icon (top right)

Event Banner (160px):
  Theme gradient + 56px emoji centred
  GenderBadge (bottom-left)
  "✓ ID Required" badge (bottom-right, if applicable)
  Halal venue badge (green, if applicable)

Event Body:
  Title: 22px bold white
  Org name: 13px gold (tappable)
  Attendance: "{X} confirmed · {Y} Inshallah" + capacity bar (if capped)

Info card (dark card, 12px icons):
  📅 {day}, {Gregorian date} · {Hijri date}
  ⏰ {time} — {end time if set}
  📍 {location name} — {address OR "Address revealed on RSVP"}
  💷 {price OR "Free"}
  🙏 Prayer times: Maghrib {time} · Isha {time}
  ✅ Halal venue (if applicable)

Description text (14px, collapsible at 4 lines)

─────────────────────────────────
Will you be attending?

  ✅ Yes!      🤲 Inshallah    ❌ Can't Go
  (green)       (gold)          (red/muted)

On "Yes" → prompt "Add to Calendar?" (Expo Calendar)
On "Inshallah" → toast "We'll remind you 24h before 🤲"
─────────────────────────────────

Guest list preview (if host):
  4 overlapping avatars + "{N} confirmed, {M} Inshallah"
  Tap → full guest list (host only)
```

### 9.5 Trending (`tabs/trending.tsx`)

```
Header: "Trending in {City}"

Ethnic filter pills (horizontal scroll):
  All | South Asian | Arab | Somali | West African | Turkish | Iranian | Other

Events list (sorted by RSVP velocity: RSVPs added in last 24h):
  Rank circle (gold, bold number) + theme emoji + name + org + date
  Right: "{N} going" or "🔥 Filling fast"

Scholar Talks section:
  Title: "📚 Scholar Talks"
  Cards: speaker avatar + name + topic + urgency badge ("12 spots left", "Early bird")
```

### 9.6 Organisation Page (`org/[id].tsx`)

```
Cover banner (200px, org cover image or gradient)
Logo circle (80px, white border, overlaid bottom-centre of banner)
Org name (20px bold) + handle (grey) + ✓ verified badge (gold)

Stats row: {X} Followers | {Y} Events

[Follow] / [Following ✓] button

Description text

Upcoming Events tab | Past Events tab
  → EventCard list filtered by org_id
```

### 9.7 My Events (`tabs/events.tsx`)

```
"Attending" section:
  RSVPs where status = 'yes' or 'inshallah'
  Sorted by date_time ascending

"Hosting" section:
  Events where host_id = current user
  Shows RSVP count on each card

Empty states:
  Attending: "No events yet — explore what's on ✨"
  Hosting: "Share your first event → Create"
```

### 9.8 Profile (`tabs/profile.tsx`)

```
Avatar (72px, round) + display name + @username
Gold "✓ Verified" badge (if ID verified)

Stats row: {Going} | {Inshallah} | {Hosted}

Settings list:
  My RSVPs
  My Community (followed orgs)
  Host an Event
  Gender Preference (feed filter)
  Notifications
  Privacy & Safety
  Help & Support
  Log Out
```

---

## 10. Islamic Theme System

### 10.1 Theme Interface

```typescript
// lib/themes.ts
export interface DawatTheme {
  id: string;              // 'ramadan_kareem'
  name: string;            // 'Ramadan Kareem'
  categories: string[];    // ['Trending', 'Ramadan']
  bannerBg: string;        // CSS background-color
  bannerBgImage: string;   // CSS background-image (gradient or SVG pattern)
  bannerBgSize?: string;   // CSS background-size
  accentColor: string;     // Org name + highlights e.g. '#C9A84C'
  textColor: string;       // Main text colour
  tagBg: string;           // Tag background
  tagColor: string;        // Tag text
  defaultEmoji: string;    // Default event emoji
}
```

### 10.2 All 20 MVP Themes

| Theme ID | Name | Categories | Visual |
|----------|------|-----------|--------|
| `ramadan_kareem` | Ramadan Kareem | Trending, Ramadan | Navy starfield, gold crescent, Arabic text |
| `eid_gala` | Eid Gala | Trending, Eid | Black/gold geometric star, formal |
| `iftar_party` | Iftar Party | Trending, Iftar | Amber lantern glow, terracotta warmth |
| `sisters_halaqa` | Sisters Halaqa | Sisters, Trending | Deep rose, arabesque star, purple tones |
| `nikah` | Nikah Invitation | Nikah, Elegant | Ivory parchment, gold ornaments, bismillah |
| `masjid_event` | Masjid Event | Community, Trending | Emerald tile grid, dome silhouette |
| `arabic_nights` | Arabic Nights | Trending, Elegant | Dark gold geometric repeat, arabesque |
| `desert_sunset` | Desert Sunset | Eclectic, Trending | Dusk gradient, palm + camel silhouette |
| `brothers_night` | Brothers Night | Brothers | Electric blue hex star, deep navy |
| `laylatul_qadr` | Laylatul Qadr | Ramadan, Elegant | Purple starfield, Night of Power |
| `family_picnic` | Family Picnic | Family, Community | Warm earth, grass silhouette, joyful |
| `scholar_talk` | Scholar Talk | Scholars, Community | Forest green, open book, formal |
| `geometric_blue` | Geometric Blue | Elegant, Minimal | Deep navy nested hexagons, modernist |
| `islamic_stars` | Islamic Stars | Elegant, Eid | Infinite 8-point star tile on black |
| `walima` | Walima | Nikah, Elegant | Rose arch, crescent, deep burgundy |
| `hajj_journey` | Hajj Journey | Community, Scholars | Kaaba silhouette, tawaf circles, sacred gold |
| `minimal_crescent` | Minimal Crescent | Minimal, Elegant | Ivory, bold black crescent, typographic |
| `eid_adha` | Eid ul-Adha | Eid, Family | Forest green, Hijri date, celebratory |
| `dark_ramadan` | Dark Ramadan | Ramadan, Eclectic | Midnight purple, starfield, atmospheric |
| `ornate_invitation` | Ornate Invitation | Elegant, Nikah | Cream manuscript, gold filigree corners |

---

## 11. Shareable RSVP Link System

> This is the most critical technical feature. It must work before anything else is polished.

### 11.1 URL Structure

```
dawatapp.com/e/eid-gala-dallas-k3x9p
              └─ event slug (title + random 5 chars)
```

### 11.2 Slug Generation

```typescript
// lib/slugify.ts
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // strip non-alphanumeric
    .replace(/\s+/g, '-')           // spaces to hyphens
    .slice(0, 40);                  // max 40 chars
  const suffix = Math.random().toString(36).slice(2, 7); // 5-char random
  return `${base}-${suffix}`;
  // 'eid-gala-dallas-k3x9p'
}
```

### 11.3 Web RSVP Page (`/e/[slug]` — Next.js)

```
On load:
  Fetch event by slug (public Supabase query, no auth)
  Render event banner using theme CSS
  Show: title, org, date/time, Hijri date, description
  Show: going count + Inshallah count

If is_location_hidden:
  Show "📍 Address revealed after RSVP" until confirmed

RSVP flow:
  1. Name input + phone number input
  2. Yes / Inshallah / No buttons
  3. Submit → Supabase phone OTP
  4. OTP verified → upsert rsvps table (guest_phone)
  5. Show: "JazakAllah khair! You're going 🤲"
  6. If is_location_hidden: reveal full address
  7. Prompt: "Open in the Dawat app →" (smart app banner)

Family mode (if gender_mode = 'family'):
  After RSVP status: "Bringing family?"
  +/- counter for children, optional name fields
```

### 11.4 OG Meta Tags (WhatsApp/iMessage Preview)

```tsx
// app/e/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const event = await getEventBySlug(params.slug);
  return {
    title: event.title,
    description: `${event.yes_count} going · ${formatDate(event.date_time)}`,
    openGraph: {
      title: event.title,
      description: `${event.yes_count} going · ${formatDate(event.date_time)}`,
      images: [{
        url: `https://dawatapp.com/api/og/${event.theme_id}?title=${encodeURIComponent(event.title)}`,
        width: 1200,
        height: 630,
      }],
      url: `https://dawatapp.com/e/${event.slug}`,
    },
  };
}
```

### 11.5 OG Image Generation (Vercel Edge)

```typescript
// app/api/og/[themeId]/route.ts
// Uses @vercel/og to render each theme as a 1200×630 image
// When the link is shared on WhatsApp, the Islamic art theme
// appears as the full preview image — every shared link is a poster
//
// Tell Claude: "Build this OG image route using @vercel/og.
// It receives theme_id and title as query params.
// Render the theme CSS background with the event title centred in
// the Dawat typography style. Return as PNG."
```

---

## 12. Notification & Messaging System

### 12.1 Channel Priority

```
Primary:    Push notifications (Expo FCM — free, instant)
Secondary:  WhatsApp Business API (via 360dialog — cheap, high open rate)
Fallback:   Email via Resend (near-free, deliverability backstop)
NOT USED:   Twilio SMS for primary messaging (expensive at scale)
```

**Why 360dialog over Twilio:** 360dialog charges per 24-hour conversation window (~$0.03–0.06), not per message. If an organiser sends 3 reminder messages to a guest, that's one conversation = one charge. Twilio SMS charges per message in most regions ($0.008–0.04/each). At scale, 360dialog is 5–10× cheaper for WhatsApp.

### 12.2 Notification Types & Triggers

| Type | Trigger | Channel | Message |
|------|---------|---------|---------|
| RSVP confirmation | Guest RSVPs | Push + WhatsApp | "You're going to {Event}! {date} at {location}" |
| Inshallah nudge | 24h before, status = inshallah | Push | "Still planning to come? Update your RSVP 🤲" |
| Reminder 48h | 48h before event | Push + WhatsApp | "{Event} is tomorrow! {time} at {location}" |
| Reminder 2h | 2h before event | Push | "{Event} starts in 2 hours! See you there 🌙" |
| Text blast | Organiser sends update | WhatsApp (confirmed RSVPs) | Custom organiser message |
| New org event | Org publishes event | Push (followers) | "{Org} just posted: {event title}" |
| New follower | User follows org | Push (org admin) | "{name} is now following your page" |

### 12.3 WhatsApp Integration (360dialog)

```typescript
// lib/whatsapp.ts
const THREESIXTY_BASE = 'https://waba.360dialog.io/v1';

export async function sendWhatsApp(to: string, message: string) {
  const response = await fetch(`${THREESIXTY_BASE}/messages`, {
    method: 'POST',
    headers: {
      'D360-API-KEY': process.env.THREESIXTY_DIALOG_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''), // strip non-digits
      type: 'text',
      text: { body: message },
    }),
  });
  return response.json();
}
```

### 12.4 Push Notifications (Expo)

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';

export async function registerForPushNotifications(userId: string) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync();

  // Store token in users table
  await supabase
    .from('users')
    .update({ push_token: token.data })
    .eq('id', userId);
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: expoPushToken, title, body, sound: 'default' }),
  });
}
```

### 12.5 Scheduled Reminders (Supabase Edge Functions + pg_cron)

```sql
-- Runs every hour
SELECT cron.schedule(
  'event-reminders',
  '0 * * * *',
  $$ SELECT send_event_reminders(); $$
);
```

```typescript
// supabase/functions/send-event-reminders/index.ts
// Tell Claude: "Build a Supabase Edge Function called send-event-reminders.
// It should:
// 1. Query events happening in the next 48h and 2h windows
// 2. Get all confirmed RSVPs for those events
// 3. Send push notifications via Expo push API
// 4. Send WhatsApp reminders via 360dialog for guests without app
// 5. Log each notification to the notifications table
// 6. Skip if notification was already sent (check notifications table)"
```

### 12.6 Email (Resend — Fallback)

```typescript
// lib/email.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRsvpConfirmation(to: string, eventTitle: string, eventDate: string) {
  await resend.emails.send({
    from: 'Dawat <events@dawatapp.com>',
    to,
    subject: `You're going to ${eventTitle}! 🌙`,
    react: RsvpConfirmationEmail({ eventTitle, eventDate }), // React Email template
  });
}
```

---

## 13. Payments & Monetisation

### 13.1 Revenue Model Summary

| Stream | When | How |
|--------|------|-----|
| Masjid Pro subscriptions | MVP | $49–99/mo via Stripe |
| Ticket platform fee | MVP | 2.5% of ticket sales |
| Sadaqah processing | Phase 2 | 1.5% of donations |
| Halal vendor marketplace | Phase 3 | 10–15% commission |

### 13.2 Masjid Subscription Plans

| Plan | Price/mo | Events | RSVP limit | Key Features |
|------|----------|--------|-----------|--------------|
| Free | $0 | 10 | 50/event | Basic page, share link, RSVP tracking |
| Starter | $49 | 50 | 500/event | Community page, follower notifications, analytics |
| Pro | $99 | Unlimited | Unlimited | WhatsApp blasts, donations, QR check-in, priority listing |
| Enterprise | $199 | Unlimited | Unlimited | Multi-branch, API access, custom domain |

> **Important:** Direct masjids to sign up via the web dashboard (dawatapp.com/orgs), not in-app purchase. This avoids Apple's 30% cut entirely.

### 13.3 Ticket Sales Flow

```
1. Guest RSVPs to paid event (price > 0)
2. App shows Stripe payment sheet (stripe-react-native)
3. Payment succeeds → create RSVP with status = 'yes'
4. Send ticket confirmation with QR code (Push + email)
5. At door: organiser opens Dawat app → scan guest QR → checked_in = true
```

### 13.4 Stripe Connect (Organiser Payouts)

```
Dawat platform fee: 2.5% on all ticket sales
Organisers onboard via Stripe Connect Express
Funds transfer to organiser's bank T+2 after event

Flow:
  Organiser clicks "Enable Payments" in org settings
  → Redirect to Stripe Connect Express onboarding
  → On return, store stripe_account_id on organisation record
  → All future ticket charges use destination_charge to org account
```

### 13.5 Supabase Queries

```typescript
// Fetch home feed
const { data } = await supabase
  .from('events')
  .select(`
    *,
    organisations(name, logo_url, is_verified, handle),
    rsvps(count)
  `)
  .eq('is_published', true)
  .eq('is_cancelled', false)
  .gte('date_time', new Date().toISOString())
  .in('gender_mode', genderFilter) // ['mixed'], ['sisters_only'], etc.
  .order('date_time', { ascending: true })
  .range(page * 20, (page + 1) * 20 - 1);

// RSVP upsert (logged-in user)
await supabase
  .from('rsvps')
  .upsert({
    event_id, user_id: user.id, status, children_count, children_names
  }, { onConflict: 'event_id,user_id' });

// Guest RSVP (no account)
await supabase
  .from('rsvps')
  .upsert({
    event_id, guest_phone, guest_name, status,
    user_id: null
  }, { onConflict: 'event_id,guest_phone' });

// Trending events (RPC)
await supabase.rpc('get_trending_events', {
  user_lat: lat, user_lng: lng, radius_km: 50
});
// SQL: Orders events by RSVP count added in last 24h

// Follow org
await supabase
  .from('org_followers')
  .upsert({ org_id, user_id: user.id });
```

---

## 14. Authentication & Users

### 14.1 Auth Flow

```
App launch
  ├─ Has session? → Home feed
  └─ No session → Login screen

Login screen
  └─ Phone input → Continue
       └─ Supabase sendOtp()
            └─ OTP screen (6 digits)
                 └─ Supabase verifyOtp()
                      ├─ Existing user → Home feed
                      └─ New user → Onboarding screen
                                       └─ Profile setup → Home feed
```

### 14.2 Supabase Auth Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,           // Persist session on device
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,       // Required for React Native
    },
  }
);
```

### 14.3 Guest RSVP Auth (Web Page)

Guests who RSVP via the web link go through a lightweight auth:
1. Enter name + phone number
2. Receive 6-digit OTP via SMS (Supabase phone auth)
3. Verify → RSVP created with `guest_phone` (no full user account)
4. Prompt to "Complete your profile on Dawat" — converts guests to users

---

## 15. Running Costs

### 15.1 Monthly Cost Breakdown

| Stage | Users | Infrastructure | WhatsApp | Email | Total |
|-------|-------|---------------|----------|-------|-------|
| MVP | 0–500 | $25–50 | $0–30 | $0 | $25–80 |
| Growth | 1K–10K | $50–150 | $100–300 | $20 | $170–470 |
| Scale | 10K–100K | $200–500 | $300–1,200 | $50 | $550–1,750 |

Key notes:
- **Stripe:** No monthly fee. 2.9% + 30c per ticket transaction (revenue share, not a cost net of your 2.5% platform fee)
- **Apple Developer:** $99/year ($8/mo). Required for iOS App Store
- **Google Maps:** $200/mo free credit covers early usage comfortably
- **Ramadan spike:** Traffic may 5–10× for 30 days. Budget an extra $200–500 for that month, infrastructure auto-scales.
- **Apple's 30% cut:** Avoid by directing org subscriptions to web checkout. Only ticket processing goes through in-app purchase where Apple's rules apply.

### 15.2 The AI Maintenance Reality

AI tools (Claude, Cursor, Copilot) dramatically reduce development costs — one competent developer can do the work of three. However, AI cannot own:

- **App Store submissions and rejection responses** — requires a human
- **System-level debugging under pressure** — Ramadan night, 50 events live, something breaks
- **Third-party API changes** (WhatsApp, Stripe, Apple) — someone must notice and respond
- **GDPR data handling decisions** — legal and ethical judgement required

Budget for a part-time technical resource (£500–1,500/mo) or an equity CTO — not as a coder, as a system owner.

---

## 16. Build Guide — How to Use This PRD

### 16.1 Sprint Kickoff Prompt (paste into Claude)

```
I am building Dawat — a Muslim community events platform.
Stack: React Native (Expo SDK 51) + Supabase + TypeScript.
Design: dark theme (#0D0D0D bg, #C9A84C gold accent), buttery 60fps feel.
I am starting [Sprint Name / Section Name].

Here is the PRD spec for this sprint:
[paste relevant section]

Write the full implementation. Start with Supabase schema/queries,
then the components, then wire them together. Use:
- FlashList for any list rendering
- React Native Reanimated 3 for animations
- Zustand for state
- TypeScript throughout
```

### 16.2 Component Prompt

```
Build the [ComponentName] component for Dawat.
It should: [bullet points from spec]

Design tokens:
  gold: '#C9A84C'    dark: '#0D0D0D'
  card: '#161616'    card2: '#1E1E1E'
  border: '#2A2A2A'  muted: '#888888'
  white: '#FFFFFF'

Use React Native Reanimated for press animations (scale: 0.97).
Use haptics (expo-haptics) on key interactions.
TypeScript. Export as default.
```

### 16.3 Debug Prompt

```
I am building Dawat (React Native + Supabase).
Error: [paste error]
Code: [paste relevant code]
PRD context: [paste spec section]
Fix the error and explain what was wrong.
```

### 16.4 What Cannot Be Done by AI

- Submitting to the App Store → manual at appstoreconnect.apple.com
- Creating Supabase project → supabase.com
- Setting up 360dialog WhatsApp account → 360dialog.com
- Setting up Stripe Connect → dashboard.stripe.com
- Testing on a real device → use Expo Go app
- Responding to App Store review feedback → human judgement required

---

## 17. Pre-Launch Checklist

### Technical
- [ ] All 8 sprints complete, tested on real iPhone + Android device
- [ ] Guest RSVP link works on Safari, Chrome, WhatsApp in-app browser
- [ ] Islamic art theme appears as WhatsApp/iMessage link preview image
- [ ] OTP SMS delivery tested with UK + US phone numbers
- [ ] RLS: non-RSVPd users cannot see hidden event addresses
- [ ] Home feed loads under 2 seconds on 4G
- [ ] No crashes on iOS 15+ and Android 10+
- [ ] Gender filter tabs filter correctly — sisters-only events don't appear in "All"
- [ ] Family RSVP stores children_count correctly

### Content
- [ ] All 20 themes render on iOS + Android
- [ ] 5 seed events created in launch city for screenshots/demo
- [ ] 3 pilot masjid org pages created with real branding
- [ ] Privacy Policy + Terms of Service live at dawatapp.com/legal
- [ ] App Store screenshots ready (6 for iOS, 8 for Android)
- [ ] App Store description written (Muslim-first, Partiful comparison)

### Launch
- [ ] Post in Muslim Facebook groups, WhatsApp groups, Instagram pages
- [ ] Contact 10 local masjid admins — offer free Pro for 3 months
- [ ] Create your first real event and share the link
- [ ] PostHog tracking active: signups, event_created, rsvp_submitted, share_tapped
- [ ] Sentry error monitoring active

---

## 18. Design Tokens

```typescript
// Use these in every component. Never hardcode colours.

export const COLORS = {
  // Brand
  gold:       '#C9A84C',
  gold2:      '#F0C040',
  orange:     '#E8760A',

  // Surfaces
  dark:       '#0D0D0D',   // Page background
  card:       '#161616',   // Card background
  card2:      '#1E1E1E',   // Elevated card
  border:     '#2A2A2A',   // Borders, dividers
  input:      '#1A1A1A',   // Input backgrounds

  // Text
  white:      '#FFFFFF',   // Primary text
  muted:      '#888888',   // Secondary text
  hint:       '#555555',   // Placeholder text

  // Semantic
  green:      '#4CAF50',   // Yes / confirmed / halal
  amber:      '#F59E0B',   // Inshallah / warning
  red:        '#EF4444',   // No / error / urgent
  purple:     '#A855F7',   // Sisters mode
  blue:       '#60A5FA',   // Brothers mode
  teal:       '#14B8A6',   // Family mode
};

export const FONTS = {
  bold:     { fontWeight: '900' as const },
  semibold: { fontWeight: '700' as const },
  medium:   { fontWeight: '500' as const },
  regular:  { fontWeight: '400' as const },
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};
```

---

> *"The Ummah is one body. When one part suffers, the rest responds."*
>
> Dawat is how we show up for each other — digitally, beautifully, together.

**Dawat دعوت · dawatapp.com · v3.0**

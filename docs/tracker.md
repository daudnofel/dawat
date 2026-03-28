# Dawat — Build Tracker
> Source of truth for what's done, what's in progress, and what's next.
> Referenced from: `docs/Dawat_PRD_v3.md`
> Updated after every file is confirmed working in Expo Go.

---

## Sprint Overview

| Sprint | Focus | Status | Notes |
|--------|-------|--------|-------|
| 1 | Foundation: project setup, Supabase, auth, nav shell | 🟡 IN PROGRESS | Starting now |
| 2 | Event creation: 4-step flow + 20 Islamic themes | ⬜ NOT STARTED | |
| 3 | RSVP system: Yes/Inshallah/No + shareable web page | ⬜ NOT STARTED | |
| 4 | Home feed: EventCard, gender filter tabs, halal spots | ⬜ NOT STARTED | |
| 5 | Trending + discovery: RSVP velocity sort, ethnic filters | ⬜ NOT STARTED | |
| 6 | Organisation pages: masjid profiles, follow system | ⬜ NOT STARTED | |
| 7 | Notifications: push + WhatsApp + email reminders | ⬜ NOT STARTED | |
| 8 | Payments + launch: Stripe tickets, QR check-in, App Store | ⬜ NOT STARTED | |

---

## Sprint 1 — Foundation (PRD Sections 7, 8, 14)

**Goal:** User can sign up with phone number and see an empty home screen.

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | Project init | `npx create-expo-app` + install all deps | ✅ DONE |
| 2 | `types/index.ts` | All shared TypeScript interfaces & enums | ✅ DONE |
| 3 | `lib/theme.ts` | Design tokens (COLORS, FONTS, RADIUS, SPACING) | ✅ DONE |
| 4 | `lib/supabase.ts` | Supabase client with AsyncStorage session | ✅ DONE |
| 5 | `store/useAuthStore.ts` | Auth state (Zustand) | ✅ DONE |
| 6 | `app/_layout.tsx` | Root layout — auth gate + font loading | ⬜ TODO |
| 7 | `app/(auth)/login.tsx` | Phone number entry screen | ⬜ TODO |
| 8 | `app/(auth)/otp.tsx` | 6-digit OTP verification | ⬜ TODO |
| 9 | `app/(auth)/onboarding.tsx` | Profile setup (new users only) | ⬜ TODO |
| 10 | `app/(tabs)/_layout.tsx` | Bottom tab navigator (Home/Create/Profile) | ⬜ TODO |
| 11 | `app/(tabs)/index.tsx` | Home feed (empty state placeholder) | ⬜ TODO |
| 12 | `app/(tabs)/trending.tsx` | Trending (empty state placeholder) | ⬜ TODO |
| 13 | `app/(tabs)/events.tsx` | My events (empty state placeholder) | ⬜ TODO |
| 14 | `app/(tabs)/profile.tsx` | Profile (empty state placeholder) | ⬜ TODO |
| 15 | Supabase setup | Create tables + RLS policies (manual in dashboard) | ⬜ TODO |

---

## Sprint 2 — Event Creation (PRD Sections 9.3, 10)

**Goal:** Can create a themed event and get a shareable link.

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `lib/themes.ts` | All 20 Islamic themes with CSS gradients | ⬜ TODO |
| 2 | `store/useEventStore.ts` | Event creation state (Zustand) | ⬜ TODO |
| 3 | `components/ThemePicker.tsx` | Theme selection grid | ⬜ TODO |
| 4 | `app/create/step1-theme.tsx` | Step 1: Choose theme | ⬜ TODO |
| 5 | `app/create/step2-basics.tsx` | Step 2: Title, host, description | ⬜ TODO |
| 6 | `app/create/step3-details.tsx` | Step 3: Date, location, price | ⬜ TODO |
| 7 | `app/create/step4-settings.tsx` | Step 4: Gender mode, ID req | ⬜ TODO |
| 8 | `app/create/success.tsx` | Confetti + share screen | ⬜ TODO |
| 9 | `lib/slugify.ts` | Slug generation for event URLs | ⬜ TODO |
| 10 | `lib/prayer-times.ts` | Prayer time calc (adhan.js) | ⬜ TODO |
| 11 | `components/PrayerTimeWarning.tsx` | Inline scheduling warning | ⬜ TODO |

---

## Sprint 3 — RSVP System (PRD Section 11)

**Goal:** Guests RSVP from a link with no app download. Islamic theme shows in WhatsApp preview.

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `components/RsvpButtons.tsx` | Yes / Inshallah / No buttons | ⬜ TODO |
| 2 | `app/event/[id].tsx` | Event detail screen | ⬜ TODO |
| 3 | `web/` (Next.js app) | Separate Next.js project for web RSVP | ⬜ TODO |
| 4 | `web/app/e/[slug]/page.tsx` | Public RSVP page | ⬜ TODO |
| 5 | `web/app/api/og/[themeId]/route.ts` | OG image generation | ⬜ TODO |

---

## Sprint 4 — Home Feed (PRD Section 9.2)

**Goal:** Home feed shows real events, gender filter tabs work.

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `components/EventCard.tsx` | Feed card component | ⬜ TODO |
| 2 | `components/GenderBadge.tsx` | Sisters/Brothers/Mixed/Family pill | ⬜ TODO |
| 3 | `components/HalalBadge.tsx` | Green halal-certified badge | ⬜ TODO |
| 4 | `components/SkeletonCard.tsx` | Loading placeholder | ⬜ TODO |
| 5 | `store/useFeedStore.ts` | Gender filter + feed pagination | ⬜ TODO |
| 6 | `app/(tabs)/index.tsx` | Full home feed implementation | ⬜ TODO |

---

## Sprint 5 — Trending + Discovery (PRD Section 9.5)

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `app/(tabs)/trending.tsx` | Full trending implementation | ⬜ TODO |
| 2 | Supabase RPC | `get_trending_events` function | ⬜ TODO |

---

## Sprint 6 — Organisation Pages (PRD Section 9.6)

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `components/OrgCard.tsx` | Organisation tile | ⬜ TODO |
| 2 | `app/org/[id].tsx` | Organisation/masjid page | ⬜ TODO |

---

## Sprint 7 — Notifications (PRD Section 12)

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `lib/whatsapp.ts` | 360dialog WhatsApp API | ⬜ TODO |
| 2 | `lib/email.ts` | Resend email client | ⬜ TODO |
| 3 | `lib/notifications.ts` | Push notification setup | ⬜ TODO |
| 4 | Supabase Edge Functions | Scheduled reminders | ⬜ TODO |

---

## Sprint 8 — Payments + Launch (PRD Section 13)

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `lib/stripe.ts` | Stripe client | ⬜ TODO |
| 2 | Payment sheet integration | stripe-react-native | ⬜ TODO |
| 3 | QR check-in screen | Scanner for door check-in | ⬜ TODO |
| 4 | App Store submission | Manual — screenshots + listing | ⬜ TODO |

---

## Testing Setup

- **Dev machine:** This Mac — run `npx expo start` to get QR code
- **Test device:** iPhone with Expo Go app — scan QR to test
- **No deployment** until ready to ship to App Store

---

## Notes & Decisions

- (none yet — will log key decisions here as we go)

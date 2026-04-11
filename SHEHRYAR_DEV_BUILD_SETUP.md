# Shehryar — Dev Build Setup Guide

## What's changed

Dawat now uses an **EAS Development Build** instead of Expo Go. This means native modules (push notifications, Apple Sign-In, etc.) work, but you need to install a custom build on your iPhone instead of using the Expo Go app.

## Prerequisites

1. **Your iPhone UDID must be registered** — Daud will send you a URL. Open it in Safari on your iPhone, tap Install to add the UDID profile. This is a one-time step.

2. **Install the dev build** — Daud will send you an install link (from expo.dev). Open it on your iPhone → tap Install. This replaces Expo Go for Dawat development.

## Running the app

Once the dev build is installed on your phone:

```bash
# 1. Clone and pull latest
git clone https://github.com/daudnofel/dawat.git
cd dawat
git checkout sprint-1/foundation
git pull origin sprint-1/foundation

# 2. Install dependencies
npm install

# 3. Copy the .env file (get from Daud — contains Supabase keys)
# The .env file is NOT checked into git for security

# 4. Start the dev server with tunnel mode
# (tunnel is required because of CGNAT/network issues)
npx expo start --dev-client --tunnel
```

- A QR code will appear in your terminal
- Open **iOS Camera** and scan the QR code
- The Dawat dev build app on your phone will connect and load your code

## Key differences from Expo Go

| | Expo Go | Dev Build |
|---|---|---|
| Install | App Store | Custom .ipa from expo.dev |
| Start command | `npx expo start` | `npx expo start --dev-client --tunnel` |
| Native modules | ❌ Limited | ✅ All work (push, Apple Sign-In, etc.) |
| Hot reload | ✅ Works | ✅ Works |
| New native module added | Just install | Need to rebuild (Daud queues via `eas build`) |

## When you need a rebuild

You do NOT need a rebuild for JavaScript/TypeScript changes — hot reload handles those. You only need a rebuild when:
- A new native module is added to `package.json` (e.g., `lottie-react-native`, `expo-camera`)
- `app.json` plugins change
- iOS entitlements change

Daud handles all rebuilds. Just let him know if you hit a "native module not found" error.

## Supabase access

You have Developer access to the Supabase project. You can:
- Run SQL in the SQL Editor
- Manage tables, storage buckets, Edge Functions
- View auth users and logs

Dashboard: https://supabase.com/dashboard/project/gwjhsbadranzzculpitm

## Branch workflow

- Work on `sprint-1/foundation` (the trunk)
- Create feature branches like `shehryar/daw-XX-feature-name`
- Open PRs targeting `sprint-1/foundation`
- Daud reviews and merges

## Current architecture (as of April 2026)

- **Event Identity System** (DAW-22): Every event has a poster (hero image), enriched theme (gradient bg + accents), and optional effects (particle animations). 6-step creation flow.
- **3 EventCard variants**: vertical (carousels), horizontal (lists), mini (recently viewed)
- **Event detail page**: Partiful-style with full theme gradient background, clean icon+text layout, floating RSVP bar
- **25 themes** including 5 light themes (Cream Elegance, Sky Blue, Blush Rose, Sage Garden, Lavender Mist)
- **Push notifications** via Expo Push API + Supabase Edge Function
- **Apple Sign-In** + Google Sign-In + Email OTP

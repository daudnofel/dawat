---
name: SDK Compatibility
description: Expo Go SDK 54 has native module limitations — no haptics, no Reanimated, no AsyncStorage in Supabase client
type: feedback
---

RESOLVED: Upgraded to RN 0.81.5 + React 19.1.0 + New Architecture (matching the ios/ project).
All native modules now work in Expo Go: haptics, Reanimated 4.1, AsyncStorage, glass effect, gesture handler, SVG, worklets.
No more disableEventLoopOnBridgeless errors. Sessions persist between app restarts.
**How to apply:** All native modules are safe to import now. Use Reanimated for animations, haptics on interactions, AsyncStorage for Supabase session.

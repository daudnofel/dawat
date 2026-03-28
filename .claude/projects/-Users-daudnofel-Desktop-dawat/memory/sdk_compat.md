---
name: SDK Compatibility
description: Expo Go SDK 54 has native module limitations — no haptics, no Reanimated, no AsyncStorage in Supabase client
type: feedback
---

Expo Go on the App Store uses SDK 54. Several native modules crash at import time:
- `expo-haptics` — crashes with "disableEventLoopOnBridgeless" error
- `react-native-reanimated` — same crash, use Pressable style prop for animations
- `@react-native-async-storage/async-storage` — crashes when used in Supabase client

**Why:** Expo Go SDK 54 doesn't bundle these native modules at versions compatible with our deps.
**How to apply:** Never import these in screens until we either (a) match exact SDK 54 compatible versions or (b) build a custom dev client. Use in-memory storage for Supabase, Pressable style for press animations, skip haptics.

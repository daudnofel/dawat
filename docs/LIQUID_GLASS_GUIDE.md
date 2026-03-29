# Liquid Glass (Glassmorphism) Implementation Guide for Expo

> A complete reference for implementing iOS-native liquid glass effects in Expo React Native apps.
> Extracted from a working production app (HabitSnap) running on Expo SDK 54.

---

## Prerequisites & Compatibility

| Requirement | Version | Notes |
|---|---|---|
| **Expo SDK** | `~54.0.33` | Must be SDK 54+ for `expo-glass-effect` |
| **React Native** | `0.81.5` | New Architecture required |
| **React** | `19.1.0` | |
| **New Architecture** | `true` | **REQUIRED** — set `"newArchEnabled": true` in app.json |
| **iOS version** | `26+` | Glass effects only render on iOS 26+. Falls back to plain `<View>` on older versions |
| **Expo Go** | **YES — Works** | Supported in Expo Go SDK 54+ (built with Xcode 26) |

### Expo Go Compatibility

`expo-glass-effect` is a **first-party Expo package** (lives in the `expo/expo` monorepo) and **ships with Expo Go** starting from SDK 54. You can use it with the standard workflow:

```bash
npx expo start
# Scan QR code → opens in Expo Go → glass effects work on iOS 26+
```

No development build required. However, if you need other custom native modules, a dev build is still recommended:

```bash
npx expo run:ios          # local dev build
eas build --profile development --platform ios  # cloud build
```

---

## Required Dependencies

Install all of these — they work together:

```bash
npx expo install expo-glass-effect expo-blur expo-haptics react-native-reanimated react-native-svg react-native-gesture-handler
```

### Exact Versions (Tested & Working)

```json
{
  "expo": "~54.0.33",
  "expo-glass-effect": "~0.1.9",
  "expo-blur": "~15.0.8",
  "expo-haptics": "~15.0.8",
  "react-native-reanimated": "~4.1.1",
  "react-native-svg": "15.12.1",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-worklets": "0.5.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0"
}
```

### app.json Configuration

```json
{
  "expo": {
    "newArchEnabled": true,
    "experiments": {
      "reactCompiler": true
    }
  }
}
```

---

## Core Component: `GlassView` from `expo-glass-effect`

This is the **only** import you need for the glass effect:

```tsx
import { GlassView } from 'expo-glass-effect';
```

### Basic Usage

```tsx
<GlassView
  style={styles.container}
  glassEffectStyle="clear"        // "clear" | "thinMaterial" | "regularMaterial" etc.
  colorScheme="light"              // "light" | "dark" — adapts tint
>
  {children}
</GlassView>
```

### GlassView Props

| Prop | Type | Description |
|---|---|---|
| `style` | `ViewStyle` | Standard RN styles. **Must include `overflow: 'hidden'`** and `borderRadius` |
| `glassEffectStyle` | `string` | iOS blur material. Use `"clear"` for subtle glass |
| `colorScheme` | `"light" \| "dark"` | Adjusts the glass tint for theme |

### Key Rules

1. **Always set `overflow: 'hidden'`** on the GlassView style
2. **Always set `borderRadius`** — glass without rounded corners looks wrong
3. **Layer a tint overlay inside** for depth control (see patterns below)
4. GlassView replaces `<View>` — it IS your container, don't wrap it unnecessarily

---

## Pattern 1: Glass Card (Habit Card)

A frosted glass card with content inside. This is the most common pattern.

```tsx
import { GlassView } from 'expo-glass-effect';

<GlassView
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    overflow: 'hidden',    // REQUIRED
  }}
  glassEffectStyle="clear"
>
  {/* Optional: semi-transparent emoji container */}
  <View style={{
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <Text style={{ fontSize: 22 }}>💧</Text>
  </View>

  <View style={{ flex: 1, marginLeft: 12 }}>
    <Text style={{ fontSize: 17, fontWeight: '600' }}>Drink Water</Text>
    <Text style={{ fontSize: 13, color: '#8E8E93' }}>Tap to complete</Text>
  </View>
</GlassView>
```

---

## Pattern 2: Glass Tab Bar

A floating glass navigation bar with animated indicator.

```tsx
import { GlassView } from 'expo-glass-effect';

// The GlassView IS the tab bar container
<GlassView
  style={{
    width: 260,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
  }}
  glassEffectStyle="clear"
  colorScheme={isDark ? 'dark' : 'light'}
>
  {/* Tint overlay — controls glass darkness */}
  <View style={[
    StyleSheet.absoluteFillObject,
    {
      backgroundColor: isDark
        ? 'rgba(0,0,0,0.45)'      // dark mode: darker glass
        : 'rgba(0,0,0,0.05)',     // light mode: barely tinted
    },
  ]} />

  {/* Selected tab highlight */}
  <View style={{
    position: 'absolute',
    backgroundColor: isDark
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(255,255,255,0.35)',
    borderRadius: 24,
  }} />

  {/* Tab items on top */}
  <View style={{ flex: 1, flexDirection: 'row', zIndex: 1 }}>
    {tabs.map(tab => (
      <Pressable key={tab.key} style={{ flex: 1, alignItems: 'center' }}>
        <Icon name={tab.icon} color={tab.active ? '#6C63FF' : '#999'} />
        <Text>{tab.label}</Text>
      </Pressable>
    ))}
  </View>
</GlassView>
```

### Tab Bar Positioning

```tsx
wrapper: {
  position: 'absolute',
  bottom: 36,
  left: 0,
  right: 40,        // offset for FAB on the right
  alignItems: 'center',
},
shadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 10,
},
```

---

## Pattern 3: Glass FAB (Floating Action Button)

```tsx
import { GlassView } from 'expo-glass-effect';

<Pressable style={({ pressed }) => [
  styles.fabWrapper,
  { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
]}>
  <GlassView
    style={{
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}
    glassEffectStyle="clear"
  >
    {/* Purple tint overlay */}
    <View style={[
      StyleSheet.absoluteFillObject,
      { backgroundColor: 'rgba(108, 99, 255, 0.55)' },
    ]} />
    <Text style={{ color: '#fff', fontSize: 30, fontWeight: '400' }}>+</Text>
  </GlassView>
</Pressable>

// Wrapper styles:
fabWrapper: {
  position: 'absolute',
  bottom: 38,
  right: 30,
  shadowColor: '#6C63FF',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 8,
},
```

---

## Pattern 4: Gradient Card (Non-Glass, Complementary)

The progress/summary card uses SVG gradients, not glass. Pairs well with glass cards.

```tsx
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

<View style={{ borderRadius: 20, overflow: 'hidden', height: 130 }}>
  <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
    <Defs>
      <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#7B6CF6" />
        <Stop offset="1" stopColor="#B06AB3" />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" rx="20" fill="url(#cardGrad)" />
  </Svg>

  {/* Content on top of gradient */}
  <View style={{ flex: 1, padding: 24 }}>
    <Text style={{ color: '#fff' }}>Content here</Text>
  </View>
</View>
```

---

## Tint Overlay Strategy (Key Technique)

The secret to making `GlassView` look right is the **tint overlay** — a `View` with `StyleSheet.absoluteFillObject` layered inside:

```
┌─────────────────────────┐
│  GlassView (blur)       │  ← native iOS blur
│  ┌───────────────────┐  │
│  │ Tint Overlay       │  │  ← rgba color on top of blur
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Content            │  │  ← your actual UI
│  └───────────────────┘  │
└─────────────────────────┘
```

### Tint Values Reference

| Component | Light Mode | Dark Mode |
|---|---|---|
| Tab Bar | `rgba(0,0,0,0.05)` | `rgba(0,0,0,0.45)` |
| Tab Indicator | `rgba(255,255,255,0.35)` | `rgba(255,255,255,0.1)` |
| FAB | `rgba(108, 99, 255, 0.55)` | same |
| Card Emoji BG | `rgba(255,255,255,0.4)` | adjust to `rgba(255,255,255,0.15)` |
| Ring Track | `rgba(255,255,255,0.4)` | same |

---

## Color System

### Theme Colors

```typescript
const Colors = {
  light: {
    text: '#1A1A2E',
    background: '#FFFFFF',
    accent: '#6C63FF',
    accentLight: '#EDEDFF',
    card: '#F0F0F5',
    cardBorder: '#E5E5EA',
    success: '#34C759',
    streak: '#FF9500',
    subtleText: '#8E8E93',
  },
  dark: {
    text: '#F0F0F5',
    background: '#121218',
    accent: '#7C73FF',
    accentLight: '#1E1B3A',
    card: '#1C1C24',
    cardBorder: '#2A2A35',
    success: '#34C759',
    streak: '#FF9500',
    subtleText: '#6B7280',
  },
};
```

### Per-Item Color Palette (for lists)

```typescript
const ITEM_COLORS = [
  { bg: '#EEF0FF', ring: '#6C63FF', border: '#DDE0FF' },
  { bg: '#F0EEFF', ring: '#8B7CF6', border: '#E0DCFF' },
  { bg: '#ECF0FF', ring: '#5B8DEF', border: '#D9E4FF' },
  { bg: '#F3EEFE', ring: '#9B6CF6', border: '#E6DCFE' },
  { bg: '#EDF2FF', ring: '#6B8AFF', border: '#DAE3FF' },
  { bg: '#F0EDFF', ring: '#7B6CF6', border: '#E1DBFF' },
  { bg: '#EDEFFF', ring: '#6373FF', border: '#DBDFFF' },
  { bg: '#F2EEFF', ring: '#8E7CF6', border: '#E4DCFF' },
];
```

---

## Animations with Reanimated

### Card Press Animation

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlePress = () => {
  scale.value = withSequence(
    withTiming(0.96, { duration: 100 }),
    withSpring(1, { damping: 15, stiffness: 200 })
  );
};

<Animated.View style={animatedStyle}>
  <GlassView ...>{content}</GlassView>
</Animated.View>
```

### Animated Progress Ring (SVG)

```tsx
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const animatedProgress = useSharedValue(0);

useEffect(() => {
  animatedProgress.value = withTiming(targetProgress, { duration: 600 });
}, [targetProgress]);

const animatedProps = useAnimatedProps(() => ({
  strokeDashoffset: circumference * (1 - animatedProgress.value),
}));

<Svg width={size} height={size}>
  {/* Track */}
  <Circle cx={size/2} cy={size/2} r={radius}
    stroke="rgba(255,255,255,0.25)" strokeWidth={strokeWidth} fill="none" />
  {/* Progress */}
  <AnimatedCircle cx={size/2} cy={size/2} r={radius}
    stroke="#FFFFFF" strokeWidth={strokeWidth} fill="none"
    strokeDasharray={circumference} animatedProps={animatedProps}
    strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
</Svg>
```

### Tab Bar Minimize Animation

```tsx
const barAnimatedStyle = useAnimatedStyle(() => {
  const scaleX = interpolate(minimizeProgress.value, [0, 1], [1, 0.58], Extrapolation.CLAMP);
  const scaleY = interpolate(minimizeProgress.value, [0, 1], [1, 0.62], Extrapolation.CLAMP);
  const translateY = interpolate(minimizeProgress.value, [0, 1], [0, 12], Extrapolation.CLAMP);
  const opacity = interpolate(minimizeProgress.value, [0, 1], [1, 0.85], Extrapolation.CLAMP);
  return { transform: [{ scaleX }, { scaleY }, { translateY }], opacity };
});
```

---

## Haptic Feedback Patterns

```tsx
import * as Haptics from 'expo-haptics';

// Card completion → success notification
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Tab press → light tap
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// FAB press → medium tap
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Destructive action (delete) → medium tap
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

---

## Troubleshooting

### "expo-glass-effect doesn't work in Expo Go"

Make sure you're on:
- **Expo SDK 54+** (check `package.json`)
- **iOS 26+** on the device/simulator
- **Latest Expo Go** from the App Store (built with Xcode 26)

On older iOS versions, `GlassView` silently falls back to a regular `<View>` — no error, just no glass effect.

### Glass effect looks like a solid white/black box

- Ensure `overflow: 'hidden'` is set on the GlassView style
- Ensure `borderRadius` is set
- Check that `newArchEnabled: true` is in your app.json
- The glass effect needs content *behind* it to blur — if the background is a flat color, glass won't look different from a semi-transparent view

### Reanimated "worklet" errors

Ensure `react-native-worklets` is installed:
```bash
npx expo install react-native-worklets
```

### Android fallback

`expo-glass-effect` is iOS-only. On Android, it falls back to a semi-transparent view. For cross-platform glass, consider `expo-blur` with `BlurView` as a fallback:
```tsx
import { BlurView } from 'expo-blur';

// Android fallback
<BlurView intensity={80} tint="light" style={styles.card}>
  {children}
</BlurView>
```

---

## Quick Start Checklist

1. [ ] Expo SDK 54+ (`expo: "~54.0.33"`)
2. [ ] `"newArchEnabled": true` in app.json
3. [ ] iOS 26+ on device/simulator
4. [ ] Install: `npx expo install expo-glass-effect expo-blur expo-haptics react-native-reanimated react-native-svg react-native-worklets`
5. [ ] Works in Expo Go (SDK 54+) OR development builds
6. [ ] Import `GlassView` from `expo-glass-effect`
6. [ ] Always set `overflow: 'hidden'` + `borderRadius` on GlassView
7. [ ] Layer tint overlays inside GlassView for depth control
8. [ ] Use `glassEffectStyle="clear"` for subtle glass
9. [ ] Adapt tint `rgba` values for light/dark mode

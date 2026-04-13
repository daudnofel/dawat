# Dawat Design System

> Every screen should feel like Partiful built it for the Muslim community — premium, alive, and warm. Not corporate. Not generic. Not dark-mode-by-default.

---

## The Answers (so you never need to ask)

| Question | Answer |
|---|---|
| **Color palette** | Gold `#C9A84C` primary, champagne `#FFDFA1` accent, dark `#0D0D0D` base. Full scale below. |
| **Font** | Manrope (Light/Regular/SemiBold/Bold) for UI. Playfair Display, Space Grotesk, Lora, JetBrains Mono, Dancing Script for event titles. SF Arabic for Arabic text. |
| **Vibe** | Warm, communal, premium |
| **Platform** | iOS-first (EAS dev build). Android later. |
| **Reference apps** | Partiful (primary), Locket, Linear |

---

## Color Tokens

Always import from `lib/theme.ts`. Never hardcode hex values.

```typescript
import { COLORS } from '../lib/theme';
```

| Token | Hex | Usage |
|---|---|---|
| `gold` | `#C9A84C` | Primary accent, CTAs, active states |
| `gold2` | `#F0C040` | Secondary gold, emphasis |
| `dark` | `#0D0D0D` | App background (NOT pure black) |
| `card` | `#161616` | Card/surface background |
| `card2` | `#1E1E1E` | Elevated card surface |
| `border` | `#2A2A2A` | Borders, dividers |
| `input` | `#1A1A1A` | Input field background |
| `white` | `#FFFFFF` | Primary text on dark |
| `muted` | `#888888` | Secondary text |
| `hint` | `#555555` | Placeholder text |
| `green` | `#4CAF50` | Yes / success (desaturated, not pure green) |
| `amber` | `#F59E0B` | Inshallah / warning |
| `red` | `#EF4444` | No / error / destructive |
| `purple` | `#A855F7` | Sisters mode |
| `blue` | `#60A5FA` | Brothers mode |
| `teal` | `#14B8A6` | Family mode |

### Color rules
- **No pure black `#000000`** anywhere. Use `COLORS.dark` (`#0D0D0D`).
- **Secondary text on dark backgrounds:** use `rgba(255,255,255,0.55)` — not `COLORS.muted`. The rgba respects the background; flat grey looks dead.
- **Colored shadows:** if a button has `COLORS.gold`, give it `shadowColor: COLORS.gold` at `shadowOpacity: 0.25`. This is the premium touch.
- **Status colors are desaturated.** Our green/red/amber are already toned down — never use pure `#00FF00` or `#FF0000`.

---

## Theme System

Every event has a theme from `lib/themes.ts`. Themes are enriched via `enrichTheme()` with:

```typescript
theme.background.stops     // gradient color stops
theme.accents.primary      // RSVP button, links
theme.accents.secondary    // borders, dividers (accent at 25% opacity)
theme.surface.pageBg       // event detail page background
theme.surface.cardBg       // EventCard glass background
theme.surface.border       // card border color
theme.textColor            // adapts: dark text on light themes, white on dark
```

### Theme rendering rules
- **Event detail page background = the theme's actual gradient** (full color, not tinted dark). Light themes go fully light — exactly like Partiful.
- **All text on themed pages uses `theme.textColor`** — never hardcode `COLORS.white` on a themed surface.
- **EventCard background uses `theme.surface.cardBg`** — tinted glass that carries the theme's chromatic signature.
- **25 themes** including 5 light themes: Cream Elegance, Sky Blue, Blush Rose, Sage Garden, Lavender Mist.

---

## Typography Scale

| Level | Size | Weight | Usage |
|---|---|---|---|
| Display / Hero | 28–32pt | Bold | Event title on detail page, section headers |
| Title | 18–22pt | Bold | Card titles, section headings, date |
| Body | 16–17pt | Regular | Description text, info values |
| Secondary | 13–14pt | Medium | Date labels, location, metadata |
| Caption | 12pt | Regular | Timestamps, hints, counts |
| Label / Tag | 11pt | SemiBold | Chip text, filter pills |

### Typography rules
- **Max 2 font families per screen.** Manrope for UI + one title font for the event title.
- **Line height:** `1.5–1.7x` font size for body text. Default RN line height is too tight.
- **Letter spacing:** `-0.3` to `-0.5` on titles (tighter = editorial). `0` on body text.
- **Hierarchy through weight, not size.** 16pt SemiBold + 16pt Regular side by side creates clean contrast.
- **Event titles** can use one of 6 font styles from `lib/title-styles.ts`: Classic (Manrope), Display (Playfair), Mono (Space Grotesk), Serif (Lora), Code (JetBrains), Script (Dancing Script).

---

## Spacing

Always import from `lib/theme.ts`. Use the 4pt/8pt grid.

```typescript
import { SPACING } from '../lib/theme';
```

| Token | Value | Usage |
|---|---|---|
| `xs` | 4 | Tight gaps (between icon + text) |
| `sm` | 8 | Small gaps (between stacked elements) |
| `md` | 12 | Standard gap |
| `lg` | 16 | Card padding, section gaps |
| `xl` | 24 | Page horizontal padding, section spacing |
| `xxl` | 32 | Large section breaks |

### Spacing rules
- **Page horizontal padding:** always `SPACING.xl` (24pt).
- **Card internal padding:** minimum `SPACING.lg` (16pt). 12pt reads as cramped.
- **Between stacked cards:** `SPACING.md` (12pt) minimum.
- **Between sections:** `SPACING.xl` to `SPACING.xxl` (24–32pt). Sections should breathe.
- **No separator lines between sections.** Use spacing alone. Lines are banned from the event detail page.

---

## Corner Radius

```typescript
import { RADIUS } from '../lib/theme';
```

| Token | Value | Usage |
|---|---|---|
| `sm` | 8 | Small chips, badges |
| `md` | 12 | Buttons, inputs, tags |
| `lg` | 16 | Cards, posters, image containers |
| `xl` | 20 | Large cards, modals |
| `full` | 999 | Pills, avatars, circular elements |

### Radius rules
- **Cards:** `RADIUS.xl` (20pt) or 22pt. Never sharp corners.
- **Buttons:** `RADIUS.md` (12pt). Never fully pill-shaped unless it's a small chip.
- **Poster images:** `RADIUS.lg` (16pt) with `overflow: 'hidden'`.
- Always use `overflow: 'hidden'` on any rounded container — otherwise children bleed outside the radius.

---

## Buttons

### Press states
Every interactive element uses `AnimatedPress` (or `Pressable` with scale):
- **Press in:** scale `0.96–0.97` via `withSpring`
- **Press out:** scale back to `1.0` via `withTiming(1, { duration: 120 })` — NOT spring (spring causes scroll wobble)
- Minimum tap target: **48pt height**

### Button styles
- **Primary CTA:** Metallic gold gradient (`#FFDFA1` → `#E6C27A` → `#FFDFA1`) via SVG LinearGradient. Dark text.
- **Secondary:** transparent with `1px` border at `rgba(255, 223, 161, 0.12)`. Gold text.
- **Destructive:** `rgba(red, 0.15)` background, not solid red. Red text.
- **Disabled:** `opacity: 0.4`. Never use flat grey — keep the color, just fade it.
- **Glass button:** `rgba(30, 30, 30, 0.55)` background + 1px border at `rgba(255, 255, 255, 0.08)`.

### What to avoid
- Default `TouchableOpacity` with no styling
- `opacity: 0.5` for disabled (use desaturated color instead)
- All-caps button text (unless a very specific design choice)
- Shadows that are too dark or too large — they look cheap

---

## Cards — EventCard Variants

Three variants, imported from `components/EventCard.tsx`:

### Vertical (carousel/featured)
- Used in: horizontal scroll carousels on Home tab ("Discover events")
- Theme gradient fills the entire card background
- Poster centered with padding + rounded corners
- Title/date/location/description below poster
- "X going" + share icon at bottom
- Width: controlled by parent (~72% screen width in carousels)

### Horizontal (list)
- Used in: Discover search results, Events tab, Org page
- Compact: poster thumbnail (110px) left, details stacked right
- Theme-tinted glass background (`theme.surface.cardBg`)
- Title (16pt bold), date · location, description (2 lines), going count

### Mini (recently viewed)
- Used in: "Recently viewed" horizontal row on Home tab
- Just poster thumbnail (~110px square) + title below (12pt, 2 lines)
- No metadata, no bottom row

### No-poster fallback
All three variants: when no poster, show theme gradient fill with emoji centered in the poster area.

---

## Event Detail Page

The event detail page follows Partiful's layout philosophy: **content flows on the themed background with zero UI chrome.**

### Layout rules
- **Full theme gradient as page background** — the ENTIRE page is the theme color. Light themes = light page with dark text.
- **Poster:** 88% width, centered, rounded corners (`RADIUS.xl`), breathing room top/bottom.
- **Date:** 28pt bold, largest text on the page after the poster.
- **Info rows:** icon + text pairs (📍 Location, 👥 Spots left, 🎟 Price). No boxed cards, no borders.
- **Description:** 17pt, line-height 28px. Generous, readable.
- **Guest List:** heading + count text + avatar stack. No admin dashboard for guests.
- **RSVP bar:** floating at bottom, always visible. Dark pill with 3 options: Yes | Inshallah | Can't Go.
- **Host actions:** ⋯ menu in top-right bar (Edit Event, Cancel Event as action sheet). NOT inline buttons at bottom.

### What's banned on the event detail page
- ❌ Separator lines between sections
- ❌ Boxed info cards with borders
- ❌ Emoji icon prefixes on info rows (🕐📍💲 style)
- ❌ Inline Edit/Cancel buttons
- ❌ Pill tags for price/gender/halal (use icon+text rows instead)
- ❌ `BlurView` on the detail page
- ❌ Hardcoded `COLORS.white` text (use `theme.textColor`)

---

## Blur & Glass

- Use `expo-blur` with intensity **30–60** for card surfaces. Above 80 is too opaque.
- `tint="dark"` on dark backgrounds. `tint="light"` on light.
- Glass recipe: `BlurView` + `rgba(30, 30, 30, 0.55)` background + `1px` border at `rgba(255, 255, 255, 0.08)`.
- Use glass on **feed cards only** — NOT on the event detail page.
- Bottom sheets / modals: blur the background behind them.

---

## Shadows

Premium shadow formula for cards:
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.18,
shadowRadius: 12,
elevation: 6,
```

### Rules
- Never `shadowOpacity` above `0.3`.
- Colored shadows on branded elements: `shadowColor: COLORS.gold` at `shadowOpacity: 0.25` on gold buttons.
- Use shadows intentionally: cards, modals, FABs, primary CTAs only. Not on every element.

---

## Animations

All animations use `react-native-reanimated`. Never the core `Animated` API.

### Conventions
- **Press states:** `withTiming` on release (120ms), `withSpring` on press-in
- **Screen transitions:** Expo Router default slide is fine. No custom transitions needed.
- **Skeleton loaders:** Reanimated shimmer (animated opacity). See `DiscoverFeedSkeleton.tsx` and `DiscoverCalendarSkeleton.tsx`.
- **Entrance animations:** stagger fade-up (each item fades in + translates up 8pt, staggered by 40ms). Highest ROI animation.
- **Effects:** Reanimated particle system (`EventEffect.tsx`). 8 ambient effects, rendered only on event detail page, never on feed cards.
- **Duration:** 150–300ms for interactions. 300–500ms for screen transitions. Never >500ms.

### What to avoid
- `Animated` from core React Native (janky, no native driver for everything)
- Spring animations on release (causes scroll wobble — use `withTiming`)
- Looping animations without user interaction (except ambient effects on detail page)
- Color interpolation (animate opacity between two views instead)

---

## Notifications & Feedback

### Toast system (`components/Toast.tsx`)
- **Always use Toast, never `Alert.alert`** for simple messages.
- `Toast.success('message')` — green pill, auto-dismiss 2.5s
- `Toast.error('message')` — red pill
- `Toast.info('message')` — gold pill
- Each toast has haptic feedback matching its type.
- Called globally: `Toast.show('text', 'success')` — no hooks or context needed.

### When to keep `Alert.alert`
Only for **confirmations that need action buttons:**
- Sign Out ("Are you sure?" → Cancel / Sign Out)
- Cancel Event (destructive confirmation)
- Delete Comment
- Photo permission → "Open Settings" button

---

## Component Inventory

| Component | File | Usage |
|---|---|---|
| `EventCard` | `components/EventCard.tsx` | 3 variants: vertical, horizontal, mini |
| `EventPreview` | `components/EventPreview.tsx` | Shared live preview canvas (editor + detail page) |
| `EventEffect` | `components/EventEffect.tsx` | Reanimated particle overlay (8 effects) |
| `AnimatedPress` | `components/AnimatedPress.tsx` | Universal press-state wrapper |
| `Toast` / `ToastProvider` | `components/Toast.tsx` | Branded toast notifications |
| `RsvpButtons` | `components/RsvpButtons.tsx` | Compact pill bar (Yes/Inshallah/Can't Go) |
| `ThemePicker` | `components/ThemePicker.tsx` | Live gradient preview tiles (2-column) |
| `PosterLibraryBrowser` | `components/PosterLibraryBrowser.tsx` | 3-column poster grid with category pills |
| `GuestAvatars` | `components/GuestAvatars.tsx` | Overlapping avatar stack |
| `GuestListDashboard` | `components/GuestListDashboard.tsx` | Host-only guest management (compact text summary) |
| `EventComments` | `components/EventComments.tsx` | Threaded wall with reactions |
| `ShareSheet` | `components/ShareSheet.tsx` | Copy/Share/WhatsApp bottom sheet |
| `EditorChrome` | `components/EditorChrome.tsx` | Creation V2 editor shell |
| `EditorDock` | `components/EditorDock.tsx` | Bottom tool dock for creation |
| `ToolSheet` | `components/ToolSheet.tsx` | Reusable bottom sheet for tools |
| `ThemePattern` | `components/ThemePattern.tsx` | Islamic geometric SVG pattern overlays |
| `ThemeTexture` | `components/ThemeTexture.tsx` | Film grain / paper texture overlay |
| `TitleStylePicker` | `components/TitleStylePicker.tsx` | 6 font style options for event titles |

---

## What Claude Code Should Never Do

- ❌ Use `Alert.alert` for simple messages (use Toast)
- ❌ Add separator lines / borders between sections
- ❌ Use `FlatList` (always `FlashList`)
- ❌ Use core `Animated` API (always Reanimated)
- ❌ Hardcode colors (always `COLORS.*`)
- ❌ Hardcode spacing (always `SPACING.*`)
- ❌ Use `TouchableOpacity` without styling (use `AnimatedPress` or styled `Pressable`)
- ❌ Put info in boxed cards on the event detail page
- ❌ Add emoji icon prefixes to info rows (📍🕐💲)
- ❌ Make the app look more "Material Design" — iOS-first always
- ❌ Use third-party UI libraries (no NativeBase, Tamagui, UI Kitten)
- ❌ Write `// TODO` or leave functions empty
- ❌ Use `spring` on press-release animations (causes scroll wobble)

---

## How to Polish a Screen

1. **List every visual issue** (don't fix yet)
2. **Prioritise by impact** — shadows, spacing, and press states first
3. **Fix one thing at a time**
4. **After each change:** explain what changed, why it's more premium, and what to watch for
5. **If a change makes the UI busier, undo it.** Less is always more.

Start with the screen the developer flags as worst. Quick wins first: shadow, border-radius, spacing consistency, and button press states.

---

*"The Ummah is one body. When one part suffers, the rest responds."*
*Every pixel in Dawat should feel like it was placed with care — because it was.*

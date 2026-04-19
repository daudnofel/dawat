# CLAUDE.md — Dawat Build Instructions
# Read this file at the start of every session. Follow it exactly.

---

## ⚠️ READ THIS BEFORE TOUCHING ANY UI

**Use the `building-native-ui` skill from Expo for ALL UI/native-component work.**

It lives at `.claude/skills/building-native-ui/` (project-level, auto-loaded by Claude Code) and is maintained by the Expo team. Consult it BEFORE writing or editing anything in `app/`, `components/`, or any file that uses Expo Router, Reanimated, expo-glass-effect, expo-blur, expo-symbols, NativeTabs, form sheets, BottomSheetScrollView, or any iOS 26 API.

The skill has reference files for: animations, controls (Switch/Slider/SegmentedControl/DateTimePicker/Picker), form-sheet, gradients, icons (SF Symbols via expo-image), media, route-structure, search bar, storage (SQLite/SecureStore), tabs (NativeTabs / iOS 26), toolbar-and-headers, visual-effects (blur + liquid glass), zoom-transitions (Apple Zoom).

If you skip this and write UI code from training-data memory, you will use deprecated APIs (Animated.\*, RN ScrollView for sheets, hand-rolled tab bars instead of NativeTabs, etc.). Half of this session's hardest bugs (formSheet failure, sticky headers, gorhom scroll, ngrok v2/v3) would have been answered by checking the relevant reference file first.

**Workflow:**
1. About to write/edit a UI file? `Read .claude/skills/building-native-ui/SKILL.md`
2. Pick the matching `references/<topic>.md` and read it
3. Then write code

To install on a fresh machine:
```bash
npx skills add expo/skills --skill building-native-ui --agent claude-code -y
```

---

## Who You Are and What We Are Building

You are the lead engineer on Dawat (دعوت) — a Muslim community events platform.
Think Partiful, built natively for Muslim communities.

The full PRD lives at: `docs/Dawat_PRD_v3.md`
Read it before every session. It is the source of truth.

---

## The Stack (never deviate from this)

- **Mobile:** React Native + Expo SDK 51 + TypeScript
- **Routing:** Expo Router (file-based, like Next.js)
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **State:** Zustand
- **Lists:** FlashList from @shopify/flash-list (never FlatList)
- **Animations:** React Native Reanimated 3 (never Animated API)
- **Haptics:** expo-haptics on all key interactions
- **WhatsApp:** 360dialog API (not Twilio)
- **Email:** Resend
- **Payments:** Stripe + stripe-react-native
- **OG Images:** @vercel/og (Next.js web app)
- **Prayer times:** adhan.js
- **Testing:** Expo Go on a real iPhone

## Design Tokens (use in every component, never hardcode colours)

```typescript
export const COLORS = {
  gold:    '#C9A84C',   // Primary accent
  gold2:   '#F0C040',
  orange:  '#E8760A',
  dark:    '#0D0D0D',   // Page background
  card:    '#161616',   // Card surface
  card2:   '#1E1E1E',   // Elevated card
  border:  '#2A2A2A',   // Borders
  input:   '#1A1A1A',   // Input bg
  white:   '#FFFFFF',   // Primary text
  muted:   '#888888',   // Secondary text
  hint:    '#555555',   // Placeholder
  green:   '#4CAF50',   // Yes / halal / success
  amber:   '#F59E0B',   // Inshallah / warning
  red:     '#EF4444',   // No / error
  purple:  '#A855F7',   // Sisters mode
  blue:    '#60A5FA',   // Brothers mode
  teal:    '#14B8A6',   // Family mode
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 };
export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
```

---

## The One Rule That Overrides Everything

> **Build one file at a time. Stop after each file. Wait for the user to test in Expo Go and confirm before moving on.**

Never write two files in the same response unless one is a types file that the other directly imports.
Never skip ahead because something "seems simple."
Never assume a previous step worked — wait to be told.

---

## Git Workflow

> **Remote:** `https://github.com/daudnofel/dawat`
> - Branch per sprint (e.g. `sprint-1/foundation`)
> - Commit after each confirmed file
> - Push periodically (every few files or end of session)
> - **Always `git pull` before starting new work in a session**
> - Never force push

---

## Issue Tracking — Linear (primary)

> **Linear is the primary issue tracker. Use it for all new work.**
> - **Workspace:** Dawat | **Team:** Dawat | **MCP:** `linear-server`
> - Check Linear backlog (`list_issues`) at the start of every session
> - When completing work, update the Linear issue (check off sub-tasks, move to Done)
> - When discovering bugs or needed features, create a Linear issue (bundle related items to conserve the 250-issue free tier limit)
> - Daud's business partner Shehryar uses Linear to track progress — keep it up to date

## The Old Tracker (read-only history)

> **`docs/tracker.md` is the legacy build progress tracker.** It documents Sprints 1–8 completion status.
> Do NOT update it for new work — use Linear instead.
> Never start a new file without checking the tracker first.

---

## How Every Session Must Start

When the user starts a session or says "start sprint X" or "let's work on [feature]":

**Step 1 — Announce what you're reading:**
```
Reading docs/Dawat_PRD_v3.md — Section [X]: [Section Name]
```

**Step 2 — Confirm understanding in exactly this format:**
```
## What we're building this sprint
- [bullet 1: the core thing]
- [bullet 2: key dependency or constraint]
- [bullet 3: what done looks like]

## Files we'll create/modify (in order)
1. [filepath] — [one line description]
2. [filepath] — [one line description]
...

## Before I write any code — do you have these ready?
- [ ] [any API key, account, or table that must exist first]
- [ ] [any other prerequisite]

Ready to build file 1 of N: [filename]?
Type "go" to start, or ask questions first.
```

**Step 3 — Wait for user confirmation before writing any code.**

---

## How to Build Each File

When the user says "go" or "next" or "that works":

1. **State what you're building:**
   ```
   Building [N of total]: `[filepath]`
   [one sentence: what this file does and why it comes first]
   ```

2. **Write the complete file.** No placeholders. No `// TODO`. No `// implement later`.
   Every function must be fully implemented.

3. **After the code block, write exactly:**
   ```
   ---
   ✅ Test this now in Expo Go:
   [2-3 bullet points of exactly what to look for / tap / check]

   ⚠️  Known issues to watch for:
   [any likely gotcha on first run]

   When it looks right, type "next" to continue.
   If there's an error, paste it here and I'll fix it before moving on.
   ```

4. **Stop. Do not write the next file.**

---

## How to Handle Errors

When the user pastes an error:

1. Read the full error message
2. Identify the root cause in one sentence
3. Show only the changed lines (not the full file unless < 40 lines total)
4. Explain what was wrong in plain English
5. End with: "Test this fix in Expo Go. If it works, type 'next'."

Never guess. If the error is ambiguous, ask: "Can you paste the full stack trace?" or "Which line does Expo Go highlight?"

---

## Expo Go Testing Protocol

After every file, these are the exact things to verify in Expo Go:

**For any screen:**
- Does it render without a white flash?
- Do skeleton loaders appear before data loads?
- Is scroll smooth (no jank on fast swipe)?
- Do buttons have haptic feedback?
- Does the back gesture (swipe from left edge) work?

**For any button:**
- Does it scale down (0.97) on press?
- Is there a haptic response?
- Does it navigate/action correctly?

**For any list:**
- Is FlashList being used (not FlatList)?
- Does pull-to-refresh work?
- Does infinite scroll trigger before hitting the bottom?

**For any form:**
- Does the keyboard push the form up (KeyboardAvoidingView)?
- Does the Continue/Submit button disable correctly when fields are empty?

If any of these fail, it's a bug. Fix it before moving to the next file.

---

## Sprint Reference

Read `docs/Dawat_PRD_v3.md` for full specs. Sprints in order:

| Sprint | Focus | Key files |
|--------|-------|-----------|
| 1 | Foundation: project setup, Supabase, auth, nav shell | supabase.ts, auth screens, tab layout |
| 2 | Event creation: 4-step flow + 20 Islamic themes | step1–4 screens, themes.ts, ThemePicker |
| 3 | RSVP system: Yes/Inshallah/No + shareable web page | rsvps logic, Next.js /e/[slug] page, OG image |
| 4 | Home feed: EventCard, gender filter tabs, halal spots | index.tsx, EventCard, GenderBadge, feed query |
| 5 | Trending + discovery: RSVP velocity sort, ethnic filters | trending.tsx, RPC function |
| 6 | Organisation pages: masjid profiles, follow system | org/[id].tsx, org_followers |
| 7 | Notifications: push + WhatsApp (360dialog) + reminders | notifications.ts, whatsapp.ts, edge functions |
| 8 | Payments + launch: Stripe tickets, QR check-in, App Store | stripe.ts, payment sheet, checkin screen |

---

## Code Quality Rules

- **TypeScript strict mode.** No `any`. Define interfaces for everything in `types/index.ts`.
- **No inline styles on repeated elements.** Use `StyleSheet.create()` or a shared styles file.
- **Every list uses FlashList.** Import from `@shopify/flash-list`.
- **Every animation uses Reanimated 3.** Import from `react-native-reanimated`.
- **Every press interaction has haptic feedback.** Use `expo-haptics` `impactAsync(ImpactFeedbackStyle.Light)`.
- **No hardcoded colours.** Always import from `COLORS`.
- **No hardcoded strings.** Event types, gender modes, and notification types must use the enums from `types/index.ts`.
- **Supabase queries have error handling.** Always check `error` before using `data`.
- **RLS is the security layer.** Never filter sensitive data in application code — rely on Supabase Row Level Security policies.

---

## What You Must Never Do

- ❌ Never write `// TODO` or leave a function empty
- ❌ Never use `FlatList` — always `FlashList`
- ❌ Never use the React Native `Animated` API — always Reanimated 3
- ❌ Never hardcode a colour, spacing, or radius value
- ❌ Never write two files in one response without being asked
- ❌ Never move to the next file until the user confirms the current one works
- ❌ Never use Twilio for WhatsApp — use 360dialog
- ❌ Never put masjid subscription sign-up inside the iOS app (Apple's 30% cut) — always direct to web
- ❌ Never store sensitive keys in the Expo client — only `EXPO_PUBLIC_` prefixed vars are safe for client

---

## Design Ethos — The Partiful Standard

Every component must feel custom-built, not like a default React Native element.

**Tab Bar:**
- No emoji icons — use custom minimal line icons (SF Symbols style)
- No text labels — icons only, clean and minimal
- Active state: filled icon + gold accent dot below
- Create button: larger, centred, elevated with gold accent
- Tab bar background: solid dark with subtle top border, no blur

**Buttons:**
- Scale 0.97 on press (Pressable style prop)
- Never use default OS button styles
- Primary: gold bg, dark text, rounded corners (RADIUS.md)
- Secondary: transparent with border

**Cards:**
- Always have subtle border (COLORS.border)
- Rounded corners (RADIUS.lg)
- Never flat — use card/card2 surface colours for depth

**Inputs:**
- Dark input background (COLORS.input)
- Subtle border, rounded
- Never use default white inputs

**Lists:**
- Always FlashList
- Pull to refresh
- Skeleton loading, never spinners on dark backgrounds

**General:**
- No default OS styling should be visible anywhere
- Every interactive element needs a press state
- Spacing should feel generous, not cramped
- Icons should be thin/line style, not filled/chunky emoji

---

## The Feeling We Are Building Towards

Every interaction in Dawat should feel like a premium iPhone app.
The scroll should feel like butter. The transitions should feel springy.
The copy should feel warm and human. The themes should feel beautiful.

When in doubt, ask: "Does this feel like Partiful, but for a Muslim community?"
If the answer is no, fix it before moving on.

---

*"The Ummah is one body. When one part suffers, the rest responds."*
*Dawat is how we show up for each other — digitally, beautifully, together.*

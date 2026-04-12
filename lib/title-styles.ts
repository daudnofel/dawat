/**
 * Title style system (DAW-56).
 *
 * Six visually distinct typography presets that hosts can apply to their
 * event title. Each style defines a font family (loaded in _layout.tsx),
 * weight, letter spacing, size factor, and a vibe label shown in the
 * picker. The preview renders the chosen style live via `getTitleStyle()`.
 *
 * Fonts loaded:
 *   ManropeSemiBold    — @expo-google-fonts/manrope (already loaded)
 *   PlayfairDisplay    — @expo-google-fonts/playfair-display
 *   SpaceGrotesk       — @expo-google-fonts/space-grotesk
 *   Lora               — @expo-google-fonts/lora
 *   JetBrainsMono      — @expo-google-fonts/jetbrains-mono
 *   DancingScript      — @expo-google-fonts/dancing-script
 */

import { TextStyle } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────

export type TitleStyleId =
  | 'classic'
  | 'editorial'
  | 'eclectic'
  | 'literary'
  | 'digital'
  | 'script';

export interface TitleStyleDef {
  id: TitleStyleId;
  /** Human-readable name shown in the picker */
  label: string;
  /** Short tagline shown under the label */
  vibe: string;
  /** The `fontFamily` value exactly matching the key used in `useFonts()` */
  fontFamily: string;
  /** React Native fontWeight */
  fontWeight: TextStyle['fontWeight'];
  /** Letter spacing in px */
  letterSpacing: number;
  /**
   * Multiplier applied to the base title font size (32).
   * Allows certain fonts to feel optically balanced — e.g. script fonts
   * read better slightly larger, monospace slightly smaller.
   */
  sizeFactor: number;
  /** Optional text transform */
  textTransform?: TextStyle['textTransform'];
}

// ─── Definitions ──────────────────────────────────────────────────────

export const TITLE_STYLES: TitleStyleDef[] = [
  {
    id: 'classic',
    label: 'Classic',
    vibe: 'Clean & modern',
    fontFamily: 'ManropeSemiBold',
    fontWeight: '600',
    letterSpacing: -0.5,
    sizeFactor: 1,
  },
  {
    id: 'editorial',
    label: 'Editorial',
    vibe: 'Elegant magazine',
    fontFamily: 'PlayfairDisplay',
    fontWeight: '700',
    letterSpacing: -0.3,
    sizeFactor: 1.05,
  },
  {
    id: 'eclectic',
    label: 'Eclectic',
    vibe: 'Trendy & bold',
    fontFamily: 'SpaceGrotesk',
    fontWeight: '500',
    letterSpacing: 1.0,
    sizeFactor: 0.95,
    textTransform: 'uppercase',
  },
  {
    id: 'literary',
    label: 'Literary',
    vibe: 'Bookish & serene',
    fontFamily: 'Lora',
    fontWeight: '400',
    letterSpacing: 0.5,
    sizeFactor: 1.0,
  },
  {
    id: 'digital',
    label: 'Digital',
    vibe: 'Tech & modern',
    fontFamily: 'JetBrainsMono',
    fontWeight: '700',
    letterSpacing: 0,
    sizeFactor: 0.85,
  },
  {
    id: 'script',
    label: 'Script',
    vibe: 'Mehndi & walima',
    fontFamily: 'DancingScript',
    fontWeight: '700',
    letterSpacing: 0,
    sizeFactor: 1.15,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

const STYLE_MAP = new Map(TITLE_STYLES.map((s) => [s.id, s]));

/** Look up a title style by ID. Returns 'classic' as fallback. */
export function getTitleStyleDef(id: TitleStyleId | string | null | undefined): TitleStyleDef {
  return STYLE_MAP.get(id as TitleStyleId) ?? STYLE_MAP.get('classic')!;
}

const BASE_TITLE_SIZE = 32;

/**
 * Returns a ready-to-spread `TextStyle` for the given title style ID.
 * Use in EventPreview: `<Text style={[styles.title, getTitleTextStyle(draft.title_style)]}>`
 */
export function getTitleTextStyle(id: TitleStyleId | string | null | undefined): TextStyle {
  const def = getTitleStyleDef(id);
  return {
    fontFamily: def.fontFamily,
    fontWeight: def.fontWeight,
    letterSpacing: def.letterSpacing,
    fontSize: Math.round(BASE_TITLE_SIZE * def.sizeFactor),
    ...(def.textTransform ? { textTransform: def.textTransform } : {}),
  };
}

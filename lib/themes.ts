import { DawatTheme } from '../types';

// =============================================================
// DAW-22 Phase 2 — Theme enrichment
// -------------------------------------------------------------
// Every theme is authored with the legacy fields (bannerBgImage,
// accentColor, etc.) and then automatically enriched at export time
// with a full design token bundle — background gradient stops,
// accents, surface, typography. Individual themes can override
// any token; the helper only fills in what's missing.
// =============================================================

export const THEME_CATEGORIES = [
  'Trending', 'Ramadan', 'Eid', 'Sisters', 'Brothers',
  'Family', 'Nikah', 'Iftar', 'Scholars', 'Minimal',
  'Eclectic', 'Elegant', 'Community',
] as const;

const RAW_THEMES: DawatTheme[] = [
  {
    id: 'ramadan_kareem',
    name: 'Ramadan Kareem',
    categories: ['Trending', 'Ramadan'],
    bannerBg: '#0A1628',
    bannerBgImage: 'linear-gradient(135deg, #0A1628 0%, #1A2744 50%, #0D1B33 100%)',
    accentColor: '#C9A84C',
    textColor: '#FFFFFF',
    tagBg: '#1A2744',
    tagColor: '#C9A84C',
    defaultEmoji: '🌙',
    // DAW-57 — arabesque + grain for a serene spiritual feel
    background: { pattern: 'arabesque', overlayOpacity: 0.07, texture: 'grain', textureOpacity: 0.04 },
  },
  {
    id: 'eid_gala',
    name: 'Eid Gala',
    categories: ['Trending', 'Eid'],
    bannerBg: '#0D0D0D',
    bannerBgImage: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 40%, #2A1F0A 100%)',
    accentColor: '#F0C040',
    textColor: '#FFFFFF',
    tagBg: '#2A1F0A',
    tagColor: '#F0C040',
    defaultEmoji: '✨',
    // DAW-57 — geometric stars for a festive celebratory feel
    background: { pattern: 'geometric-stars', overlayOpacity: 0.06, texture: 'grain', textureOpacity: 0.03 },
  },
  {
    id: 'iftar_party',
    name: 'Iftar Party',
    categories: ['Trending', 'Iftar'],
    bannerBg: '#2A1505',
    bannerBgImage: 'linear-gradient(135deg, #2A1505 0%, #4A2810 50%, #3A1A08 100%)',
    accentColor: '#F59E0B',
    textColor: '#FFFFFF',
    tagBg: '#4A2810',
    tagColor: '#F59E0B',
    defaultEmoji: '🏮',
  },
  {
    id: 'sisters_halaqa',
    name: 'Sisters Halaqa',
    categories: ['Sisters', 'Trending'],
    bannerBg: '#1A0A1E',
    bannerBgImage: 'linear-gradient(135deg, #1A0A1E 0%, #2D1233 50%, #3D1544 100%)',
    accentColor: '#D4A0D9',
    textColor: '#FFFFFF',
    tagBg: '#2D1233',
    tagColor: '#D4A0D9',
    defaultEmoji: '🌸',
    background: { pattern: 'arabesque', overlayOpacity: 0.06, texture: 'grain', textureOpacity: 0.04 },
  },
  {
    id: 'nikah',
    name: 'Nikah Invitation',
    categories: ['Nikah', 'Elegant'],
    bannerBg: '#F5F0E8',
    bannerBgImage: 'linear-gradient(135deg, #F5F0E8 0%, #EDE5D5 50%, #E8DCCA 100%)',
    accentColor: '#8B6914',
    textColor: '#2C1810',
    tagBg: '#E8DCCA',
    tagColor: '#8B6914',
    defaultEmoji: '💍',
    background: { pattern: 'zellige', overlayOpacity: 0.05, texture: 'paper', textureOpacity: 0.06 },
  },
  {
    id: 'masjid_event',
    name: 'Masjid Event',
    categories: ['Community', 'Trending'],
    bannerBg: '#0A2218',
    bannerBgImage: 'linear-gradient(135deg, #0A2218 0%, #0F3325 50%, #144430 100%)',
    accentColor: '#4CAF50',
    textColor: '#FFFFFF',
    tagBg: '#0F3325',
    tagColor: '#4CAF50',
    defaultEmoji: '🕌',
    background: { pattern: 'geometric-stars', overlayOpacity: 0.07, texture: 'grain', textureOpacity: 0.03 },
  },
  {
    id: 'arabic_nights',
    name: 'Arabic Nights',
    categories: ['Trending', 'Elegant'],
    bannerBg: '#1A1005',
    bannerBgImage: 'linear-gradient(135deg, #1A1005 0%, #2A1A08 50%, #3A2A10 100%)',
    accentColor: '#C9A84C',
    textColor: '#FFFFFF',
    tagBg: '#2A1A08',
    tagColor: '#C9A84C',
    defaultEmoji: '🪔',
    background: { pattern: 'zellige', overlayOpacity: 0.06, texture: 'paper', textureOpacity: 0.05 },
  },
  {
    id: 'desert_sunset',
    name: 'Desert Sunset',
    categories: ['Eclectic', 'Trending'],
    bannerBg: '#1A0A05',
    bannerBgImage: 'linear-gradient(180deg, #4A1A08 0%, #8B3A15 40%, #C96830 70%, #E8A060 100%)',
    accentColor: '#E8A060',
    textColor: '#FFFFFF',
    tagBg: '#4A1A08',
    tagColor: '#E8A060',
    defaultEmoji: '🌅',
  },
  {
    id: 'brothers_night',
    name: 'Brothers Night',
    categories: ['Brothers'],
    bannerBg: '#050A1A',
    bannerBgImage: 'linear-gradient(135deg, #050A1A 0%, #0A1433 50%, #102050 100%)',
    accentColor: '#60A5FA',
    textColor: '#FFFFFF',
    tagBg: '#0A1433',
    tagColor: '#60A5FA',
    defaultEmoji: '💪',
  },
  {
    id: 'laylatul_qadr',
    name: 'Laylatul Qadr',
    categories: ['Ramadan', 'Elegant'],
    bannerBg: '#0D0520',
    bannerBgImage: 'linear-gradient(180deg, #0D0520 0%, #1A0A3A 40%, #2A1055 100%)',
    accentColor: '#D4A0FF',
    textColor: '#FFFFFF',
    tagBg: '#1A0A3A',
    tagColor: '#D4A0FF',
    defaultEmoji: '⭐',
    background: { pattern: 'arabesque', overlayOpacity: 0.05 },
  },
  {
    id: 'family_picnic',
    name: 'Family Picnic',
    categories: ['Family', 'Community'],
    bannerBg: '#1A1A08',
    bannerBgImage: 'linear-gradient(180deg, #87CEEB 0%, #90EE90 60%, #228B22 100%)',
    accentColor: '#2E7D32',
    textColor: '#FFFFFF',
    tagBg: '#2E7D32',
    tagColor: '#FFFFFF',
    defaultEmoji: '🌳',
  },
  {
    id: 'scholar_talk',
    name: 'Scholar Talk',
    categories: ['Scholars', 'Community'],
    bannerBg: '#0A1A0A',
    bannerBgImage: 'linear-gradient(135deg, #0A1A0A 0%, #133313 50%, #1A4A1A 100%)',
    accentColor: '#81C784',
    textColor: '#FFFFFF',
    tagBg: '#133313',
    tagColor: '#81C784',
    defaultEmoji: '📚',
  },
  {
    id: 'geometric_blue',
    name: 'Geometric Blue',
    categories: ['Elegant', 'Minimal'],
    bannerBg: '#050A1A',
    bannerBgImage: 'linear-gradient(135deg, #050A1A 0%, #0D1833 50%, #152550 100%)',
    accentColor: '#4A90D9',
    textColor: '#FFFFFF',
    tagBg: '#0D1833',
    tagColor: '#4A90D9',
    defaultEmoji: '🔷',
  },
  {
    id: 'islamic_stars',
    name: 'Islamic Stars',
    categories: ['Elegant', 'Eid'],
    bannerBg: '#0D0D0D',
    bannerBgImage: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 50%, #252525 100%)',
    accentColor: '#C9A84C',
    textColor: '#FFFFFF',
    tagBg: '#1A1A1A',
    tagColor: '#C9A84C',
    defaultEmoji: '⭐',
    background: { pattern: 'geometric-stars', overlayOpacity: 0.10, texture: 'grain', textureOpacity: 0.04 },
  },
  {
    id: 'walima',
    name: 'Walima',
    categories: ['Nikah', 'Elegant'],
    bannerBg: '#1A0A0F',
    bannerBgImage: 'linear-gradient(135deg, #1A0A0F 0%, #3A1520 50%, #4A1A2A 100%)',
    accentColor: '#E8A0B0',
    textColor: '#FFFFFF',
    tagBg: '#3A1520',
    tagColor: '#E8A0B0',
    defaultEmoji: '🌹',
    background: { pattern: 'arabesque', overlayOpacity: 0.05, texture: 'paper', textureOpacity: 0.05 },
  },
  {
    id: 'hajj_journey',
    name: 'Hajj Journey',
    categories: ['Community', 'Scholars'],
    bannerBg: '#0D0D05',
    bannerBgImage: 'linear-gradient(180deg, #0D0D05 0%, #1A1A0A 40%, #2A2510 100%)',
    accentColor: '#C9A84C',
    textColor: '#FFFFFF',
    tagBg: '#1A1A0A',
    tagColor: '#C9A84C',
    defaultEmoji: '🕋',
  },
  {
    id: 'minimal_crescent',
    name: 'Minimal Crescent',
    categories: ['Minimal', 'Elegant'],
    bannerBg: '#F5F0E8',
    bannerBgImage: 'linear-gradient(135deg, #F5F0E8 0%, #EDE5D5 100%)',
    accentColor: '#1A1A1A',
    textColor: '#1A1A1A',
    tagBg: '#E0D8C8',
    tagColor: '#1A1A1A',
    defaultEmoji: '🌙',
  },
  {
    id: 'eid_adha',
    name: 'Eid ul-Adha',
    categories: ['Eid', 'Family'],
    bannerBg: '#0A1A0A',
    bannerBgImage: 'linear-gradient(135deg, #0A1A0A 0%, #0F2E0F 50%, #154015 100%)',
    accentColor: '#66BB6A',
    textColor: '#FFFFFF',
    tagBg: '#0F2E0F',
    tagColor: '#66BB6A',
    defaultEmoji: '🐑',
  },
  {
    id: 'dark_ramadan',
    name: 'Dark Ramadan',
    categories: ['Ramadan', 'Eclectic'],
    bannerBg: '#0A0515',
    bannerBgImage: 'linear-gradient(180deg, #0A0515 0%, #150A25 50%, #1A0F30 100%)',
    accentColor: '#B388FF',
    textColor: '#FFFFFF',
    tagBg: '#150A25',
    tagColor: '#B388FF',
    defaultEmoji: '🌌',
    background: { pattern: 'arabesque', overlayOpacity: 0.06, texture: 'grain', textureOpacity: 0.04 },
  },
  {
    id: 'ornate_invitation',
    name: 'Ornate Invitation',
    categories: ['Elegant', 'Nikah'],
    bannerBg: '#F8F3E8',
    bannerBgImage: 'linear-gradient(135deg, #F8F3E8 0%, #F0E8D5 50%, #E8DDCA 100%)',
    accentColor: '#8B6914',
    textColor: '#2C1810',
    tagBg: '#E8DDCA',
    tagColor: '#8B6914',
    defaultEmoji: '📜',
    background: { pattern: 'zellige', overlayOpacity: 0.04, texture: 'paper', textureOpacity: 0.05 },
  },

  // ─── Light themes ────────────────────────────────────────────
  {
    id: 'cream_elegance',
    name: 'Cream Elegance',
    categories: ['Elegant', 'Trending'],
    bannerBg: '#FAF6F0',
    bannerBgImage: 'linear-gradient(180deg, #FAF6F0 0%, #F0E8D8 50%, #E8DCC8 100%)',
    accentColor: '#8B6914',
    textColor: '#1A1510',
    tagBg: '#E8DCC8',
    tagColor: '#8B6914',
    defaultEmoji: '✨',
  },
  {
    id: 'sky_blue',
    name: 'Sky Blue',
    categories: ['Community', 'Trending'],
    bannerBg: '#EAF4FB',
    bannerBgImage: 'linear-gradient(180deg, #EAF4FB 0%, #D4E9F7 50%, #C0DEF3 100%)',
    accentColor: '#1A5276',
    textColor: '#0D1B2A',
    tagBg: '#C0DEF3',
    tagColor: '#1A5276',
    defaultEmoji: '☀️',
  },
  {
    id: 'blush_rose',
    name: 'Blush Rose',
    categories: ['Sisters', 'Nikah', 'Trending'],
    bannerBg: '#FBF0F0',
    bannerBgImage: 'linear-gradient(180deg, #FBF0F0 0%, #F5E0E0 50%, #F0D0D5 100%)',
    accentColor: '#8B2252',
    textColor: '#2A0F1A',
    tagBg: '#F0D0D5',
    tagColor: '#8B2252',
    defaultEmoji: '🌸',
  },
  {
    id: 'sage_garden',
    name: 'Sage Garden',
    categories: ['Family', 'Community'],
    bannerBg: '#F0F5F0',
    bannerBgImage: 'linear-gradient(180deg, #F0F5F0 0%, #DCE8DC 50%, #C8DCC8 100%)',
    accentColor: '#2D5A27',
    textColor: '#0F1A0F',
    tagBg: '#C8DCC8',
    tagColor: '#2D5A27',
    defaultEmoji: '🌿',
  },
  {
    id: 'lavender_mist',
    name: 'Lavender Mist',
    categories: ['Sisters', 'Elegant'],
    bannerBg: '#F3F0FB',
    bannerBgImage: 'linear-gradient(180deg, #F3F0FB 0%, #E5DFF5 50%, #D8D0F0 100%)',
    accentColor: '#5B3E96',
    textColor: '#1A1028',
    tagBg: '#D8D0F0',
    tagColor: '#5B3E96',
    defaultEmoji: '💜',
  },
];

// ─── Enrichment helpers ──────────────────────────────────────

/**
 * Parse hex color stops out of a CSS-style linear-gradient() string.
 * Returns the hex values in order.
 */
function parseGradientStops(css: string): string[] {
  const matches = css.match(/#[0-9A-Fa-f]{6}/g);
  return matches ?? [];
}

/**
 * Parse the angle from a gradient string. Defaults to 135 if not found.
 */
function parseGradientAngle(css: string): number {
  const m = css.match(/(-?\d+)deg/);
  return m ? parseInt(m[1], 10) : 135;
}

/**
 * Convert hex to RGB [0-255].
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

/**
 * Relative luminance (0..1) per WCAG.
 */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Compute a readable foreground color ('#FFFFFF' | '#0D0D0D') for a given bg hex.
 */
function contrastFg(bg: string): string {
  return luminance(bg) > 0.5 ? '#0D0D0D' : '#FFFFFF';
}

/**
 * Append an rgba-style alpha suffix to a hex color by converting it
 * to rgba(). Returns e.g. "rgba(201, 168, 76, 0.18)".
 */
function hexWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Mix two hex colors. `weight2` is how much of hex2 ends up in the
 * result (0 = pure hex1, 1 = pure hex2). Used to tint the dark page
 * background with a theme's accent color.
 */
function mixHex(hex1: string, hex2: string, weight2: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = Math.round(r1 * (1 - weight2) + r2 * weight2);
  const g = Math.round(g1 * (1 - weight2) + g2 * weight2);
  const b = Math.round(b1 * (1 - weight2) + b2 * weight2);
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Mix a theme accent into a base hex and return an rgba() string at
 * the given alpha. Used to build the tinted glass background for
 * EventCard surfaces.
 */
function rgbaMix(baseHex: string, tintHex: string, tintWeight: number, alpha: number): string {
  const mixed = mixHex(baseHex, tintHex, tintWeight);
  const [r, g, b] = hexToRgb(mixed);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// App base surfaces from lib/theme.ts (kept in sync by hand — these
// are the only hardcoded hex values here, because importing from
// lib/theme would create a circular dep.)
const APP_DARK = '#0D0D0D';
const APP_CARD = '#161616';

/**
 * Fill in any missing design-token fields on a theme from its legacy
 * fields. Themes that already define a token keep their override.
 */
/**
 * DAW-58 — art-directed title style defaults per theme.
 * When a host selects a theme, the editor auto-applies the suggested
 * title style (unless the host already manually chose one).
 *
 * Mapping logic:
 *   Nikah / Walima / Ornate / Blush     → 'script'  (calligraphic, ceremonial)
 *   Ramadan / Laylatul Qadr / Halaqa    → 'literary' (serene, scholarly)
 *   Eid / Arabic Nights / Hajj / Adha   → 'editorial' (elegant, magazine)
 *   Brothers / Geometric / Sky Blue     → 'digital'  (tech, modern)
 *   Desert / Family / Sage / Lavender   → 'eclectic' (trendy, bold)
 *   Everything else                     → 'classic'  (clean default)
 */
const DEFAULT_TITLE_STYLE_MAP: Record<string, string> = {
  // Script — ceremonial, calligraphic
  nikah: 'script',
  walima: 'script',
  ornate_invitation: 'script',
  blush_rose: 'script',
  // Literary — serene, scholarly
  ramadan_kareem: 'literary',
  dark_ramadan: 'literary',
  laylatul_qadr: 'literary',
  sisters_halaqa: 'literary',
  scholar_talk: 'literary',
  // Editorial — elegant, magazine
  eid_gala: 'editorial',
  eid_adha: 'editorial',
  arabic_nights: 'editorial',
  hajj_journey: 'editorial',
  cream_elegance: 'editorial',
  islamic_stars: 'editorial',
  // Digital — tech, modern
  brothers_night: 'digital',
  geometric_blue: 'digital',
  sky_blue: 'digital',
  // Eclectic — trendy, bold
  desert_sunset: 'eclectic',
  family_picnic: 'eclectic',
  sage_garden: 'eclectic',
  lavender_mist: 'eclectic',
  // Classic — clean default (everything not listed)
  iftar_party: 'classic',
  masjid_event: 'classic',
  minimal_crescent: 'classic',
};

function enrichTheme(t: DawatTheme): DawatTheme {
  const stops = parseGradientStops(t.bannerBgImage);
  const angle = parseGradientAngle(t.bannerBgImage);
  const isLight = luminance(t.bannerBg) > 0.5;

  // DAW-57: merge pattern/texture overrides on top of the generated base
  // rather than using ?? which would skip the merge entirely.
  const baseBackground = {
    type: 'gradient' as const,
    stops: stops.length >= 2 ? stops : [t.bannerBg, t.bannerBg],
    angle,
  };

  return {
    ...t,
    // DAW-58: apply art-directed title style default if not set on the raw theme
    defaultTitleStyle: t.defaultTitleStyle ?? DEFAULT_TITLE_STYLE_MAP[t.id] ?? 'classic',
    background: { ...baseBackground, ...(t.background ?? {}) },
    typography: t.typography ?? {
      titleFont: 'ManropeExtraBold',
      titleLetterSpacing: -0.5,
    },
    accents: t.accents ?? {
      primary: t.accentColor,
      secondary: hexWithAlpha(t.accentColor, 0.25),
      onAccent: contrastFg(t.accentColor),
    },
    surface: t.surface ?? {
      bg: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(30, 30, 30, 0.55)',
      border: hexWithAlpha(t.accentColor, 0.18),
      borderRadius: 22,

      // DAW-22 Phase 2 — theme-tinted surfaces
      // Whole event detail page: 15% accent tint on the app's dark base.
      // Still dark enough to keep the app chrome cohesive but each event
      // page is now visibly differentiated.
      pageBg: mixHex(APP_DARK, t.accentColor, 0.15),

      // EventCard glass: 25% accent tint on the card base, 0.55 alpha so
      // the BlurView still reads as glass. Cards in the feed now each
      // carry their theme's chromatic signature.
      cardBg: rgbaMix(APP_CARD, t.accentColor, 0.25, 0.55),
    },
  };
}

/**
 * The public, fully-enriched themes array. Consumers import THIS,
 * never RAW_THEMES.
 */
export const THEMES: DawatTheme[] = RAW_THEMES.map(enrichTheme);

export function getThemeById(id: string): DawatTheme | undefined {
  return THEMES.find((t) => t.id === id);
}

export function getThemesByCategory(category: string): DawatTheme[] {
  if (category === 'Trending') {
    return THEMES.filter((t) => t.categories.includes('Trending'));
  }
  return THEMES.filter((t) => t.categories.includes(category));
}

// =============================================================
// Dawat — Design Tokens
// Import from here in every component. Never hardcode values.
// =============================================================

export const COLORS = {
  // Brand — DESIGN.md "Restrained Luxury" champagne gold
  gold: '#FFDFA1',          // primary — brand accent, logo, high-value interactions
  gold2: '#E6C27A',         // primary-container — CTAs, metallic gradient end
  orange: '#B8A880',

  // Surfaces — DESIGN.md tonal layering (no hard borders)
  dark: '#131313',           // surface-dim — page background
  card: '#1C1B1B',           // surface-container-low — card surface
  card2: '#2A2A2A',          // surface-container-high — elevated elements
  border: '#4D4639',         // outline-variant — ghost borders only at 20% opacity
  input: '#0E0E0E',          // surface-container-lowest — input wells

  // Text — warm whites per DESIGN.md
  white: '#E5E2E1',          // on-surface — primary text (warm, not clinical)
  muted: '#D0C5B4',          // on-surface-variant — secondary metadata
  hint: '#555555',           // tertiary / placeholder

  // Semantic
  green: '#4CAF50',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#A855F7',
  blue: '#60A5FA',
  teal: '#14B8A6',

  // Surface utilities
  surfaceVariant: '#353534', // glass fills at 30% opacity
  ghostBorder: '#4D463933',  // outline-variant at 20% — "light catching glass edge"
} as const;

export const FONTS = {
  bold: { fontWeight: '700' as const },
  semibold: { fontWeight: '600' as const },
  medium: { fontWeight: '500' as const },
  regular: { fontWeight: '400' as const },
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

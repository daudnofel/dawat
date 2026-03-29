// =============================================================
// Dawat — Design Tokens
// Import from here in every component. Never hardcode values.
// =============================================================

export const COLORS = {
  // Brand
  gold: '#E8A0B0',
  gold2: '#F0B8C8',
  orange: '#C47888',

  // Surfaces
  dark: '#0F0A0C',
  card: '#1A1215',
  card2: '#241A1E',
  border: '#3A2830',
  input: '#16101310',

  // Text
  white: '#FFFFFF',
  muted: '#888888',
  hint: '#555555',

  // Semantic
  green: '#4CAF50',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#A855F7',
  blue: '#60A5FA',
  teal: '#14B8A6',
} as const;

export const FONTS = {
  bold: { fontWeight: '900' as const },
  semibold: { fontWeight: '700' as const },
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

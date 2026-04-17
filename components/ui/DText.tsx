// components/ui/DText.tsx
// Dawat text primitive — 7 semantic variants that map to the design system.
// Usage: <DText variant="headline">Title</DText>

import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../lib/theme';

export type DTextVariant =
  | 'headline'    // 28pt bold — page titles, event names
  | 'subhead'     // 20pt semibold — section headings
  | 'label'       // 14pt semibold — form labels, chip text
  | 'body'        // 16pt regular — description, paragraphs
  | 'meta'        // 13pt medium — dates, locations, metadata
  | 'hint'        // 12pt regular — placeholders, captions
  | 'kicker';     // 11pt semibold uppercase — category labels

interface DTextProps extends TextProps {
  variant?: DTextVariant;
  color?: string;
}

export default function DText({
  variant = 'body',
  color,
  style,
  ...props
}: DTextProps) {
  return (
    <Text
      style={[
        styles[variant],
        color ? { color } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 28,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: -0.5,
  },
  subhead: {
    fontSize: 20,
    color: COLORS.white,
    ...FONTS.semibold,
  },
  label: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semibold,
  },
  body: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.regular,
    lineHeight: 24,
  },
  meta: {
    fontSize: 13,
    color: COLORS.muted,
    ...FONTS.medium,
  },
  hint: {
    fontSize: 12,
    color: COLORS.hint,
    ...FONTS.regular,
  },
  kicker: {
    fontSize: 11,
    color: COLORS.gold,
    ...FONTS.semibold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

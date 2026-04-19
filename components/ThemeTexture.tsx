/**
 * ThemeTexture — subtle noise/grain overlay for theme surface depth (DAW-57).
 *
 * Renders a scattered dot field via SVG to simulate film grain or paper
 * texture. This is a lightweight programmatic approach — no bundled PNG
 * asset needed. The dots are deterministically placed via a simple hash
 * so the texture is consistent across renders.
 *
 * Opacity should be kept very low (0.03–0.10) — the texture should be
 * felt more than seen.
 */

import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export type TextureType = 'grain' | 'paper';

interface ThemeTextureProps {
  /** Which texture variant. 'grain' is finer; 'paper' is coarser. */
  type: TextureType;
  /** Hex color for the noise dots. */
  color: string;
  /** Opacity of the overlay. Keep 0.03–0.10. */
  opacity: number;
}

// Deterministic pseudo-random from seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface Dot {
  cx: number;
  cy: number;
  r: number;
}

function generateDots(type: TextureType): Dot[] {
  const count = type === 'grain' ? 200 : 80;
  const maxR = type === 'grain' ? 1.2 : 2.5;
  const minR = type === 'grain' ? 0.3 : 0.8;
  const viewSize = 120;
  const dots: Dot[] = [];

  for (let i = 0; i < count; i++) {
    const cx = seededRandom(i * 3 + 1) * viewSize;
    const cy = seededRandom(i * 3 + 2) * viewSize;
    const r = minR + seededRandom(i * 3 + 3) * (maxR - minR);
    dots.push({ cx, cy, r });
  }
  return dots;
}

const GRAIN_DOTS = generateDots('grain');
const PAPER_DOTS = generateDots('paper');

function ThemeTextureImpl({
  type,
  color,
  opacity,
}: ThemeTextureProps) {
  const dots = type === 'grain' ? GRAIN_DOTS : PAPER_DOTS;

  // Memoize SVG ID to avoid collisions if multiple textures render
  const patternId = useMemo(() => `dawat-tex-${type}`, [type]);

  return (
    <Svg
      width="100%"
      height="100%"
      style={[StyleSheet.absoluteFill, { opacity }]}
      pointerEvents="none"
      viewBox="0 0 120 120"
    >
      {dots.map((dot, i) => (
        <Circle
          key={`${patternId}-${i}`}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={color}
          opacity={0.4 + seededRandom(i * 7) * 0.6}
        />
      ))}
    </Svg>
  );
}

// Memo so unrelated re-renders (audience tap, etc.) don't redraw the
// 200-circle SVG noise pattern.
export default React.memo(ThemeTextureImpl);

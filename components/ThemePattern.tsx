/**
 * ThemePattern — tiling SVG Islamic geometric overlay (DAW-57).
 *
 * Three pattern families that render as semi-transparent overlays on top
 * of the theme gradient, positioned absolutely to fill the parent. Each
 * is a repeating SVG `<pattern>` element tiling across the full surface.
 *
 * Patterns:
 *   geometric-stars — 8-pointed star tessellation (classic Islamic geometry)
 *   arabesque       — interlocking curved petal/vine motif
 *   zellige         — Moroccan mosaic diamond grid
 *
 * Color is the theme's text color at a controlled opacity (typically 0.05–0.15)
 * so patterns subtly appear without competing with the title or poster.
 * `pointerEvents="none"` keeps the overlay non-interactive.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, Path, Circle } from 'react-native-svg';

export type PatternId = 'geometric-stars' | 'arabesque' | 'zellige';

interface ThemePatternProps {
  /** Which pattern to render. */
  pattern: PatternId;
  /** Hex color for the pattern strokes (usually the theme's textColor). */
  color: string;
  /** Opacity of the entire overlay. Keep between 0.03 and 0.20. */
  opacity: number;
  /** Width in px. Defaults to 100%. */
  width?: number | string;
  /** Height in px. Defaults to 100%. */
  height?: number | string;
}

// ─── Pattern tile sizes ───────────────────────────────────────────────

const GEO_TILE = 48;
const ARABESQUE_TILE = 56;
const ZELLIGE_TILE = 40;

// ─── SVG path data for each pattern ───────────────────────────────────

/**
 * 8-pointed star: a simplified version of the classic khatam pattern.
 * Two overlapping squares rotated 45° inscribed in a circle.
 */
function GeometricStarTile({ color }: { color: string }) {
  const s = GEO_TILE;
  const c = s / 2;
  const r = s * 0.38;
  // 8-pointed star via two rotated squares
  const sq1 = `M ${c} ${c - r} L ${c + r} ${c} L ${c} ${c + r} L ${c - r} ${c} Z`;
  const off = r * 0.707; // sin(45°)
  const sq2 = `M ${c - off} ${c - off} L ${c + off} ${c - off} L ${c + off} ${c + off} L ${c - off} ${c + off} Z`;
  return (
    <>
      <Path d={sq1} fill="none" stroke={color} strokeWidth={0.8} />
      <Path d={sq2} fill="none" stroke={color} strokeWidth={0.8} />
      <Circle cx={c} cy={c} r={r * 0.3} fill="none" stroke={color} strokeWidth={0.5} />
    </>
  );
}

/**
 * Arabesque: interlocking S-curves forming a petal/vine motif.
 */
function ArabesqueTile({ color }: { color: string }) {
  const s = ARABESQUE_TILE;
  const h = s / 2;
  // Two mirrored quadratic Bézier curves creating a petal shape
  const petal = `M 0 ${h} Q ${h * 0.5} 0, ${h} 0 Q ${s} 0, ${s} ${h} Q ${s} ${s}, ${h} ${s} Q 0 ${s}, 0 ${h} Z`;
  // Inner diamond detail
  const inner = `M ${h} ${h * 0.4} L ${h + h * 0.3} ${h} L ${h} ${h + h * 0.3} L ${h - h * 0.3} ${h} Z`;
  return (
    <>
      <Path d={petal} fill="none" stroke={color} strokeWidth={0.7} />
      <Path d={inner} fill="none" stroke={color} strokeWidth={0.5} />
    </>
  );
}

/**
 * Zellige: Moroccan mosaic diamonds forming a lattice grid.
 */
function ZelligeTile({ color }: { color: string }) {
  const s = ZELLIGE_TILE;
  const h = s / 2;
  // Diamond outline
  const diamond = `M ${h} 0 L ${s} ${h} L ${h} ${s} L 0 ${h} Z`;
  // Inner cross lines
  const cross = `M ${h} ${h * 0.35} L ${h} ${s - h * 0.35} M ${h * 0.35} ${h} L ${s - h * 0.35} ${h}`;
  return (
    <>
      <Path d={diamond} fill="none" stroke={color} strokeWidth={0.8} />
      <Path d={cross} fill="none" stroke={color} strokeWidth={0.5} />
    </>
  );
}

function getTileSize(pattern: PatternId): number {
  switch (pattern) {
    case 'geometric-stars':
      return GEO_TILE;
    case 'arabesque':
      return ARABESQUE_TILE;
    case 'zellige':
      return ZELLIGE_TILE;
  }
}

function TileContent({ pattern, color }: { pattern: PatternId; color: string }) {
  switch (pattern) {
    case 'geometric-stars':
      return <GeometricStarTile color={color} />;
    case 'arabesque':
      return <ArabesqueTile color={color} />;
    case 'zellige':
      return <ZelligeTile color={color} />;
  }
}

export default function ThemePattern({
  pattern,
  color,
  opacity,
  width = '100%',
  height = '100%',
}: ThemePatternProps) {
  const tile = getTileSize(pattern);
  const patternId = `dawat-pattern-${pattern}`;

  return (
    <Svg
      width={width}
      height={height}
      style={[StyleSheet.absoluteFill, { opacity }]}
      pointerEvents="none"
    >
      <Defs>
        <Pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={tile}
          height={tile}
        >
          <TileContent pattern={pattern} color={color} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
    </Svg>
  );
}

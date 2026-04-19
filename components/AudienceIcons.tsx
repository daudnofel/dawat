/**
 * AudienceIcons — shared SVG icon set for the four GenderMode options.
 *
 * Used by both the Audience tool sheet (2×2 grid cards) and the Essentials
 * sheet (horizontal pills). Each icon takes an `active` prop that controls
 * its stroke color (gold when selected, muted white otherwise) and a
 * `size` prop in pt.
 *
 * Stroke style matches the rest of the app's chrome (1.6–1.8 width, line
 * caps round, no fill).
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../lib/theme';

export interface AudienceIconProps {
  active: boolean;
  size?: number;
}

const stroke = (active: boolean) =>
  active ? COLORS.gold : 'rgba(255,255,255,0.55)';

export function MixedIcon({ active, size = 32 }: AudienceIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="10" cy="11" r="3.5" stroke={stroke(active)} strokeWidth={1.8} />
      <Circle cx="22" cy="11" r="3.5" stroke={stroke(active)} strokeWidth={1.8} />
      <Path
        d="M3 24V22.5C3 19.46 5.46 17 8.5 17H11.5C12.4 17 13.25 17.21 14 17.59"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M18 17.59C18.75 17.21 19.6 17 20.5 17H23.5C26.54 17 29 19.46 29 22.5V24"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SistersIcon({ active, size = 32 }: AudienceIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 4C12.5 4 10 6.5 10 10C10 11.5 10.5 12.8 11.4 13.8C10 15 9 16.7 9 18.5"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M16 4C19.5 4 22 6.5 22 10C22 11.5 21.5 12.8 20.6 13.8C22 15 23 16.7 23 18.5"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx="16" cy="11" r="3" stroke={stroke(active)} strokeWidth={1.8} />
      <Path
        d="M8 28V25C8 22.79 9.79 21 12 21H20C22.21 21 24 22.79 24 25V28"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BrothersIcon({ active, size = 32 }: AudienceIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="10" r="4" stroke={stroke(active)} strokeWidth={1.8} />
      <Path
        d="M7 28V24C7 20.69 9.69 18 13 18H19C22.31 18 25 20.69 25 24V28"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function FamilyIcon({ active, size = 32 }: AudienceIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="9" cy="9" r="3" stroke={stroke(active)} strokeWidth={1.8} />
      <Circle cx="23" cy="9" r="3" stroke={stroke(active)} strokeWidth={1.8} />
      <Circle cx="16" cy="18" r="2.2" stroke={stroke(active)} strokeWidth={1.6} />
      <Path
        d="M3 22V20.5C3 18.01 5.01 16 7.5 16H10.5C13 16 15 18 15 20.5"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M17 20.5C17 18 19 16 21.5 16H24.5C26.99 16 29 18.01 29 20.5V22"
        stroke={stroke(active)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M11 28V26C11 24.34 12.34 23 14 23H18C19.66 23 21 24.34 21 26V28"
        stroke={stroke(active)}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

import { GenderMode } from '../types';

/**
 * Convenience map so callers can render the right icon for a given mode
 * without repeating the switch statement.
 */
export const AUDIENCE_ICON: Record<
  GenderMode,
  React.ComponentType<AudienceIconProps>
> = {
  [GenderMode.Mixed]: MixedIcon,
  [GenderMode.SistersOnly]: SistersIcon,
  [GenderMode.BrothersOnly]: BrothersIcon,
  [GenderMode.Family]: FamilyIcon,
};

// DAW-61 — thin wrapper that delegates to DBadge. Kept for existing imports.

import { COLORS } from '../lib/theme';
import { GenderMode } from '../types';
import DBadge from './ui/DBadge';

const CONFIG = {
  [GenderMode.Mixed]: { label: 'Mixed', color: COLORS.gold, emoji: '🌟' },
  [GenderMode.SistersOnly]: { label: 'Sisters', color: COLORS.purple, emoji: '🌸' },
  [GenderMode.BrothersOnly]: { label: 'Brothers', color: COLORS.blue, emoji: '💪' },
  [GenderMode.Family]: { label: 'Family', color: COLORS.teal, emoji: '👨‍👩‍👧' },
};

export default function GenderBadge({ mode }: { mode: GenderMode }) {
  const { label, color, emoji } = CONFIG[mode];
  return <DBadge label={label} color={color} emoji={emoji} />;
}

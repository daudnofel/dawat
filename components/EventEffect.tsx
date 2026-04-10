import { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { EffectId } from '../types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Effect definitions ──────────────────────────────────────

interface EffectConfig {
  /** Number of particles */
  count: number;
  /** Emoji or unicode character rendered per particle */
  glyph: string;
  /** Font size range [min, max] */
  sizeRange: [number, number];
  /** Duration range in ms [min, max] — how long one loop takes */
  durationRange: [number, number];
  /** Direction of drift */
  direction: 'down' | 'up';
  /** Horizontal sway amplitude in px */
  swayAmplitude: number;
  /** Base opacity [min, max] */
  opacityRange: [number, number];
}

const EFFECT_CONFIGS: Record<EffectId, EffectConfig> = {
  'rose-petals': {
    count: 14,
    glyph: '🌹',
    sizeRange: [16, 26],
    durationRange: [6000, 12000],
    direction: 'down',
    swayAmplitude: 40,
    opacityRange: [0.35, 0.7],
  },
  lanterns: {
    count: 10,
    glyph: '🏮',
    sizeRange: [18, 28],
    durationRange: [8000, 14000],
    direction: 'up',
    swayAmplitude: 25,
    opacityRange: [0.4, 0.75],
  },
  'gold-sparkles': {
    count: 20,
    glyph: '✦',
    sizeRange: [8, 16],
    durationRange: [2000, 5000],
    direction: 'down',
    swayAmplitude: 10,
    opacityRange: [0.2, 0.8],
  },
  crescents: {
    count: 10,
    glyph: '☪',
    sizeRange: [14, 22],
    durationRange: [7000, 13000],
    direction: 'down',
    swayAmplitude: 30,
    opacityRange: [0.25, 0.55],
  },
  'geometric-rays': {
    count: 12,
    glyph: '◇',
    sizeRange: [10, 20],
    durationRange: [5000, 10000],
    direction: 'down',
    swayAmplitude: 20,
    opacityRange: [0.2, 0.5],
  },
  'date-palms': {
    count: 8,
    glyph: '🌴',
    sizeRange: [20, 30],
    durationRange: [9000, 15000],
    direction: 'down',
    swayAmplitude: 15,
    opacityRange: [0.2, 0.45],
  },
  bubbles: {
    count: 14,
    glyph: '◯',
    sizeRange: [8, 18],
    durationRange: [5000, 10000],
    direction: 'up',
    swayAmplitude: 30,
    opacityRange: [0.15, 0.4],
  },
  'floating-dua': {
    count: 8,
    glyph: '🤲',
    sizeRange: [16, 24],
    durationRange: [8000, 14000],
    direction: 'up',
    swayAmplitude: 20,
    opacityRange: [0.25, 0.5],
  },
};

// The gold sparkle uses a text character, not emoji — give it the gold color
const SPARKLE_COLOR = '#FFDFA1';
const DIAMOND_COLOR = '#C9A84C';
const BUBBLE_COLOR = 'rgba(255, 255, 255, 0.5)';

// ─── Single particle ────────────────────────────────────────

interface ParticleProps {
  config: EffectConfig;
  index: number;
}

function Particle({ config, index }: ParticleProps) {
  const progress = useSharedValue(0);

  // Deterministic random per particle based on index
  const seed = useMemo(() => {
    const s = Math.sin(index * 9301 + 49297) * 233280;
    return {
      x: (s % SCREEN_W),
      delay: (Math.abs(s * 7) % config.durationRange[0]),
      duration: config.durationRange[0] + (Math.abs(s * 13) % (config.durationRange[1] - config.durationRange[0])),
      size: config.sizeRange[0] + (Math.abs(s * 17) % (config.sizeRange[1] - config.sizeRange[0])),
      opacity: config.opacityRange[0] + ((Math.abs(s * 23) % 100) / 100) * (config.opacityRange[1] - config.opacityRange[0]),
    };
  }, [index, config]);

  useEffect(() => {
    progress.value = withDelay(
      seed.delay,
      withRepeat(
        withTiming(1, {
          duration: seed.duration,
          easing: Easing.linear,
        }),
        -1, // infinite
        false,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const t = progress.value;

    const startY = config.direction === 'down' ? -40 : SCREEN_H + 40;
    const endY = config.direction === 'down' ? SCREEN_H + 40 : -40;
    const y = interpolate(t, [0, 1], [startY, endY]);

    // Horizontal sway (sine wave)
    const x = seed.x + Math.sin(t * Math.PI * 2) * config.swayAmplitude;

    // Fade in at start, fade out at end
    const opacity = interpolate(
      t,
      [0, 0.1, 0.85, 1],
      [0, seed.opacity, seed.opacity, 0],
    );

    return {
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      transform: [{ rotate: `${t * 360}deg` }],
    };
  });

  const isTextGlyph = ['✦', '◇', '◯'].includes(config.glyph);

  return (
    <Animated.Text
      style={[
        animStyle,
        {
          fontSize: seed.size,
          color: config.glyph === '✦' ? SPARKLE_COLOR
            : config.glyph === '◇' ? DIAMOND_COLOR
            : config.glyph === '◯' ? BUBBLE_COLOR
            : undefined,
        },
        isTextGlyph && { fontWeight: '300' },
      ]}
    >
      {config.glyph}
    </Animated.Text>
  );
}

// ─── Effect overlay ──────────────────────────────────────────

interface EventEffectProps {
  effectId: EffectId;
}

export default function EventEffect({ effectId }: EventEffectProps) {
  const config = EFFECT_CONFIGS[effectId];
  if (!config) return null;

  const particles = useMemo(
    () => Array.from({ length: config.count }, (_, i) => i),
    [config.count],
  );

  return (
    <Animated.View style={styles.overlay} pointerEvents="none">
      {particles.map((i) => (
        <Particle key={`${effectId}-${i}`} config={config} index={i} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 5,
  },
});

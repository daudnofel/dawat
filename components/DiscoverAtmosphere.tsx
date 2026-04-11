// components/DiscoverAtmosphere.tsx
// Warm radial gold glow behind the Discover header. Extracted from trending.tsx
// in DAW-27 to keep the screen shell thin.

import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { COLORS } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GLOW_HEIGHT = 420;

export default function DiscoverAtmosphere() {
  return (
    <View style={styles.layer} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={GLOW_HEIGHT} style={styles.svg}>
        <Defs>
          <RadialGradient id="discoverGlow" cx="50%" cy="0%" rx="80%" ry="90%">
            <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.18" />
            <Stop offset="0.35" stopColor="#E6C27A" stopOpacity="0.08" />
            <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={SCREEN_WIDTH}
          height={GLOW_HEIGHT}
          fill="url(#discoverGlow)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

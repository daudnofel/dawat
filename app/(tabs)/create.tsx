import { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';

import Step1Theme from '../create/step1-theme';
import Step2Basics from '../create/step2-basics';
import Step3Details from '../create/step3-details';
import Step4Settings from '../create/step4-settings';
import StepPoster from '../create/step-poster';
import StepEffect from '../create/step-effect';
import SuccessScreen from '../create/success';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreateTab() {
  const { currentStep } = useEventStore();
  const [published, setPublished] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    translateX.value = 20;
    opacity.value = withTiming(1, { duration: 250 });
    translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
  }, [currentStep, published]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  if (published) {
    return (
      <View style={styles.container}>
        <View style={styles.atmosphereLayer} pointerEvents="none">
          <Svg width={SCREEN_WIDTH} height={350} style={styles.glowSvg}>
            <Defs>
              <RadialGradient id="createGlow" cx="50%" cy="0%" rx="70%" ry="80%">
                <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.14" />
                <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.06" />
                <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width={SCREEN_WIDTH} height={350} fill="url(#createGlow)" />
          </Svg>
        </View>
        <Animated.View style={[styles.content, animStyle]}>
          <SuccessScreen onDone={() => { setPublished(false); setPublishedSlug(null); }} publishedSlug={publishedSlug} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.atmosphereLayer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={350} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="createGlow2" cx="50%" cy="0%" rx="70%" ry="80%">
              <Stop offset="0" stopColor="#FFDFA1" stopOpacity="0.14" />
              <Stop offset="0.4" stopColor="#E6C27A" stopOpacity="0.06" />
              <Stop offset="1" stopColor={COLORS.dark} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={350} fill="url(#createGlow2)" />
        </Svg>
      </View>
      <Animated.View style={[styles.content, animStyle]}>
        {/* DAW-22 new order: Basics → Poster → Theme → Details → Effects → Settings */}
        {currentStep === 1 && <Step2Basics />}
        {currentStep === 2 && <StepPoster />}
        {currentStep === 3 && <Step1Theme />}
        {currentStep === 4 && <Step3Details />}
        {currentStep === 5 && <StepEffect />}
        {currentStep === 6 && <Step4Settings onPublish={(slug?: string) => { setPublishedSlug(slug ?? null); setPublished(true); }} />}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  content: { flex: 1 },
  atmosphereLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

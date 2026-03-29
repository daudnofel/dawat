import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';

import Step1Theme from '../create/step1-theme';
import Step2Basics from '../create/step2-basics';
import Step3Details from '../create/step3-details';
import Step4Settings from '../create/step4-settings';
import SuccessScreen from '../create/success';

export default function CreateTab() {
  const { currentStep } = useEventStore();
  const [published, setPublished] = useState(false);

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    // Animate step transitions
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
      <Animated.View style={[styles.container, animStyle]}>
        <SuccessScreen onDone={() => setPublished(false)} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animStyle]}>
      {currentStep === 1 && <Step1Theme />}
      {currentStep === 2 && <Step2Basics />}
      {currentStep === 3 && <Step3Details />}
      {currentStep === 4 && <Step4Settings onPublish={() => setPublished(true)} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
});

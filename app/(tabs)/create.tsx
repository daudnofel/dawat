import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';

// Import step screens as components
import Step1Theme from '../create/step1-theme';
import Step2Basics from '../create/step2-basics';
import Step3Details from '../create/step3-details';
import Step4Settings from '../create/step4-settings';
import SuccessScreen from '../create/success';

export default function CreateTab() {
  const { currentStep } = useEventStore();
  const [published, setPublished] = useState(false);

  if (published) {
    return <SuccessScreen onDone={() => setPublished(false)} />;
  }

  return (
    <View style={styles.container}>
      {currentStep === 1 && <Step1Theme />}
      {currentStep === 2 && <Step2Basics />}
      {currentStep === 3 && <Step3Details />}
      {currentStep === 4 && <Step4Settings onPublish={() => setPublished(true)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
});

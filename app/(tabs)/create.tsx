import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { COLORS } from '../../lib/theme';
import { useEventStore } from '../../store/useEventStore';

export default function CreateScreen() {
  const router = useRouter();
  const reset = useEventStore((s) => s.reset);

  useEffect(() => {
    // Reset draft and navigate to step 1
    reset();
    router.push('/create/step1-theme');
  }, []);

  // Brief blank screen while redirecting
  return <View style={{ flex: 1, backgroundColor: COLORS.dark }} />;
}

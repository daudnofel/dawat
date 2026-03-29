import { Tabs } from 'expo-router';
import { COLORS } from '../../lib/theme';
import GlassTabBar from '../../components/GlassTabBar';

// Fade animation for tab transitions
const fadeTransition = {
  animation: 'fade' as const,
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.dark },
        ...fadeTransition,
      }}
      sceneContainerStyle={{ backgroundColor: COLORS.dark }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="trending" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

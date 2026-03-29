import { Tabs } from 'expo-router';
import { COLORS } from '../../lib/theme';
import GlassTabBar from '../../components/GlassTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.dark },
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

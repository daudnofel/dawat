import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../lib/theme';

function TabIcon({ icon, iconFilled, focused }: { icon: string; iconFilled: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, focused && styles.iconActive]}>
        {focused ? iconFilled : icon}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function CreateIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.createWrap, focused && styles.createWrapActive]}>
      <Text style={[styles.createPlus, focused && styles.createPlusActive]}>+</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.hint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⌂" iconFilled="⌂" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="◇" iconFilled="◆" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => <CreateIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="▫" iconFilled="▪" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="○" iconFilled="●" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.dark,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 85,
    paddingTop: 12,
    paddingBottom: 20,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  icon: {
    fontSize: 24,
    color: COLORS.hint,
    lineHeight: 28,
  },
  iconActive: {
    color: COLORS.white,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 4,
  },
  createWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  createWrapActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  createPlus: {
    fontSize: 26,
    color: COLORS.muted,
    lineHeight: 30,
    ...FONTS.regular,
  },
  createPlusActive: {
    color: COLORS.dark,
  },
});

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../lib/theme';

function TabIcon({ icon, iconFilled, label, focused }: { icon: string; iconFilled: string; label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, focused && styles.iconActive]}>
        {focused ? iconFilled : icon}
      </Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function CreateIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.createOuter}>
      <View style={[styles.createWrap, focused && styles.createWrapActive]}>
        <Text style={[styles.createPlus, focused && styles.createPlusActive]}>+</Text>
      </View>
      <Text style={[styles.label, focused && styles.labelActive, { marginTop: 4 }]}>Create</Text>
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
            <TabIcon icon="⌂" iconFilled="⌂" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="◇" iconFilled="◆" label="Trending" focused={focused} />
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
            <TabIcon icon="▫" iconFilled="▪" label="Events" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="○" iconFilled="●" label="Profile" focused={focused} />
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
    height: 88,
    paddingTop: 8,
    paddingBottom: 20,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  icon: {
    fontSize: 22,
    color: COLORS.hint,
    lineHeight: 26,
  },
  iconActive: {
    color: COLORS.white,
  },
  label: {
    fontSize: 10,
    color: COLORS.hint,
    marginTop: 2,
    letterSpacing: 0.3,
    ...FONTS.medium,
  },
  labelActive: {
    color: COLORS.white,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 3,
  },
  createOuter: {
    alignItems: 'center',
    marginTop: -6,
  },
  createWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createWrapActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  createPlus: {
    fontSize: 24,
    color: COLORS.muted,
    lineHeight: 28,
    ...FONTS.regular,
  },
  createPlusActive: {
    color: COLORS.dark,
  },
});

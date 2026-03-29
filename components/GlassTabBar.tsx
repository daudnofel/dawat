import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_WIDTH = SCREEN_WIDTH - 48;
const BAR_HEIGHT = 62;

interface TabItem {
  key: string;
  label: string;
  icon: string;
  iconFilled: string;
}

const TABS: TabItem[] = [
  { key: 'index', label: 'Home', icon: '⌂', iconFilled: '⌂' },
  { key: 'trending', label: 'Trending', icon: '◇', iconFilled: '◆' },
  { key: 'create', label: 'Create', icon: '+', iconFilled: '+' },
  { key: 'events', label: 'Events', icon: '▫', iconFilled: '▪' },
  { key: 'profile', label: 'Profile', icon: '○', iconFilled: '●' },
];

interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function GlassTabBar({ state, navigation }: GlassTabBarProps) {
  const indicatorX = useSharedValue(0);
  const tabWidth = BAR_WIDTH / TABS.length;

  const activeIndex = state.index;
  indicatorX.value = withSpring(activeIndex * tabWidth, { damping: 18, stiffness: 280 });

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <GlassView
        style={styles.bar}
        glassEffectStyle="clear"
        colorScheme="dark"
      >
        {/* Dark tint overlay */}
        <View style={styles.tint} />

        {/* Animated indicator */}
        <Animated.View style={[styles.indicator, { width: tabWidth }, indicatorStyle]} />

        {/* Tab items */}
        <View style={styles.tabRow}>
          {TABS.map((tab, index) => {
            const isFocused = activeIndex === index;
            const isCreate = tab.key === 'create';

            return (
              <Pressable
                key={tab.key}
                style={styles.tabItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const route = state.routes[index];
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              >
                {isCreate ? (
                  <View style={[styles.createButton, isFocused && styles.createButtonActive]}>
                    <Text style={[styles.createIcon, isFocused && styles.createIconActive]}>+</Text>
                  </View>
                ) : (
                  <>
                    <Text style={[styles.icon, isFocused && styles.iconActive]}>
                      {isFocused ? tab.iconFilled : tab.icon}
                    </Text>
                    <Text style={[styles.label, isFocused && styles.labelActive]}>
                      {tab.label}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  bar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  indicator: {
    position: 'absolute',
    top: 6,
    left: 0,
    height: BAR_HEIGHT - 12,
    borderRadius: (BAR_HEIGHT - 12) / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    color: COLORS.hint,
    lineHeight: 24,
  },
  iconActive: {
    color: COLORS.white,
  },
  label: {
    fontSize: 9,
    color: COLORS.hint,
    marginTop: 2,
    letterSpacing: 0.3,
    ...FONTS.medium,
  },
  labelActive: {
    color: COLORS.gold,
  },
  createButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  createIcon: {
    fontSize: 22,
    color: COLORS.muted,
    lineHeight: 26,
  },
  createIconActive: {
    color: COLORS.dark,
  },
});

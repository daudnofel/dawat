import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS } from '../lib/theme';

const TAB_COUNT = 5;
const TAB_BAR_WIDTH = 320;
const TAB_BAR_HEIGHT = 58;
const INDICATOR_PADDING = 5;
const INDICATOR_WIDTH = (TAB_BAR_WIDTH - INDICATOR_PADDING * 2) / TAB_COUNT;

const TAB_CONFIG: Record<string, { icon: string; iconFilled: string; label: string }> = {
  index: { icon: '⌂', iconFilled: '⌂', label: 'Home' },
  trending: { icon: '◇', iconFilled: '◆', label: 'Trending' },
  create: { icon: '+', iconFilled: '+', label: 'Create' },
  events: { icon: '▫', iconFilled: '▪', label: 'Events' },
  profile: { icon: '○', iconFilled: '●', label: 'Profile' },
};

interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function GlassTabBar({ state, navigation }: GlassTabBarProps) {
  const translateX = useSharedValue(INDICATOR_PADDING + state.index * INDICATOR_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(INDICATOR_PADDING + state.index * INDICATOR_WIDTH, {
      damping: 18,
      stiffness: 280,
      mass: 0.5,
    });
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.shadow}>
        <GlassView
          style={styles.container}
          glassEffectStyle="clear"
          colorScheme="dark"
        >
          {/* Dark tint overlay for depth */}
          <View style={styles.barTint} />

          {/* Animated selected-tab indicator */}
          <Animated.View style={[styles.indicatorWrapper, indicatorStyle]}>
            <View style={styles.indicatorHighlight} />
          </Animated.View>

          {/* Tab items */}
          <View style={styles.tabs}>
            {state.routes.map((route: any, index: number) => {
              const isFocused = state.index === index;
              const config = TAB_CONFIG[route.name] ?? { icon: '?', iconFilled: '?', label: route.name };
              const isCreate = route.name === 'create';

              return (
                <Pressable
                  key={route.key}
                  style={styles.tabItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                    <View style={[styles.createBtn, isFocused && styles.createBtnActive]}>
                      <Text style={[styles.createIcon, isFocused && styles.createIconActive]}>+</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.icon, isFocused && styles.iconActive]}>
                        {isFocused ? config.iconFilled : config.icon}
                      </Text>
                      <Text style={[styles.label, isFocused && styles.labelActive]}>
                        {config.label}
                      </Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </GlassView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  container: {
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  barTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  indicatorWrapper: {
    position: 'absolute',
    top: INDICATOR_PADDING,
    width: INDICATOR_WIDTH,
    height: TAB_BAR_HEIGHT - INDICATOR_PADDING * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorHighlight: {
    width: '100%',
    height: '100%',
    borderRadius: (TAB_BAR_HEIGHT - INDICATOR_PADDING * 2) / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabs: {
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
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 24,
  },
  iconActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
    letterSpacing: 0.3,
    ...FONTS.medium,
  },
  labelActive: {
    color: COLORS.gold,
  },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  createIcon: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 26,
  },
  createIconActive: {
    color: COLORS.dark,
  },
});

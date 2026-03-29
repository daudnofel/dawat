import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONTS } from '../lib/theme';

const TAB_COUNT = 5;
const TAB_BAR_WIDTH = 340;
const TAB_BAR_HEIGHT = 64;
const INDICATOR_PADDING = 4;
const USABLE_WIDTH = TAB_BAR_WIDTH;
const INDICATOR_WIDTH = USABLE_WIDTH / TAB_COUNT;
const INDICATOR_HEIGHT = TAB_BAR_HEIGHT - INDICATOR_PADDING * 2;

// Clean SVG icons — thin line style
function HomeIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        stroke={focused ? '#fff' : 'rgba(255,255,255,0.4)'}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(255,255,255,0.15)' : 'none'}
      />
    </Svg>
  );
}

function TrendingIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        stroke={focused ? '#fff' : 'rgba(255,255,255,0.4)'}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(255,255,255,0.15)' : 'none'}
      />
    </Svg>
  );
}

function EventsIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1 4 21 4.9 21 6V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V6C3 4.9 3.9 4 5 4Z"
        stroke={focused ? '#fff' : 'rgba(255,255,255,0.4)'}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(255,255,255,0.15)' : 'none'}
      />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21M12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
        stroke={focused ? '#fff' : 'rgba(255,255,255,0.4)'}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(255,255,255,0.15)' : 'none'}
      />
    </Svg>
  );
}

const TAB_ICONS: Record<string, (props: { focused: boolean }) => React.JSX.Element> = {
  index: HomeIcon,
  trending: TrendingIcon,
  events: EventsIcon,
  profile: ProfileIcon,
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  trending: 'Trending',
  create: 'Create',
  events: 'Events',
  profile: 'Profile',
};

interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function GlassTabBar({ state, navigation }: GlassTabBarProps) {
  const translateX = useSharedValue(state.index * INDICATOR_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(state.index * INDICATOR_WIDTH, {
      damping: 20,
      stiffness: 300,
      mass: 0.4,
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
          {/* Light tint overlay */}
          <View style={styles.barTint} />

          {/* Animated indicator */}
          <Animated.View style={[styles.indicatorWrapper, indicatorStyle]}>
            <View style={styles.indicatorHighlight} />
          </Animated.View>

          {/* Tab items */}
          <View style={styles.tabs}>
            {state.routes.map((route: any, index: number) => {
              const isFocused = state.index === index;
              const isCreate = route.name === 'create';
              const IconComponent = TAB_ICONS[route.name];
              const label = TAB_LABELS[route.name];

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
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 5V19M5 12H19"
                          stroke={isFocused ? COLORS.dark : 'rgba(255,255,255,0.6)'}
                          strokeWidth={2.2}
                          strokeLinecap="round"
                        />
                      </Svg>
                    </View>
                  ) : (
                    <>
                      {IconComponent && <IconComponent focused={isFocused} />}
                      <Text style={[styles.label, isFocused && styles.labelActive]}>
                        {label}
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
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  container: {
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  barTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  indicatorWrapper: {
    position: 'absolute',
    top: INDICATOR_PADDING,
    left: 0,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorHighlight: {
    width: INDICATOR_WIDTH - 8,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_HEIGHT / 2,
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
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.2,
    ...FONTS.medium,
  },
  labelActive: {
    color: COLORS.gold,
  },
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
});

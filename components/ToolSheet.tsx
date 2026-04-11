/**
 * ToolSheet — shared bottom-sheet shell for every editor tool (DAW-54).
 *
 * Every tool route in `app/create/tools/*` mounts the same shell: a dimmed
 * backdrop over the live editor canvas, a ~80% height card that springs up
 * from below, a gold drag handle, a title, and a "Done" button wired to
 * `onClose`. The picker / control panel lives as children inside the body
 * ScrollView.
 *
 * Why hand-rolled instead of `@gorhom/bottom-sheet`?
 *   - Every tool is already a separate Expo Router `transparentModal`
 *     route, so we don't need gorhom's snap-point / navigation interop.
 *   - Matches the pattern set in `app/create/essentials.tsx`.
 *   - Reanimated 3 spring matches the Partiful-level motion we want
 *     without pulling in another gesture/animation surface.
 *
 * Behaviour:
 *   - Fades in the backdrop + springs the card up on mount.
 *   - Tapping the backdrop OR the Done button fires `onClose`.
 *   - Swiping the card down past ~80px translates + fires `onClose`.
 *   - Safe-area aware: bottom padding respects the home indicator.
 *   - KeyboardAvoidingView wraps the body so `details` tool text inputs
 *     aren't swallowed by the keyboard.
 */

import React, { ReactNode, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.82);
const DRAG_DISMISS_THRESHOLD = 80;

export interface ToolSheetProps {
  title: string;
  onClose: () => void;
  /**
   * Scrollable by default. Set `false` for tools that render their own
   * inner ScrollView / FlashList (e.g. the details tool wraps content in
   * KeyboardAvoidingView + its own ScrollView).
   */
  scrollable?: boolean;
  /** Optional right-side element instead of the default "Done" button. */
  rightAction?: ReactNode;
  children: ReactNode;
}

export default function ToolSheet({
  title,
  onClose,
  scrollable = true,
  rightAction,
  children,
}: ToolSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    // Spring the sheet in + fade the backdrop. One frame later so the
    // route transition doesn't double-animate on iOS.
    translateY.value = withSpring(0, {
      damping: 22,
      stiffness: 180,
      mass: 0.9,
    });
    backdropOpacity.value = withTiming(1, { duration: 220 });
  }, [backdropOpacity, translateY]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Animate out, then call the caller's onClose on the JS thread.
    backdropOpacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(
      SHEET_HEIGHT,
      { duration: 220 },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      },
    );
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (
        e.translationY > DRAG_DISMISS_THRESHOLD ||
        e.velocityY > 900
      ) {
        backdropOpacity.value = withTiming(0, { duration: 160 });
        translateY.value = withTiming(
          SHEET_HEIGHT,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(onClose)();
            }
          },
        );
      } else {
        translateY.value = withSpring(0, {
          damping: 22,
          stiffness: 200,
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const Body = scrollable ? (
    <ScrollView
      style={styles.body}
      contentContainerStyle={[
        styles.bodyContent,
        { paddingBottom: Math.max(insets.bottom + SPACING.xl, SPACING.xxl) },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.bodyFlex}>{children}</View>
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop — tap to dismiss */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sheet card */}
      <Animated.View
        style={[
          styles.sheet,
          { height: SHEET_HEIGHT, paddingBottom: insets.bottom },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerSide}>
            {rightAction ?? (
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            )}
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {Body}
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201,168,76,0.24)',
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(201,168,76,0.55)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,223,161,0.10)',
  },
  headerSide: {
    minWidth: 56,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  doneText: {
    fontSize: 15,
    ...FONTS.bold,
    color: COLORS.gold,
  },
  body: { flex: 1 },
  bodyFlex: { flex: 1 },
  bodyContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
});

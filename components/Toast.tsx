// components/Toast.tsx
// Dawat-branded toast notification system.
// Usage: Toast.show('Link copied', 'success')
//        Toast.show('Upload failed', 'error')

import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS } from '../lib/theme';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

const TOAST_COLORS: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: 'rgba(76, 175, 80, 0.92)', text: '#FFFFFF', icon: '✓' },
  error: { bg: 'rgba(239, 68, 68, 0.92)', text: '#FFFFFF', icon: '✕' },
  info: { bg: 'rgba(201, 168, 76, 0.92)', text: '#FFFFFF', icon: '✦' },
};

// ─── Global state (singleton) ────────────────────────────────

let _showToast: ((text: string, type?: ToastType) => void) | null = null;

/**
 * Show a toast from anywhere in the app.
 * Call Toast.show('message', 'success') — no hook or context needed.
 */
export const Toast = {
  show: (text: string, type: ToastType = 'info') => {
    _showToast?.(text, type);
  },
  success: (text: string) => _showToast?.(text, 'success'),
  error: (text: string) => _showToast?.(text, 'error'),
  info: (text: string) => _showToast?.(text, 'info'),
};

// ─── Provider (mount once in _layout.tsx) ────────────────────

export function ToastProvider() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const show = useCallback((text: string, type: ToastType = 'info') => {
    const id = ++counter.current;

    // Haptic feedback based on type
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setMessages((prev) => [...prev, { id, text, type }]);

    // Auto-remove after 2.5s
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2800);
  }, []);

  useEffect(() => {
    _showToast = show;
    return () => { _showToast = null; };
  }, [show]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} />
      ))}
    </View>
  );
}

// ─── Single toast item ──────────────────────────────────────

function ToastItem({ message }: { message: ToastMessage }) {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const colors = TOAST_COLORS[message.type];

  useEffect(() => {
    // Slide in
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 200 });

    // Slide out after 2s
    translateY.value = withDelay(2200, withTiming(-80, { duration: 300, easing: Easing.in(Easing.cubic) }));
    opacity.value = withDelay(2200, withTiming(0, { duration: 300 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.toast, { backgroundColor: colors.bg }, animStyle]}>
      <Text style={[styles.icon, { color: colors.text }]}>{colors.icon}</Text>
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={2}>{message.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
    maxWidth: SCREEN_WIDTH - SPACING.xl * 2,
    gap: SPACING.sm,

    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 16,
    ...FONTS.bold,
  },
  text: {
    fontSize: 14,
    ...FONTS.semibold,
    flexShrink: 1,
  },
});

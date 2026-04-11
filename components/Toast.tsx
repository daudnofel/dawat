// components/Toast.tsx
// Dawat-branded toast notification system.
// Usage: Toast.show('Link copied', 'success')

import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
  success: { bg: 'rgba(76, 175, 80, 0.95)', text: '#FFFFFF', icon: '✓' },
  error: { bg: 'rgba(239, 68, 68, 0.95)', text: '#FFFFFF', icon: '✕' },
  info: { bg: 'rgba(201, 168, 76, 0.95)', text: '#FFFFFF', icon: '✦' },
};

// ─── Global singleton ────────────────────────────────────────

let _showToast: ((text: string, type?: ToastType) => void) | null = null;

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
  const [current, setCurrent] = useState<ToastMessage | null>(null);
  const counter = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, type: ToastType = 'info') => {
    const id = ++counter.current;

    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setCurrent({ id, text, type });

    // Auto-dismiss after 2.5s
    timerRef.current = setTimeout(() => {
      setCurrent(null);
    }, 2500);
  }, []);

  useEffect(() => {
    _showToast = show;
    return () => { _showToast = null; };
  }, [show]);

  if (!current) return null;

  const colors = TOAST_COLORS[current.type];

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={[styles.toast, { backgroundColor: colors.bg }]}>
        <Text style={[styles.icon, { color: colors.text }]}>{colors.icon}</Text>
        <Text style={[styles.text, { color: colors.text }]} numberOfLines={2}>
          {current.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    maxWidth: SCREEN_WIDTH - SPACING.xl * 2,
    gap: SPACING.sm,
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

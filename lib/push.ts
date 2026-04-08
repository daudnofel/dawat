// lib/push.ts
// Push notification registration + send-trigger helpers (DAW-25).
// Requires the EAS dev build — does NOT work in Expo Go on iOS.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// Configure foreground notification behavior so banners show even when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permission and return the Expo push token.
 * Returns null if permission denied, simulator, or in Expo Go on iOS.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[push] Push only works on physical devices');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[push] Permission not granted');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.log('[push] No EAS projectId found in expo config');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (e) {
    console.log('[push] Failed to get push token:', e);
    return null;
  }
}

/**
 * Register the device for push and persist the token to the user's row.
 * Call this after successful login / onboarding.
 */
export async function savePushToken(userId: string): Promise<void> {
  const token = await registerForPushNotifications();
  if (!token) return;

  const { error } = await supabase
    .from('users')
    .update({
      push_token: token,
      push_platform: Platform.OS,
    })
    .eq('id', userId);

  if (error) {
    console.log('[push] Failed to save push token:', error.message);
  }
}

/**
 * Trigger a push notification to another user via the send-push Edge Function.
 * Fire-and-forget: never blocks the UI, swallows errors.
 */
export async function triggerPush(
  recipientUserId: string,
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<void> {
  try {
    await supabase.functions.invoke('send-push', {
      body: {
        user_id: recipientUserId,
        title,
        body,
        data: data ?? {},
      },
    });
  } catch (e) {
    console.log('[push] Failed to trigger push:', e);
  }
}

// Push notification helpers — will use Expo Notifications when dev build is ready
// For now, these are stubs that log to console

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  // TODO: Implement with expo-notifications when using dev build
  // const { status } = await Notifications.requestPermissionsAsync();
  // if (status !== 'granted') return null;
  // const token = await Notifications.getExpoPushTokenAsync();
  // Store token in users table
  console.log(`[notifications] Would register push for user ${userId}`);
  return null;
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  // TODO: Implement via Expo push API
  console.log(`[notifications] Would send push: ${title} - ${body}`);
}

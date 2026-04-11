import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native/provider';

import { COLORS } from '../lib/theme';
import { ToastProvider } from '../components/Toast';

LogBox.ignoreLogs([
  'Could not access feature flag',
  'disableEventLoopOnBridgeless',
  '[DEPRECATED]',
  'shadow',
]);

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

const DawatDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.gold,
    background: COLORS.dark,
    card: COLORS.card,
    text: COLORS.white,
    border: COLORS.border,
    notification: COLORS.gold,
  },
};

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ManropeLight: require('@expo-google-fonts/manrope/300Light/Manrope_300Light.ttf'),
    ManropeRegular: require('@expo-google-fonts/manrope/400Regular/Manrope_400Regular.ttf'),
    ManropeSemiBold: require('@expo-google-fonts/manrope/600SemiBold/Manrope_600SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Handle taps on push notifications — route to the right in-app destination
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      if (!data?.type) return;

      if (data.type === 'message' && data.conversation_id) {
        router.push(`/chat/${data.conversation_id}`);
      } else if ((data.type === 'rsvp' || data.type === 'event_cancelled') && data.event_id) {
        router.push(`/event/${data.event_id}`);
      }
    });
    return () => sub.remove();
  }, [router]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider
        colorScheme="dark"
        config={{ devInfo: { stylingPrinciples: false } }}
      >
        <ThemeProvider value={DawatDarkTheme}>
          <StatusBar barStyle="light-content" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.dark } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          </Stack>
          <ToastProvider />
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

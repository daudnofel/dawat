import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native/provider';

import { COLORS } from '../lib/theme';

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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider colorScheme="dark">
        <ThemeProvider value={DawatDarkTheme}>
          <StatusBar barStyle="light-content" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.dark } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          </Stack>
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

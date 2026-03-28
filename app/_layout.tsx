import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { COLORS } from '../lib/theme';
import { useAuthStore } from '../store/useAuthStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// Force dark theme with Dawat colours
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
  });

  const { loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { session, user, isNewUser, devBypass } = useAuthStore();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (devBypass) {
      // DEV ONLY — skip auth
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    } else if (!session) {
      // Not logged in — send to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (isNewUser || !user) {
      // Logged in but no profile — send to onboarding
      const secondSegment = segments.length > 1 ? segments[1] : undefined;
      if (secondSegment !== 'onboarding') {
        router.replace('/(auth)/onboarding');
      }
    } else {
      // Logged in with profile — send to main app
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, user, isNewUser, devBypass, segments]);

  return (
    <ThemeProvider value={DawatDarkTheme}>
      <StatusBar barStyle="light-content" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.dark } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="org/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="create" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

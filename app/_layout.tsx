import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, LogBox } from 'react-native';

import { COLORS } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { setCurrentUserId, clearCurrentUserId, getCurrentUserId } from '../lib/auth-cache';

LogBox.ignoreLogs([
  'Could not access feature flag',
  'disableEventLoopOnBridgeless',
  '[DEPRECATED]',
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
  });
  const [authReady, setAuthReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const router = useRouter();
  const segments = useSegments() as string[];

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Check auth state on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setIsAuthed(true);

        // Check if profile exists
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        setHasProfile(!!profile);
      } else {
        setIsAuthed(false);
        setHasProfile(false);
      }
    } catch {
      setIsAuthed(false);
      setHasProfile(false);
    }
    setAuthReady(true);
  };

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthed(true);
      } else {
        clearCurrentUserId();
        setIsAuthed(false);
        setHasProfile(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Route based on auth state
  useEffect(() => {
    if (!authReady || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthed) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!hasProfile) {
      if (segments[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding');
      }
    } else {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthed, hasProfile, authReady, fontsLoaded, segments]);

  useEffect(() => {
    if (fontsLoaded && authReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authReady]);

  if (!fontsLoaded || !authReady) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <ThemeProvider value={DawatDarkTheme}>
      <StatusBar barStyle="light-content" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.dark } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

// lib/auth-apple.ts
// Native Sign in with Apple → Supabase session exchange (DAW-5).
// Only runs on iOS in an EAS dev/production build — does NOT work in Expo Go.

import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export type AppleSignInResult =
  | { ok: true; isNewUser: boolean; userId: string }
  | { ok: false; reason: 'cancelled' | 'unavailable' | 'no_token' | 'supabase_error'; message?: string };

/**
 * Run the native Apple Sign-In sheet, hand the identity token to Supabase,
 * and return whether this is a new user (so the caller can route to onboarding).
 *
 * Apple only sends the user's full name on the FIRST sign-in. We capture it here
 * and pass it through to the user's display_name on first creation.
 */
export async function signInWithApple(): Promise<AppleSignInResult> {
  if (Platform.OS !== 'ios') {
    return { ok: false, reason: 'unavailable', message: 'Apple Sign-In is iOS only' };
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return { ok: false, reason: 'unavailable', message: 'Apple Sign-In not available on this device' };
  }

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') {
      return { ok: false, reason: 'cancelled' };
    }
    return { ok: false, reason: 'no_token', message: e?.message ?? 'Apple Sign-In failed' };
  }

  if (!credential.identityToken) {
    return { ok: false, reason: 'no_token', message: 'No identity token returned by Apple' };
  }

  // Hand the identity token to Supabase — it verifies the JWT against Apple's
  // public keys and creates / links the user by email.
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error || !data.user) {
    return { ok: false, reason: 'supabase_error', message: error?.message ?? 'Supabase sign-in failed' };
  }

  // First sign-in: Apple sent us the user's name. Save it as display_name if we
  // don't already have a profile row, OR if the existing display_name is empty.
  const fullName = credential.fullName;
  const composedName = fullName
    ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ').trim()
    : '';

  const { data: existing } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('id', data.user.id)
    .maybeSingle();

  const isNewUser = !existing;

  if (isNewUser && composedName) {
    // Create the profile row with the name Apple gave us. Onboarding can still
    // collect additional info, but we won't lose the name.
    await supabase.from('users').insert({
      id: data.user.id,
      display_name: composedName,
    });
  } else if (existing && !existing.display_name && composedName) {
    await supabase
      .from('users')
      .update({ display_name: composedName })
      .eq('id', data.user.id);
  }

  return { ok: true, isNewUser, userId: data.user.id };
}

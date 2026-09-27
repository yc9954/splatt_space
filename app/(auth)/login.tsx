import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BRAND, Colors, Radii } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const APP_SCHEME = 'splatt-space';

function showError(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading, isDemo } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setIsGoogleLoading(false);
      setIsLoading(false);
      router.replace('/(tabs)/feed');
    }
  }, [isAuthenticated, authLoading]);

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Missing details', 'Enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      showError('Could not log in', error?.message || 'Check your email and password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (isDemo) {
      showError('Demo mode', 'Google sign-in needs a Supabase project. Use any email and password to try the demo.');
      return;
    }
    try {
      setIsGoogleLoading(true);
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: APP_SCHEME, path: 'auth/callback' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: Platform.OS !== 'web' },
      });
      if (error) throw error;
      if (Platform.OS === 'web' || !data?.url) return; // browser handles the redirect

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type !== 'success' || !result.url) {
        setIsGoogleLoading(false);
        return;
      }

      const fragment = result.url.split('#')[1] ?? result.url.split('?')[1] ?? '';
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (!accessToken || !refreshToken) throw new Error('No session tokens were returned.');

      const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (sessionError) throw sessionError;
      // AuthContext picks up the SIGNED_IN event and navigates.
    } catch (error: any) {
      showError('Google sign-in failed', error?.message || 'Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[...Colors.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <SafeAreaView edges={['top']} style={styles.hero}>
            <View style={styles.logoCircle}>
              <Ionicons name="cube" size={40} color={Colors.white} />
            </View>
            <Text style={styles.title}>{BRAND.name}</Text>
            <Text style={styles.tagline}>{BRAND.tagline}</Text>
          </SafeAreaView>

          <View style={styles.card}>
            {isDemo && (
              <View style={styles.demoBanner}>
                <Ionicons name="flask-outline" size={16} color={Colors.primaryDark} />
                <Text style={styles.demoText}>Demo mode: any email and password will sign you in.</Text>
              </View>
            )}

            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgot} onPress={() => showError('Reset password', 'Password reset is handled through your Supabase project email templates.')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryButton, isLoading && styles.disabled]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.9}>
              {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryButtonText}>Log in</Text>}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={[styles.socialButton, isGoogleLoading && styles.disabled]} onPress={signInWithGoogle} disabled={isGoogleLoading} activeOpacity={0.9}>
              {isGoogleLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to {BRAND.name}? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Create an account</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  hero: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
  },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primarySoft,
    padding: 12,
    borderRadius: Radii.md,
    marginBottom: 18,
  },
  demoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderStrong,
  },
  dividerText: {
    marginHorizontal: 14,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    height: 52,
    backgroundColor: Colors.surface,
    marginBottom: 22,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

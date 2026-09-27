import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
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

function showError(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, isDemo } = useAuth();

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      showError('Missing details', 'Please fill in every field.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords differ', 'The two passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showError('Password too short', 'Use at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ email, username: username.trim(), password });
      router.replace('/(tabs)/feed');
    } catch (error: any) {
      showError('Could not create account', error?.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[...Colors.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <SafeAreaView edges={['top']} style={styles.hero}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <Ionicons name="cube" size={34} color={Colors.white} />
            </View>
            <Text style={styles.title}>Join {BRAND.name}</Text>
            <Text style={styles.tagline}>Start capturing places in 3D</Text>
          </SafeAreaView>

          <View style={styles.card}>
            {isDemo && (
              <View style={styles.demoBanner}>
                <Ionicons name="flask-outline" size={16} color={Colors.primaryDark} />
                <Text style={styles.demoText}>Demo mode: the account lives on this device only.</Text>
              </View>
            )}

            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="at-outline" size={20} color={Colors.textMuted} />
              <TextInput style={styles.input} placeholder="Username" placeholderTextColor={Colors.textMuted} value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
              <TextInput style={styles.input} placeholder="Password (min. 6 characters)" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="new-password" />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textMuted} />
              <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor={Colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} autoComplete="new-password" onSubmitEditing={handleRegister} />
            </View>

            <TouchableOpacity style={[styles.primaryButton, isLoading && styles.disabled]} onPress={handleRegister} disabled={isLoading} activeOpacity={0.9}>
              {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryButtonText}>Create account</Text>}
            </TouchableOpacity>

            <Text style={styles.terms}>By continuing you agree to share captures responsibly and respect the places you record.</Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Log in</Text>
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
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  back: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
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
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },
  terms: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
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

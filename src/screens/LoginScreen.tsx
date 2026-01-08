import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../App';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#9B59B6']}
        style={styles.gradient}>
        {/* Background landmarks */}
        <View style={styles.backgroundLandmarks}>
          <Text style={[styles.landmark, {top: 80, left: 40}]}>🗼</Text>
          <Text style={[styles.landmark, {top: 160, right: 40}]}>⛰️</Text>
          <Text style={[styles.landmark, {bottom: 240, left: '25%'}]}>🏖️</Text>
        </View>

        {/* Logo and tagline section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Icon name="globe" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>TravelSpace 3D</Text>
          <Text style={styles.tagline}>Share Your Journey in 3D</Text>
        </View>

        {/* Login card */}
        <View style={styles.loginCard}>
          {/* Email input */}
          <View style={styles.inputContainer}>
            <Icon
              name="mail"
              size={20}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Password input */}
          <View style={styles.inputContainer}>
            <Icon
              name="lock"
              size={20}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social login buttons */}
          <TouchableOpacity style={styles.socialButton}>
            <Icon name="globe" size={20} color="#4285F4" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
            <Icon name="smartphone" size={20} color="#FFFFFF" />
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundLandmarks: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  landmark: {
    position: 'absolute',
    fontSize: 120,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 50,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    marginBottom: 24,
  },
  appleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
});

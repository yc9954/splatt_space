import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import { BRAND, Colors } from '@/constants/theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>{BRAND.name.toUpperCase()}</Text>
        <Text style={styles.tagline}>{BRAND.tagline}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    transform: [{ translateY: -60 }],
  },
  logo: {
    width: 320,
    height: 320,
    marginBottom: -70,
  },
  appName: {
    fontSize: 20,
    fontWeight: '300',
    color: Colors.white,
    letterSpacing: 8,
  },
  tagline: {
    marginTop: 10,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
});

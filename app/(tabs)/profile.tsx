import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { ProfileGrid, ProfileHeader, type ProfileTab } from '@/components/ProfileHeader';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { Post } from '@/types';

export default function ProfileScreen() {
  const { user, logout, isDemo } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<ProfileTab>('posts');

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      api
        .getUserPosts(user.id)
        .then((data) => active && setPosts(data))
        .catch((error) => console.warn('Failed to load user posts:', error))
        .finally(() => active && setIsLoading(false));
      return () => {
        active = false;
      };
    }, [user])
  );

  const confirmLogout = () => {
    const doLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
    };
    if (Platform.OS === 'web') {
      doLogout();
      return;
    }
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: doLogout },
    ]);
  };

  if (!user) return null;

  const visiblePosts = tab === '3d' ? posts.filter((p) => p.is3D) : posts;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>@{user.username}</Text>
        <TouchableOpacity onPress={confirmLogout} hitSlop={8}>
          <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ProfileGrid
        posts={visiblePosts}
        onPostPress={(postId) => router.push({ pathname: '/asset-viewer', params: { postId } })}
        header={
          <ProfileHeader
            user={{ ...user, postsCount: posts.length || user.postsCount }}
            isOwnProfile
            activeTab={tab}
            onTabChange={setTab}
            onEditProfile={() => Alert.alert('Coming soon', 'Profile editing is on the roadmap.')}
            onFollowersPress={() => router.push(`/user/${user.id}/followers`)}
            onFollowingPress={() => router.push(`/user/${user.id}/following`)}
            demoNote={isDemo ? 'Demo profile. Sign in with Supabase to use your own.' : undefined}
          />
        }
        empty={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{tab === '3d' ? 'No 3D captures yet' : 'No posts yet'}</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/upload')}>
                <Text style={styles.emptyButtonText}>Create your first capture</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  center: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

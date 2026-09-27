import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileGrid, ProfileHeader, type ProfileTab } from '@/components/ProfileHeader';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import type { Post, User } from '@/types';

function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [tab, setTab] = useState<ProfileTab>('posts');

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const [profile, userPosts, following] = await Promise.all([
          api.getUserProfile(id),
          api.getUserPosts(id),
          currentUser ? api.isFollowing(id, currentUser.id) : Promise.resolve(false),
        ]);
        if (!active) return;
        setUser(profile);
        setPosts(userPosts);
        setIsFollowing(following);
      } catch (error) {
        console.warn('Failed to load profile:', error);
        notify('Profile unavailable', 'This profile could not be loaded.');
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!id || !user || !currentUser) {
      notify('Sign in required', 'Log in to follow people.');
      return;
    }
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await api.unfollowUser(id, currentUser.id);
        setIsFollowing(false);
        setUser({ ...user, followersCount: Math.max(0, user.followersCount - 1) });
      } else {
        await api.followUser(id, currentUser.id);
        setIsFollowing(true);
        setUser({ ...user, followersCount: user.followersCount + 1 });
      }
    } catch (error: any) {
      notify('Something went wrong', error?.message || 'Could not update follow state.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === id;
  const visiblePosts = tab === '3d' ? posts.filter((p) => p.is3D) : posts;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user ? `@${user.username}` : 'Profile'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading || !user ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ProfileGrid
          posts={visiblePosts}
          onPostPress={(postId) => router.push({ pathname: '/asset-viewer', params: { postId } })}
          header={
            <ProfileHeader
              user={{ ...user, postsCount: posts.length || user.postsCount }}
              isOwnProfile={isOwnProfile}
              activeTab={tab}
              onTabChange={setTab}
              isFollowing={isFollowing}
              isFollowLoading={isFollowLoading}
              onFollowToggle={handleFollowToggle}
              onEditProfile={() => router.push('/(tabs)/profile')}
              onFollowersPress={() => router.push(`/user/${id}/followers`)}
              onFollowingPress={() => router.push(`/user/${id}/following`)}
            />
          }
          empty={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{tab === '3d' ? 'No 3D captures yet' : 'No posts yet'}</Text>
            </View>
          }
        />
      )}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});

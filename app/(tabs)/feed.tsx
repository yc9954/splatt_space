import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InteractiveSceneCard } from '@/components/InteractiveSceneCard';
import { PostCard } from '@/components/PostCard';
import { BRAND, Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useFeed } from '@/hooks/useFeed';
import type { Post } from '@/types';

export default function FeedScreen() {
  const { isDemo } = useAuth();
  const { posts, isLoading, isRefreshing, error, refresh, toggleLike } = useFeed();

  const featured = useMemo(() => posts.find((p) => p.is3D && p.image3dUrl) ?? null, [posts]);
  const rest = useMemo(() => posts.filter((p) => p.id !== featured?.id), [posts, featured]);

  const openPost = (postId: string) => router.push({ pathname: '/asset-viewer', params: { postId } });
  const openUser = (userId: string) => router.push(`/user/${userId}`);

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard post={item} onPress={openPost} onLike={toggleLike} onComment={openPost} onUserPress={openUser} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Ionicons name="cube" size={16} color={Colors.white} />
          </View>
          <Text style={styles.brandName}>{BRAND.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')} hitSlop={8}>
            <Ionicons name="search-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={Colors.primary} />}
          ListHeaderComponent={
            <View>
              {isDemo && (
                <View style={styles.demoBanner}>
                  <Ionicons name="flask-outline" size={14} color={Colors.primaryDark} />
                  <Text style={styles.demoText}>Demo mode: sample scenes, nothing is saved to a server.</Text>
                </View>
              )}
              {featured && <InteractiveSceneCard post={featured} onPress={openPost} />}
              <Text style={styles.sectionTitle}>Latest captures</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>{error ? 'Could not load the feed' : 'No captures yet'}</Text>
              <Text style={styles.emptyText}>
                {error ? error : 'Be the first to turn a place into 3D.'}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={error ? refresh : () => router.push('/(tabs)/upload')}>
                <Text style={styles.emptyButtonText}>{error ? 'Try again' : 'Create a capture'}</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 18,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  demoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 12,
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

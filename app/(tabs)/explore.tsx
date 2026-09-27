import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useFeed } from '@/hooks/useFeed';
import { compactNumber } from '@/lib/time';
import type { Post } from '@/types';

const GAP = 2;
const COLUMNS = 3;
const ITEM_SIZE = (Dimensions.get('window').width - GAP * (COLUMNS - 1)) / COLUMNS;

export default function ExploreScreen() {
  const { posts, isLoading, isRefreshing, refresh } = useFeed();

  const openPost = (post: Post) => router.push({ pathname: '/asset-viewer', params: { postId: post.id } });

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <TouchableOpacity
      style={[styles.gridItem, index % COLUMNS !== COLUMNS - 1 && { marginRight: GAP }]}
      onPress={() => openPost(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} resizeMode="cover" />
      {item.is3D && (
        <View style={styles.badge3D}>
          <Ionicons name="cube-outline" size={11} color={Colors.white} />
        </View>
      )}
      <View style={styles.overlay}>
        <Ionicons name="heart" size={12} color={Colors.white} />
        <Text style={styles.overlayText}>{compactNumber(item.likesCount)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity style={styles.searchPill} onPress={() => router.push('/(tabs)/search')} activeOpacity={0.8}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <Text style={styles.searchPillText}>Search places, tags, people</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={COLUMNS}
          columnWrapperStyle={{ marginBottom: GAP }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nothing to explore yet.</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceInset,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchPillText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: Colors.surfaceInset,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  badge3D: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  overlayText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
});

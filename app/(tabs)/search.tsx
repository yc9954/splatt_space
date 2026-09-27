import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { api } from '@/services/api';
import type { Post } from '@/types';

const POPULAR_TAGS = ['Architecture', 'Nature', 'Alps', 'Sculpture', 'Museum', 'Cityscape', 'Night', 'Historical'];
const RECENT = ['Swiss Alps', 'Sculpture', 'Paris'];

const GAP = 2;
const COLUMNS = 3;
const ITEM_SIZE = (Dimensions.get('window').width - GAP * (COLUMNS - 1)) / COLUMNS;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    api.getFeed(1, 50).then(setPosts).catch(() => setPosts([]));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return posts.filter(
      (p) =>
        p.caption.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.user.username.toLowerCase().includes(q) ||
        p.hashtags.some((tag) => tag.toLowerCase().includes(q.replace(/^#/, '')))
    );
  }, [query, posts]);

  const openPost = (post: Post) => router.push({ pathname: '/asset-viewer', params: { postId: post.id } });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scenes, places, tags or people"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim() ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={COLUMNS}
          columnWrapperStyle={{ marginBottom: GAP }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.gridItem, index % COLUMNS !== COLUMNS - 1 && { marginRight: GAP }]}
              onPress={() => openPost(item)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
              <View style={styles.gridLabel}>
                <Text style={styles.gridLabelText} numberOfLines={1}>
                  {item.location || item.user.username}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.resultsTitle}>
              {results.length} {results.length === 1 ? 'result' : 'results'} for "{query.trim()}"
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No scenes match that yet.</Text>
            </View>
          }
        />
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular tags</Text>
            <View style={styles.tags}>
              {POPULAR_TAGS.map((tag) => (
                <TouchableOpacity key={tag} style={styles.tag} onPress={() => setQuery(tag)}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {RECENT.map((item) => (
              <TouchableOpacity key={item} style={styles.recentItem} onPress={() => setQuery(item)}>
                <Ionicons name="time-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.recentText}>{item}</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceInset,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagText: {
    color: Colors.primaryDark,
    fontSize: 14,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  resultsTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  gridLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  gridLabelText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
});

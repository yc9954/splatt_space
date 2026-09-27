import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { getPostFromCache, setPostInCache, updatePostInCache } from '@/contexts/PostContext';
import { api } from '@/services/api';
import { StorageService } from '@/services/storage';
import type { Post } from '@/types';

/**
 * Overlay locally known like/comment state on top of server posts.
 * Priority: in-memory cache (most recent user action) > AsyncStorage > server.
 */
async function mergeLocalState(posts: Post[]): Promise<Post[]> {
  const postCounts = await StorageService.getPostCounts();
  const likesState = await StorageService.getLikesState();

  return posts.map((post) => {
    const cached = getPostFromCache(post.id);
    const storedCounts = postCounts[post.id];
    const storedLike = likesState[post.id];

    let merged: Post = post;
    if (cached) {
      merged = { ...post, likesCount: cached.likesCount, commentsCount: cached.commentsCount, isLiked: cached.isLiked };
    } else if (storedCounts || storedLike !== undefined) {
      merged = {
        ...post,
        likesCount: storedCounts?.likesCount ?? post.likesCount,
        commentsCount: storedCounts?.commentsCount ?? post.commentsCount,
        isLiked: storedLike ?? post.isLiked,
      };
    }
    if (merged.likesCount === 0 && merged.isLiked) merged = { ...merged, isLiked: false };
    return merged;
  });
}

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      await StorageService.validateAndFixLikeState();
      const data = await api.getFeed();
      const merged = await mergeLocalState(data);
      merged.forEach((post) => setPostInCache(post.id, post));
      setPosts(merged);
    } catch (err) {
      console.warn('Failed to load feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Reflect likes/comments made on other screens when coming back.
  useFocusEffect(
    useCallback(() => {
      if (isLoading || posts.length === 0) return;
      mergeLocalState(posts).then((merged) => {
        const changed = merged.some((p, i) => {
          const o = posts[i];
          return p.likesCount !== o.likesCount || p.commentsCount !== o.commentsCount || p.isLiked !== o.isLiked;
        });
        if (changed) setPosts(merged);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, posts.length])
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    load();
  }, [load]);

  /** Optimistic like toggle shared by feed cards. */
  const toggleLike = useCallback(async (post: Post) => {
    const nextLiked = !post.isLiked;
    const nextCount = Math.max(0, post.likesCount + (nextLiked ? 1 : -1));
    const optimistic = { ...post, isLiked: nextLiked, likesCount: nextCount };

    setPosts((current) => current.map((p) => (p.id === post.id ? optimistic : p)));
    updatePostInCache(post.id, optimistic);
    await StorageService.saveLikeState(post.id, nextLiked);
    await StorageService.savePostCounts(post.id, { likesCount: nextCount, commentsCount: post.commentsCount });

    try {
      if (nextLiked) await api.likePost(post.id);
      else await api.unlikePost(post.id);
    } catch (err) {
      console.warn('Like request failed, keeping local state:', err);
    }
  }, []);

  return { posts, isLoading, isRefreshing, error, refresh, toggleLike };
}

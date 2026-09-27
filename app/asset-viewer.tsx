import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SplatViewer } from '@/components/SplatViewer';
import { Colors, Radii } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { updatePostInCache } from '@/contexts/PostContext';
import { avatarUrl } from '@/lib/avatar';
import { compactNumber, timeAgo } from '@/lib/time';
import { api } from '@/services/api';
import { StorageService } from '@/services/storage';
import type { Comment, Post } from '@/types';

export default function AssetViewerScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (!postId) return;
    loadPost();
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  /** Local like/comment state wins over the server so optimistic updates survive navigation. */
  const loadPost = async () => {
    try {
      await StorageService.validateAndFixLikeState();
      const fresh = await api.getPost(postId);
      const storedCounts = await StorageService.getPostCount(postId);
      const storedLike = await StorageService.getLikeState(postId);

      let merged: Post = { ...fresh };
      if (storedCounts === null && storedLike === null) {
        await StorageService.savePostCounts(postId, { likesCount: fresh.likesCount, commentsCount: fresh.commentsCount });
        await StorageService.saveLikeState(postId, fresh.isLiked);
      } else {
        if (storedCounts) merged = { ...merged, likesCount: storedCounts.likesCount, commentsCount: storedCounts.commentsCount };
        if (storedLike !== null) merged = { ...merged, isLiked: storedLike };
      }
      if (merged.likesCount === 0 && merged.isLiked) {
        merged.isLiked = false;
        await StorageService.saveLikeState(postId, false);
      }
      setPost(merged);
      updatePostInCache(postId, merged);
    } catch (error) {
      console.warn('Failed to load post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      setComments(await api.getComments(postId));
    } catch (error) {
      console.warn('Failed to load comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const persistCounts = async (next: Post) => {
    await StorageService.saveLikeState(next.id, next.isLiked);
    await StorageService.savePostCounts(next.id, { likesCount: next.likesCount, commentsCount: next.commentsCount });
    updatePostInCache(next.id, next);
  };

  const handleLike = async () => {
    if (!post || isLiking) return;
    setIsLiking(true);
    const wasLiked = post.isLiked;
    const optimistic = { ...post, isLiked: !wasLiked, likesCount: Math.max(0, post.likesCount + (wasLiked ? -1 : 1)) };
    setPost(optimistic);
    await persistCounts(optimistic);
    try {
      if (wasLiked) await api.unlikePost(post.id);
      else await api.likePost(post.id);
    } catch (error: any) {
      if (error?.code !== '23505') console.warn('Like request failed, keeping local state:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text || !post || isSubmitting) return;
    setIsSubmitting(true);
    const optimistic = { ...post, commentsCount: post.commentsCount + 1 };
    setPost(optimistic);
    await persistCounts(optimistic);
    try {
      const { comment } = await api.createComment(post.id, text);
      setComments((current) => [comment, ...current]);
      setCommentText('');
    } catch (error) {
      console.warn('Comment request failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    const optimistic = { ...post, commentsCount: Math.max(0, post.commentsCount - 1) };
    setPost(optimistic);
    setComments((current) => current.filter((c) => c.id !== commentId));
    await persistCounts(optimistic);
    try {
      await api.deleteComment(commentId);
    } catch (error) {
      console.warn('Delete comment failed:', error);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwn = user?.id === item.userId;
    return (
      <View style={styles.commentItem}>
        <TouchableOpacity onPress={() => router.push(`/user/${item.user.id}`)}>
          <Image source={{ uri: avatarUrl(item.user) }} style={styles.commentAvatar} />
        </TouchableOpacity>
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <TouchableOpacity onPress={() => router.push(`/user/${item.user.id}`)}>
              <Text style={styles.commentUsername}>{item.user.username}</Text>
            </TouchableOpacity>
            <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
            {isOwn && (
              <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteButton} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  if (isLoading || !post) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  const has3D = post.is3D && !!post.image3dUrl;

  return (
    <View style={styles.container}>
      <View style={styles.viewer}>
        {has3D ? (
          <SplatViewer
            source={post.image3dUrl!}
            removeBackground={post.editMetadata?.removeBackground}
            textOverlay={post.editMetadata?.textOverlay}
            textPosition={post.editMetadata?.textPosition}
            textColor={post.editMetadata?.textColor}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="contain" />
        )}
      </View>

      <SafeAreaView style={styles.topBar} edges={['top']} pointerEvents="box-none">
        <TouchableOpacity onPress={() => router.back()} style={styles.roundButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.author} onPress={() => router.push(`/user/${post.user.id}`)} activeOpacity={0.8}>
          <Image source={{ uri: avatarUrl(post.user) }} style={styles.authorAvatar} />
          <View>
            <Text style={styles.authorName}>{post.user.username}</Text>
            {post.location ? <Text style={styles.authorLocation}>{post.location}</Text> : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowInfo((v) => !v)} style={styles.roundButton} hitSlop={8}>
          <Ionicons name={showInfo ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.white} />
        </TouchableOpacity>
      </SafeAreaView>

      {showInfo && (
        <SafeAreaView style={styles.bottomBar} edges={['bottom']} pointerEvents="box-none">
          <View style={styles.rail}>
            <TouchableOpacity style={styles.railButton} onPress={handleLike} activeOpacity={0.8}>
              <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={30} color={post.isLiked ? Colors.like : Colors.white} />
              <Text style={styles.railText}>{compactNumber(post.likesCount)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.railButton} onPress={() => setShowComments(true)} activeOpacity={0.8}>
              <Ionicons name="chatbubble-outline" size={28} color={Colors.white} />
              <Text style={styles.railText}>{compactNumber(post.commentsCount)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.railButton} activeOpacity={0.8}>
              <Ionicons name="paper-plane-outline" size={28} color={Colors.white} />
              <Text style={styles.railText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.captionBlock}>
            {has3D && (
              <View style={styles.chip}>
                <Ionicons name="cube-outline" size={12} color={Colors.white} />
                <Text style={styles.chipText}>Gaussian splat</Text>
              </View>
            )}
            <Text style={styles.caption} numberOfLines={3}>
              {post.caption}
            </Text>
            {post.hashtags.length > 0 && (
              <Text style={styles.hashtags} numberOfLines={1}>
                {post.hashtags.map((tag) => `#${tag}`).join(' ')}
              </Text>
            )}
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.commentInputRow}>
              <Image source={{ uri: avatarUrl(user) }} style={styles.inputAvatar} />
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={commentText}
                onChangeText={setCommentText}
                maxLength={500}
                onSubmitEditing={handleSubmitComment}
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
                style={[styles.sendButton, (!commentText.trim() || isSubmitting) && styles.sendButtonDisabled]}
              >
                {isSubmitting ? <ActivityIndicator size="small" color={Colors.white} /> : <Ionicons name="send" size={18} color={Colors.white} />}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}

      <Modal visible={showComments} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowComments(false)}>
        <SafeAreaView style={styles.modal} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setShowComments(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          {isLoadingComments ? (
            <View style={styles.modalCenter}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <View style={styles.modalCenter}>
                  <Ionicons name="chatbubble-outline" size={44} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No comments yet. Say something nice.</Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  viewer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  author: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  authorName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  authorLocation: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  rail: {
    position: 'absolute',
    right: 12,
    bottom: 190,
    alignItems: 'center',
    gap: 18,
  },
  railButton: {
    alignItems: 'center',
    gap: 4,
  },
  railText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  captionBlock: {
    paddingHorizontal: 16,
    paddingRight: 80,
    paddingBottom: 12,
    gap: 6,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(74,144,226,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  chipText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  caption: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hashtags: {
    color: '#93C5FD',
    fontSize: 13,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.white,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4B5563',
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});

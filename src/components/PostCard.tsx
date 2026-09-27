import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Radii } from '@/constants/theme';
import { avatarUrl } from '@/lib/avatar';
import { compactNumber, timeAgo } from '@/lib/time';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  onPress: (postId: string) => void;
  onLike: (post: Post) => void;
  onComment: (postId: string) => void;
  onUserPress?: (userId: string) => void;
}

/**
 * Feed card ported from the Figma redesign: avatar + location header,
 * square capture with a 3D badge and play affordance, action row,
 * like count, caption, hashtags and relative time.
 */
export function PostCard({ post, onPress, onLike, onComment, onUserPress }: PostCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onUserPress?.(post.user.id)}
          activeOpacity={onUserPress ? 0.7 : 1}
        >
          <Image source={{ uri: avatarUrl(post.user) }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{post.user.username}</Text>
            {post.location ? (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.location}>{post.location}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.92} onPress={() => onPress(post.id)}>
        <View style={styles.imageContainer}>
          {imageError ? (
            <View style={styles.imageFallback}>
              <Ionicons name="image-outline" size={48} color={Colors.textMuted} />
            </View>
          ) : (
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
          {imageLoading && !imageError && (
            <View style={styles.imageFallback}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          )}
          {post.is3D && (
            <>
              <View style={styles.badge3D}>
                <Ionicons name="cube-outline" size={12} color={Colors.white} />
                <Text style={styles.badge3DText}>3D</Text>
              </View>
              <View style={styles.playOverlay} pointerEvents="none">
                <View style={styles.playButton}>
                  <Ionicons name="play" size={26} color={Colors.white} style={{ marginLeft: 3 }} />
                </View>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onLike(post)} hitSlop={6}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={26}
              color={post.isLiked ? Colors.like : Colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onComment(post.id)} hitSlop={6}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} hitSlop={6}>
            <Ionicons name="paper-plane-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity hitSlop={6}>
          <Ionicons name="bookmark-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.likes}>{compactNumber(post.likesCount)} likes</Text>

      <Text style={styles.caption} numberOfLines={3}>
        <Text style={styles.captionUsername}>{post.user.username} </Text>
        {post.caption}
      </Text>
      {post.hashtags.length > 0 && (
        <Text style={styles.hashtags} numberOfLines={1}>
          {post.hashtags.map((tag) => `#${tag}`).join(' ')}
        </Text>
      )}

      {post.commentsCount > 0 && (
        <TouchableOpacity onPress={() => onComment(post.id)}>
          <Text style={styles.viewComments}>
            View {post.commentsCount === 1 ? '1 comment' : `all ${post.commentsCount} comments`}
          </Text>
        </TouchableOpacity>
      )}
      <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    paddingBottom: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceInset,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceInset,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceInset,
  },
  badge3D: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  badge3DText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 14,
  },
  actionButton: {
    padding: 2,
  },
  likes: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  caption: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  captionUsername: {
    fontWeight: '600',
  },
  hashtags: {
    fontSize: 14,
    color: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  viewComments: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
});

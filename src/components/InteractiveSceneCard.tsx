import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Radii } from '@/constants/theme';
import type { Post } from '@/types';

import { SplatViewer } from './SplatViewer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = Math.round(SCREEN_HEIGHT * 0.46);

interface InteractiveSceneCardProps {
  post: Post;
  onPress?: (postId: string) => void;
}

/**
 * Hero card at the top of the feed: a live, auto-rotating Gaussian splat
 * with the post's location and a call-to-action overlay.
 */
export function InteractiveSceneCard({ post, onPress }: InteractiveSceneCardProps) {
  const source = post.image3dUrl;
  if (!source) return null;

  return (
    <View style={styles.container}>
      <SplatViewer
        source={source}
        autoRotate
        autoRotateSpeed={0.6}
        transparentBackground
        removeBackground={post.editMetadata?.removeBackground}
        textOverlay={post.editMetadata?.textOverlay}
        textPosition={post.editMetadata?.textPosition}
        textColor={post.editMetadata?.textColor}
        style={styles.viewer}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={14} color={Colors.white} />
          <Text style={styles.badgeText}>Featured capture</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {post.location || post.caption}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            by {post.user.username}. Drag to look around, pinch to move closer.
          </Text>
        </View>

        {onPress && (
          <TouchableOpacity style={styles.cta} onPress={() => onPress(post.id)} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Open scene</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: Colors.black,
  },
  viewer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B1020',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 22,
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    gap: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  info: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.pill,
  },
  ctaText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Radii } from '@/constants/theme';
import { avatarUrl } from '@/lib/avatar';
import { compactNumber } from '@/lib/time';
import type { Post, User } from '@/types';

export type ProfileTab = 'posts' | '3d';

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onEditProfile?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  /** Other people's profiles: follow state and handler. */
  isFollowing?: boolean;
  isFollowLoading?: boolean;
  onFollowToggle?: () => void;
  demoNote?: string;
}

/**
 * Profile header ported from the redesign: avatar beside the primary
 * action, bio block, bordered stats row and Posts / 3D Gallery tabs.
 */
export function ProfileHeader({
  user,
  isOwnProfile,
  activeTab,
  onTabChange,
  onEditProfile,
  onFollowersPress,
  onFollowingPress,
  isFollowing = false,
  isFollowLoading = false,
  onFollowToggle,
  demoNote,
}: ProfileHeaderProps) {
  const verified = user.followersCount >= 5000;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Image source={{ uri: avatarUrl(user) }} style={styles.avatar} />
        {isOwnProfile ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={onEditProfile} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Edit profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, isFollowing && styles.secondaryButton]}
            onPress={onFollowToggle}
            disabled={isFollowLoading}
            activeOpacity={0.8}
          >
            {isFollowLoading ? (
              <ActivityIndicator size="small" color={isFollowing ? Colors.text : Colors.white} />
            ) : (
              <Text style={[styles.primaryButtonText, isFollowing && styles.secondaryButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bioBlock}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName}>{user.username}</Text>
          {verified && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
        </View>
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        {demoNote ? (
          <View style={styles.demoRow}>
            <Ionicons name="flask-outline" size={14} color={Colors.primaryDark} />
            <Text style={styles.demoText}>{demoNote}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{compactNumber(user.postsCount)}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.stat} onPress={onFollowersPress} disabled={!onFollowersPress}>
          <Text style={styles.statNumber}>{compactNumber(user.followersCount)}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.stat} onPress={onFollowingPress} disabled={!onFollowingPress}>
          <Text style={styles.statNumber}>{compactNumber(user.followingCount)}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'posts' && styles.tabActive]} onPress={() => onTabChange('posts')}>
          <Ionicons name="grid-outline" size={18} color={activeTab === 'posts' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === '3d' && styles.tabActive]} onPress={() => onTabChange('3d')}>
          <Ionicons name="cube-outline" size={18} color={activeTab === '3d' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === '3d' && styles.tabTextActive]}>3D gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GAP = 2;
const COLUMNS = 3;
const ITEM_SIZE = (Dimensions.get('window').width - GAP * (COLUMNS - 1)) / COLUMNS;

interface ProfileGridProps {
  posts: Post[];
  onPostPress: (postId: string) => void;
  header: React.ReactElement;
  empty: React.ReactElement;
}

/** Three-column gallery with 3D badges, used by own and other profiles. */
export function ProfileGrid({ posts, onPostPress, header, empty }: ProfileGridProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      columnWrapperStyle={{ marginBottom: GAP }}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.gridContent}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={[styles.gridItem, index % COLUMNS !== COLUMNS - 1 && { marginRight: GAP }]}
          onPress={() => onPostPress(item.id)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.gridImage} resizeMode="cover" />
          {item.is3D && (
            <View style={styles.badge3D}>
              <Text style={styles.badge3DText}>3D</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    backgroundColor: Colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.surfaceInset,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  bioBlock: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  demoText: {
    fontSize: 12,
    color: Colors.primaryDark,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  stat: {
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  gridContent: {
    paddingBottom: 24,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badge3DText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

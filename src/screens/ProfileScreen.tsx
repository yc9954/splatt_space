import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const profileData = {
  username: 'wanderlust_explorer',
  displayName: 'Alex Chen',
  avatar:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  bio: 'Travel enthusiast 🌍 | 3D content creator | Exploring the world one place at a time',
  website: 'travelspace3d.com',
  location: 'Seoul, South Korea',
  stats: {
    posts: 124,
    followers: '2.5K',
    following: 892,
  },
  gallery: [
    'https://images.unsplash.com/photo-1570097703229-b195d6dd291f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1603477849227-705c424d1d80?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1640871426525-a19540c45a39?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1570097703229-b195d6dd291f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?w=400&h=400&fit=crop',
  ],
};

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'posts' | '3d'>('posts');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{profileData.username}</Text>
        <TouchableOpacity>
          <Icon name="more-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile info */}
        <View style={styles.profileInfo}>
          <View style={styles.profileHeader}>
            <Image
              source={{uri: profileData.avatar}}
              style={styles.avatar}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Name and bio */}
          <View style={styles.bioContainer}>
            <Text style={styles.displayName}>{profileData.displayName}</Text>
            <Text style={styles.bio}>{profileData.bio}</Text>
            <TouchableOpacity style={styles.websiteContainer}>
              <Icon name="external-link" size={16} color="#4A90E2" />
              <Text style={styles.website}>{profileData.website}</Text>
            </TouchableOpacity>
            <View style={styles.locationContainer}>
              <Icon name="map-pin" size={16} color="#6B7280" />
              <Text style={styles.location}>{profileData.location}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}>
              <Icon
                name="grid"
                size={20}
                color={activeTab === 'posts' ? '#4A90E2' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'posts' && styles.activeTabText,
                ]}>
                Posts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === '3d' && styles.activeTab]}
              onPress={() => setActiveTab('3d')}>
              <Icon
                name="box"
                size={20}
                color={activeTab === '3d' ? '#4A90E2' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === '3d' && styles.activeTabText,
                ]}>
                3D Gallery
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gallery grid */}
          <View style={styles.gallery}>
            {profileData.gallery.map((image, index) => (
              <TouchableOpacity key={index} style={styles.galleryItem}>
                <Image source={{uri: image}} style={styles.galleryImage} />
                <View style={styles.badge3D}>
                  <Text style={styles.badge3DText}>3D</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bioContainer: {
    marginBottom: 16,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  website: {
    fontSize: 14,
    color: '#4A90E2',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
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
  activeTab: {
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#4A90E2',
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 80,
  },
  galleryItem: {
    width: '32.5%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  badge3D: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badge3DText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

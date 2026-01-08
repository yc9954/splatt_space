import React from 'react';
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

interface Post {
  id: number;
  username: string;
  userAvatar: string;
  location: string;
  image: string;
  likes: number;
  caption: string;
  hashtags: string[];
  comments: number;
  timeAgo: string;
  is3D: boolean;
}

const mockPosts: Post[] = [
  {
    id: 1,
    username: 'wanderlust_explorer',
    userAvatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    location: 'Paris, France',
    image:
      'https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc2Nzg1MDMwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 1234,
    caption:
      'The city of lights never disappoints! Captured this stunning 3D view of the Eiffel Tower at sunset.',
    hashtags: ['#travel', '#3D', '#Paris', '#EiffelTower'],
    comments: 48,
    timeAgo: '2 hours ago',
    is3D: true,
  },
  {
    id: 2,
    username: 'adventure_seeker',
    userAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    location: 'Santorini, Greece',
    image:
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzY3ODA2OTAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 2567,
    caption:
      'Blue domes and white architecture - Santorini in all its glory. Swipe to explore in 3D!',
    hashtags: ['#Santorini', '#Greece', '#3DTravel', '#Wanderlust'],
    comments: 89,
    timeAgo: '5 hours ago',
    is3D: true,
  },
  {
    id: 3,
    username: 'mountain_lover',
    userAvatar:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    location: 'Swiss Alps, Switzerland',
    image:
      'https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3Njc4NDA5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 3891,
    caption:
      'Breathtaking views from the Swiss Alps. The depth in this 3D capture is incredible!',
    hashtags: ['#SwissAlps', '#Mountains', '#3DCapture', '#NatureLovers'],
    comments: 124,
    timeAgo: '1 day ago',
    is3D: true,
  },
];

function PostCard({post}: {post: Post}) {
  return (
    <View style={styles.postCard}>
      {/* Post header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{uri: post.userAvatar}}
            style={styles.userAvatar}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.username}>{post.username}</Text>
            <View style={styles.locationContainer}>
              <Icon name="map-pin" size={12} color="#6B7280" />
              <Text style={styles.location}>{post.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Icon name="more-vertical" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* 3D Image content */}
      <View style={styles.imageContainer}>
        <Image source={{uri: post.image}} style={styles.postImage} />
        {post.is3D && (
          <>
            <View style={styles.badge3D}>
              <Text style={styles.badge3DText}>3D</Text>
            </View>
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Icon name="play" size={32} color="#FFFFFF" />
              </View>
            </View>
          </>
        )}
      </View>

      {/* Interaction bar */}
      <View style={styles.interactions}>
        <View style={styles.interactionButtons}>
          <TouchableOpacity style={styles.interactionButton}>
            <Icon name="heart" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton}>
            <Icon name="message-circle" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton}>
            <Icon name="send" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Icon name="bookmark" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <View style={styles.likesContainer}>
        <Text style={styles.likesText}>
          {post.likes.toLocaleString()} likes
        </Text>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.captionUsername}>{post.username} </Text>
          {post.caption}
        </Text>
        <Text style={styles.hashtags}>{post.hashtags.join(' ')}</Text>
      </View>

      {/* Comments */}
      <TouchableOpacity>
        <Text style={styles.viewComments}>
          View all {post.comments} comments
        </Text>
      </TouchableOpacity>

      {/* Timestamp */}
      <Text style={styles.timeAgo}>{post.timeAgo}</Text>
    </View>
  );
}

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="globe" size={24} color="#4A90E2" />
        <Text style={styles.headerTitle}>TravelSpace</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="message-square" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="bell" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mockPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingBottom: 16,
  },
  postHeader: {
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
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  badge3D: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badge3DText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  interactionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  interactionButton: {
    padding: 4,
  },
  likesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  caption: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: '600',
  },
  hashtags: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 4,
  },
  viewComments: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
});

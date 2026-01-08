import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreVertical,
  MapPin,
  Play,
  Bell,
  MessageSquare,
  Globe,
} from 'lucide-react';
import { BottomNav } from './BottomNav';

interface FeedScreenProps {
  onNavigate: (screen: 'feed' | 'profile') => void;
}

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
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    location: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc2Nzg1MDMwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 1234,
    caption: 'The city of lights never disappoints! Captured this stunning 3D view of the Eiffel Tower at sunset.',
    hashtags: ['#travel', '#3D', '#Paris', '#EiffelTower'],
    comments: 48,
    timeAgo: '2 hours ago',
    is3D: true,
  },
  {
    id: 2,
    username: 'adventure_seeker',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    location: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzY3ODA2OTAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 2567,
    caption: 'Blue domes and white architecture - Santorini in all its glory. Swipe to explore in 3D!',
    hashtags: ['#Santorini', '#Greece', '#3DTravel', '#Wanderlust'],
    comments: 89,
    timeAgo: '5 hours ago',
    is3D: true,
  },
  {
    id: 3,
    username: 'mountain_lover',
    userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    location: 'Swiss Alps, Switzerland',
    image: 'https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3Njc4NDA5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 3891,
    caption: 'Breathtaking views from the Swiss Alps. The depth in this 3D capture is incredible!',
    hashtags: ['#SwissAlps', '#Mountains', '#3DCapture', '#NatureLovers'],
    comments: 124,
    timeAgo: '1 day ago',
    is3D: true,
  },
];

function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white mb-4">
      {/* Post header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={post.userAvatar}
            alt={post.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm" style={{ fontWeight: 600 }}>
              {post.username}
            </p>
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-3 h-3" />
              <p className="text-xs">{post.location}</p>
            </div>
          </div>
        </div>
        <button>
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 3D Image content */}
      <div className="relative w-full aspect-square bg-gray-100">
        <img src={post.image} alt={post.location} className="w-full h-full object-cover" />
        {post.is3D && (
          <>
            <div className="absolute top-4 right-4 bg-[#4A90E2] text-white px-3 py-1 rounded-full text-xs flex items-center gap-1" style={{ fontWeight: 600 }}>
              <span>3D</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 backdrop-blur-sm rounded-full p-4 cursor-pointer hover:bg-black/40 transition-colors">
                <Play className="w-8 h-8 text-white" fill="white" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Interaction bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button className="hover:text-red-500 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
            <button className="hover:text-[#4A90E2] transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="hover:text-[#4A90E2] transition-colors">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button className="hover:text-[#4A90E2] transition-colors">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Likes and tagged users */}
        <div className="mb-2">
          <p className="text-sm">
            <span style={{ fontWeight: 600 }}>{post.likes.toLocaleString()} likes</span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-white"></div>
              <div className="w-5 h-5 rounded-full bg-gray-400 border-2 border-white"></div>
              <div className="w-5 h-5 rounded-full bg-gray-500 border-2 border-white"></div>
            </div>
            <p className="text-xs text-gray-600">and 3 others</p>
          </div>
        </div>

        {/* Caption */}
        <div className="mb-2">
          <p className="text-sm">
            <span style={{ fontWeight: 600 }} className="mr-2">
              {post.username}
            </span>
            {post.caption}
          </p>
          <p className="text-sm text-[#4A90E2] mt-1">
            {post.hashtags.join(' ')}
          </p>
        </div>

        {/* Comments */}
        <button className="text-sm text-gray-500 mb-2">
          View all {post.comments} comments
        </button>

        {/* Sample comments */}
        <div className="space-y-1 mb-2">
          <p className="text-sm">
            <span style={{ fontWeight: 600 }} className="mr-2">
              travel_enthusiast
            </span>
            Amazing capture! 😍
          </p>
          <p className="text-sm">
            <span style={{ fontWeight: 600 }} className="mr-2">
              photo_explorer
            </span>
            Need to visit here soon!
          </p>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-400">{post.timeAgo}</p>
      </div>
    </div>
  );
}

export function FeedScreen({ onNavigate }: FeedScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Globe className="w-6 h-6 text-[#4A90E2]" />
          <h1 className="text-xl" style={{ fontWeight: 700 }}>
            TravelSpace
          </h1>
          <div className="flex items-center gap-4">
            <button>
              <MessageSquare className="w-6 h-6 text-gray-700" />
            </button>
            <button>
              <Bell className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Feed content */}
      <div className="max-w-md mx-auto">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Bottom navigation */}
      <BottomNav activeScreen="feed" onNavigate={onNavigate} />
    </div>
  );
}

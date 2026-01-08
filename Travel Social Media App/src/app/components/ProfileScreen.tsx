import { ArrowLeft, MoreVertical, MapPin, Grid, Box, ExternalLink } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface ProfileScreenProps {
  onNavigate: (screen: 'feed' | 'profile') => void;
}

const profileData = {
  username: 'wanderlust_explorer',
  displayName: 'Alex Chen',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
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

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={() => onNavigate('feed')}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-base" style={{ fontWeight: 600 }}>
            @{profileData.username}
          </h1>
          <button>
            <MoreVertical className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Profile content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Profile picture and edit button */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={profileData.avatar}
            alt={profileData.displayName}
            className="w-24 h-24 rounded-full object-cover"
          />
          <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors" style={{ fontWeight: 600 }}>
            Edit Profile
          </button>
        </div>

        {/* Name and bio */}
        <div className="mb-4">
          <h2 className="text-lg mb-2" style={{ fontWeight: 600 }}>
            {profileData.displayName}
          </h2>
          <p className="text-sm text-gray-700 mb-2 leading-relaxed">{profileData.bio}</p>
          <a href="#" className="text-sm text-[#4A90E2] flex items-center gap-1 mb-1">
            <ExternalLink className="w-4 h-4" />
            {profileData.website}
          </a>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{profileData.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around py-4 border-y border-gray-200 mb-4">
          <div className="text-center">
            <p className="text-lg" style={{ fontWeight: 600 }}>
              {profileData.stats.posts}
            </p>
            <p className="text-sm text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg" style={{ fontWeight: 600 }}>
              {profileData.stats.followers}
            </p>
            <p className="text-sm text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg" style={{ fontWeight: 600 }}>
              {profileData.stats.following}
            </p>
            <p className="text-sm text-gray-600">Following</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 mb-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border-b-2 border-[#4A90E2] text-[#4A90E2]">
            <Grid className="w-5 h-5" />
            <span className="text-sm" style={{ fontWeight: 600 }}>
              Posts
            </span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-400">
            <Box className="w-5 h-5" />
            <span className="text-sm" style={{ fontWeight: 600 }}>
              3D Gallery
            </span>
          </button>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-3 gap-1">
          {profileData.gallery.map((image, index) => (
            <div key={index} className="relative aspect-square bg-gray-100">
              <img src={image} alt={`Post ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-[#4A90E2] text-white px-2 py-0.5 rounded text-xs" style={{ fontWeight: 600 }}>
                3D
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <BottomNav activeScreen="profile" onNavigate={onNavigate} />
    </div>
  );
}

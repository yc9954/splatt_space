import { Home, Camera, User } from 'lucide-react';

interface BottomNavProps {
  activeScreen: 'feed' | 'profile';
  onNavigate: (screen: 'feed' | 'profile') => void;
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around py-3 max-w-md mx-auto">
        <button
          onClick={() => onNavigate('feed')}
          className="flex flex-col items-center gap-1 p-2"
        >
          <Home
            className={`w-6 h-6 ${
              activeScreen === 'feed' ? 'text-[#4A90E2]' : 'text-gray-400'
            }`}
            fill={activeScreen === 'feed' ? '#4A90E2' : 'none'}
          />
        </button>

        <button className="flex flex-col items-center gap-1 p-2 -mt-6">
          <div className="bg-gradient-to-br from-[#4A90E2] to-[#FF6B35] rounded-full p-3 shadow-lg">
            <Camera className="w-7 h-7 text-white" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center gap-1 p-2"
        >
          <User
            className={`w-6 h-6 ${
              activeScreen === 'profile' ? 'text-[#4A90E2]' : 'text-gray-400'
            }`}
            fill={activeScreen === 'profile' ? '#4A90E2' : 'none'}
          />
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { FeedScreen } from './components/FeedScreen';
import { ProfileScreen } from './components/ProfileScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'feed' | 'profile'>('feed');

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {activeScreen === 'feed' ? (
        <FeedScreen onNavigate={setActiveScreen} />
      ) : (
        <ProfileScreen onNavigate={setActiveScreen} />
      )}
    </div>
  );
}

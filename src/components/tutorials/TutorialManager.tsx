import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArtistTutorial } from './ArtistTutorial';
import { UserTutorial } from './UserTutorial';

export function TutorialManager() {
  const { user, isInitialized } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only check tutorial state once auth is initialized and we haven't checked before
    if (isInitialized && user && !initialized) {
      const tutorialKey = user.role === 'artist' 
        ? 'metal_aloud_artist_tutorial_completed'
        : 'metal_aloud_user_tutorial_completed';

      const tutorialCompleted = localStorage.getItem(tutorialKey);
      setShowTutorial(!tutorialCompleted);
      setInitialized(true);
    }
  }, [user, isInitialized, initialized]);

  // Force tutorial for testing (remove in production)
  const resetTutorial = () => {
    if (user) {
      const tutorialKey = user.role === 'artist' 
        ? 'metal_aloud_artist_tutorial_completed'
        : 'metal_aloud_user_tutorial_completed';
      localStorage.removeItem(tutorialKey);
      setShowTutorial(true);
    }
  };

  if (!showTutorial || !user) return null;

  return (
    <>
      {user.role === 'artist' ? <ArtistTutorial /> : <UserTutorial />}
      {import.meta.env.DEV && (
        <button
          onClick={resetTutorial}
          className="fixed bottom-4 left-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm z-50"
        >
          Reset Tutorial
        </button>
      )}
    </>
  );
}
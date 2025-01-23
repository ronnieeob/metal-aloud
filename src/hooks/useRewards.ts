import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from '../contexts/AuthContext';

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'discount' | 'download' | 'content' | 'event';
  metadata?: Record<string, any>;
}

interface UserRewards {
  points: number;
  history: {
    id: string;
    date: string;
    points: number;
    reason: string;
  }[];
  redeemedRewards: {
    id: string;
    rewardId: string;
    date: string;
  }[];
}

const INITIAL_USER_REWARDS: UserRewards = {
  points: 0,
  history: [],
  redeemedRewards: []
};

const INITIAL_REWARDS: Reward[] = [
  {
    id: 'free-download',
    name: 'Free Song Download',
    description: 'Download any song for free',
    points: 500,
    type: 'download'
  },
  {
    id: 'merch-discount',
    name: '25% Off Merch',
    description: 'Get 25% off your next merch purchase',
    points: 1000,
    type: 'discount',
    metadata: { percentage: 25 }
  },
  {
    id: 'exclusive-content',
    name: 'Exclusive Interview',
    description: 'Access to exclusive artist interviews',
    points: 2000,
    type: 'content'
  },
  {
    id: 'vip-access',
    name: 'VIP Concert Access',
    description: 'Get VIP access to virtual concerts',
    points: 5000,
    type: 'event'
  }
];

export function useRewards() {
  const { user } = useAuth();
  const [userRewards, setUserRewards] = useState<UserRewards>(INITIAL_USER_REWARDS);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && user) {
      loadInitialRewards();
      setInitialized(true);
    }
  }, [initialized, user]);

  async function loadInitialRewards() {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Load saved rewards from localStorage
      const savedRewards = localStorage.getItem(`metal_aloud_user_rewards_${user.id}`);
      if (savedRewards) {
        try {
          const parsed = JSON.parse(savedRewards);
          setUserRewards(parsed);
          setAvailableRewards(INITIAL_REWARDS);
          setInitialized(true);
        } catch (err) {
          console.error('Failed to parse saved rewards:', err);
          setUserRewards(INITIAL_USER_REWARDS);
          setAvailableRewards(INITIAL_REWARDS);
        }
      } else {
        setUserRewards(INITIAL_USER_REWARDS);
        setAvailableRewards(INITIAL_REWARDS);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  // Award points for various actions
  const awardPoints = (points: number, reason: string) => {
    if (!user) return;
    
    try {
      setUserRewards(prev => {
        const newRewards = {
          ...prev,
          points: prev.points + points,
          history: [
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              points,
              reason
            },
            ...prev.history
          ]
        };
        
        // Persist to localStorage
        localStorage.setItem(`metal_aloud_user_rewards_${user.id}`, JSON.stringify(newRewards));
        
        return newRewards;
      });
    } catch (err) {
      console.error('Failed to award points:', err);
      setError('Failed to award points');
    }
  };

  const redeemReward = (rewardId: string): boolean => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      const reward = availableRewards.find(r => r.id === rewardId);
      if (!reward) {
        setError('Reward not found');
        return false;
      }

      if (userRewards.points < reward.points) {
        setError('Not enough points');
        return false;
      }

      setUserRewards(prev => {
        const newRewards = {
          ...prev,
          points: prev.points - reward.points,
          redeemedRewards: [
            {
              id: crypto.randomUUID(),
              rewardId,
              date: new Date().toISOString()
            },
            ...prev.redeemedRewards
          ]
        };
        
        // Persist to localStorage
        localStorage.setItem(`metal_aloud_user_rewards_${user.id}`, JSON.stringify(newRewards));
        
        return newRewards;
      });

      return true;
    } catch (err) {
      console.error('Failed to redeem reward:', err);
      setError('Failed to redeem reward');
      return false;
    }
  };

  // Award points for specific actions
  const handleSongPlay = () => awardPoints(10, 'Listened to a song');
  const handleSongLike = () => awardPoints(50, 'Liked a song');
  const handlePlaylistCreate = () => awardPoints(100, 'Created a playlist');
  const handleArtistFollow = () => awardPoints(75, 'Followed an artist');
  const handleContentShare = () => awardPoints(25, 'Shared content');

  return {
    points: userRewards.points,
    history: userRewards.history,
    redeemedRewards: userRewards.redeemedRewards,
    availableRewards,
    loading,
    error,
    awardPoints,
    redeemReward,
    handleSongPlay,
    handleSongLike,
    handlePlaylistCreate,
    handleArtistFollow,
    handleContentShare
  };
}
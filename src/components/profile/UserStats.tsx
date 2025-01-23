import React from 'react';
import { Clock, Headphones, Star, Award, Share2, Users } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';

export function UserStats() {
  const { stats, achievements, loading } = useUserProfile();
  const [referralCount, setReferralCount] = React.useState(0);

  if (loading || !stats) return null;

  const generateShareLink = () => {
    const shareUrl = `${window.location.origin}/join?ref=${btoa(stats.userId)}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Referral link copied to clipboard!');
  };

  const formatListeningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Your Metal Journey</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-red-400" />
            <span className="text-xs text-red-400">Referrals</span>
          </div>
          <p className="text-2xl font-bold">{referralCount}</p>
          <button
            onClick={generateShareLink}
            className="flex items-center space-x-1 text-sm text-red-400 hover:text-red-300 mt-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share & Earn</span>
          </button>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-red-400">Total Time</span>
          </div>
          <p className="text-2xl font-bold">{formatListeningTime(stats.totalListeningTime)}</p>
          <p className="text-sm text-gray-400">Time spent headbanging</p>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-6 h-6 text-red-400" />
            <span className="text-xs text-red-400">Favorite Genre</span>
          </div>
          <p className="text-2xl font-bold">{stats.favoriteGenre}</p>
          <p className="text-sm text-gray-400">Your preferred style</p>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Headphones className="w-6 h-6 text-red-400" />
            <span className="text-xs text-red-400">Top Artist</span>
          </div>
          <p className="text-2xl font-bold">{stats.topArtist}</p>
          <p className="text-sm text-gray-400">Most played artist</p>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6 text-red-400" />
            <span className="text-xs text-red-400">Achievements</span>
          </div>
          <p className="text-2xl font-bold">{achievements.length}</p>
          <p className="text-sm text-gray-400">Unlocked badges</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-red-400">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className="flex items-center space-x-4 bg-zinc-900/30 p-4 rounded-lg border border-red-900/10"
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <h4 className="font-semibold">{achievement.name}</h4>
                <p className="text-sm text-gray-400">{achievement.description}</p>
                {achievement.unlockedAt && (
                  <p className="text-xs text-red-400 mt-1">
                    Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
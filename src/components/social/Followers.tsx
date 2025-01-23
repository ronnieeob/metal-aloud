import React from 'react';
import { UserPlus, Users } from 'lucide-react';
import { useSocialActions } from '../../hooks/useSocialActions';
import { useAuth } from '../../contexts/AuthContext';

export function Followers() {
  const { user } = useAuth();
  const { 
    followers, 
    following,
    followUser,
    unfollowUser,
    isFollowing,
    loading 
  } = useSocialActions();

  if (!user) return null;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-red-500">Your Network</h3>
        <div className="flex space-x-4">
          <div className="text-sm">
            <span className="text-gray-400">Following: </span>
            <span className="font-semibold">{following.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Followers: </span>
            <span className="font-semibold">{followers.length}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Following Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">People You Follow</h4>
          <div className="grid gap-4 grid-cols-2">
            {following.map((user) => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-xs text-gray-400">{user.followers.length} followers</p>
                  </div>
                </div>
                
                <button
                  onClick={() => unfollowUser(user.id)}
                  disabled={loading}
                  className="px-3 py-1 text-sm rounded-full bg-red-900/20 text-red-400 hover:bg-red-900/30 transition"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Followers Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Your Followers</h4>
          <div className="grid gap-4 grid-cols-2">
            {followers.map((follower) => (
              <div 
                key={follower.id}
                className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={follower.avatarUrl}
                    alt={follower.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium">{follower.name}</h4>
                    <p className="text-xs text-gray-400">{follower.followers.length} followers</p>
                  </div>
                </div>
                
                {!isFollowing(follower.id) && (
                  <button
                    onClick={() => followUser(follower.id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition flex items-center space-x-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Follow Back</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
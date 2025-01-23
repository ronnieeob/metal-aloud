import React, { useState } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { useAuth } from '../../contexts/AuthContext';
import { useSocialActions } from '../../hooks/useSocialActions';

export function UserSearch() {
  const { query, setQuery, results, loading, error } = useSearch();
  const { user } = useAuth();
  const { followUser, isFollowing } = useSocialActions();
  const [showResults, setShowResults] = useState(false);

  const handleFollow = async (userId: string) => {
    if (!user) return;
    await followUser(userId);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users..."
          className="w-full bg-zinc-800/50 border border-red-900/20 rounded-lg p-2 text-white"
          onFocus={() => setShowResults(true)}
        />
      </div>

      {showResults && query && (
        <div className="absolute w-full bg-zinc-900 rounded-lg border border-red-900/20 shadow-lg z-10">
          {results?.users?.map((foundUser) => (
            <div
              key={foundUser.id}
              className="flex items-center justify-between p-4 hover:bg-red-900/20 transition"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={foundUser.avatarUrl}
                  alt={foundUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-medium">{foundUser.name}</h4>
                  <p className="text-sm text-gray-400">{foundUser.bio}</p>
                </div>
              </div>
              {user && user.id !== foundUser.id && (
                <button
                  onClick={() => handleFollow(foundUser.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full transition ${
                    isFollowing(foundUser.id)
                      ? 'bg-red-900/20 text-red-400'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isFollowing(foundUser.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
          {results?.users?.length === 0 && (
            <p className="text-center text-gray-400 p-4">No users found</p>
          )}
        </div>
      )}
    </div>
  );
}
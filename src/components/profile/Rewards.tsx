import React from 'react';
import { useRewards } from '../../hooks/useRewards';
import { Gift, Star, Clock, Award } from 'lucide-react';

export function Rewards() {
  const { 
    points, 
    history, 
    redeemedRewards, 
    availableRewards,
    redeemReward,
    loading,
    error 
  } = useRewards();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-red-500">
          <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-red-500">
          <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  const handleRedeem = (rewardId: string) => {
    const success = redeemReward(rewardId);
    if (success) {
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg';
      successMessage.textContent = 'Reward redeemed successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } else if (error) {
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg';
      errorMessage.textContent = error;
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-red-900/20 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">🎸 Metal Rewards Program</h3>
        <p className="text-sm text-gray-300">
          Earn points for every minute you listen and each friend you refer.
          Redeem points for exclusive content and merch discounts!
        </p>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-red-500">Metal Rewards</h2>
          <div className="flex items-center space-x-2 bg-red-900/20 px-4 py-2 rounded-lg">
            <Star className="w-5 h-5 text-red-400" />
            <span className="font-bold">{points} points</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableRewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-zinc-900/50 rounded-lg p-4 border border-red-900/10"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{reward.name}</h3>
                <div className="flex items-center space-x-1 text-red-400">
                  <Star className="w-4 h-4" />
                  <span>{reward.points}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
              <button
                onClick={() => handleRedeem(reward.id)}
                disabled={points < reward.points}
                className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition ${
                  points >= reward.points
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Redeem</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
        <h3 className="text-xl font-bold text-red-500 mb-4">Redeemed Rewards</h3>
        <div className="space-y-4">
          {redeemedRewards.map((redeemedReward) => {
            const reward = availableRewards.find(r => r.id === redeemedReward.rewardId);
            if (!reward) return null;
            return (
              <div
                key={redeemedReward.id}
                className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-red-900/10"
              >
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-red-400" />
                  <div>
                    <h4 className="font-medium">{reward.name}</h4>
                    <p className="text-sm text-gray-400">
                      {new Date(redeemedReward.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-red-400">-{reward.points} points</span>
              </div>
            );
          })}
          {redeemedRewards.length === 0 && (
            <p className="text-center text-gray-400 py-4">No rewards redeemed yet</p>
          )}
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
        <h3 className="text-xl font-bold text-red-500 mb-4">Points History</h3>
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-red-900/10"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-red-400" />
                <div>
                  <h4 className="font-medium">{entry.reason}</h4>
                  <p className="text-sm text-gray-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`text-sm ${entry.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {entry.points > 0 ? '+' : ''}{entry.points} points
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-gray-400 py-4">No points history yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
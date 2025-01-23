import React from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { useSocialActions } from '../../hooks/useSocialActions';
import { useAuth } from '../../contexts/AuthContext';

export function FriendRequests() {
  const { user } = useAuth();
  const { 
    pendingRequests, 
    acceptFriendRequest, 
    rejectFriendRequest,
    loading 
  } = useSocialActions();

  if (!user) return null;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4 border border-red-900/20">
      <h3 className="text-lg font-semibold text-red-500 mb-4">Friend Requests</h3>
      
      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div 
            key={request.id}
            className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg hover:bg-red-900/20 transition"
          >
            <div className="flex items-center space-x-3">
              <img
                src={request.senderAvatar}
                alt={request.senderName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="font-medium">{request.senderName}</h4>
                <p className="text-sm text-gray-400">
                  {new Date(request.sentAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => acceptFriendRequest(request.id)}
                disabled={loading}
                className="p-2 rounded-full bg-green-600/20 text-green-400 hover:bg-green-600/30 transition"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => rejectFriendRequest(request.id)}
                disabled={loading}
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {pendingRequests.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No pending friend requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
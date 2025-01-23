import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PlaylistView } from '../playlist/PlaylistView';
import { PlaylistModal } from '../playlist/PlaylistModal';
import { Plus } from 'lucide-react';

export function UserPlaylists() {
  const { user } = useAuth();
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-500">Your Playlists</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Playlist</span>
        </button>
      </div>

      <div className="grid gap-6">
        {user?.playlists.map((playlist) => (
          <PlaylistView
            key={playlist.id}
            playlist={playlist}
            onRemoveSong={(songId) => {
              // Remove song logic will be implemented here
            }}
          />
        ))}
      </div>

      {showModal && (
        <PlaylistModal
          onClose={() => setShowModal(false)}
          onSave={(playlist) => {
            // Create playlist logic will be implemented here
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
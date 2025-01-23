import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Playlist } from '../../types';
import { useRewards } from '../../hooks/useRewards';

interface PlaylistModalProps {
  onClose: () => void;
  onSave: (playlist: Omit<Playlist, 'id' | 'songs'>) => void;
}

export function PlaylistModal({ onClose, onSave }: PlaylistModalProps) {
  const [name, setName] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const { handlePlaylistCreate } = useRewards();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, coverUrl });
    handlePlaylistCreate(); // Award points for creating a playlist
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">Create Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              placeholder="My Metal Playlist"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white rounded py-2 hover:bg-red-700 transition flex items-center justify-center space-x-2"
          >
            <Music className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </form>
      </div>
    </div>
  );
}
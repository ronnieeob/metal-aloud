import React, { useState } from 'react';
import { X, Music, Upload } from 'lucide-react';
import { Song } from '../../types';

interface BandSongUploadModalProps {
  bandId: string;
  onClose: () => void;
  onUpload: (song: Omit<Song, 'id'>) => Promise<void>;
}

export function BandSongUploadModal({ bandId, onClose, onUpload }: BandSongUploadModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    album: '',
    coverUrl: '',
    audioFile: null as File | null,
    price: 0.99,
    lyrics: '',
    releaseDate: '',
    isExplicit: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpload({
      ...formData,
      artist: '', // Will be set by the server based on the band
      duration: 0, // Will be calculated by the server
      artistId: bandId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">Upload Song</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Album</label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData({ ...formData, album: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Audio File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFormData({ ...formData, audioFile: e.target.files?.[0] || null })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lyrics</label>
            <textarea
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              className="w-full h-32 bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              placeholder="Enter song lyrics..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isExplicit}
                onChange={(e) => setFormData({ ...formData, isExplicit: e.target.checked })}
                className="rounded bg-zinc-700 border-red-900/20"
              />
              <span>Contains explicit content</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              step="0.01"
              min="0"
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center space-x-2"
            >
              <Music className="w-4 h-4" />
              <span>Upload Song</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
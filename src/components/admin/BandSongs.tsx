import React, { useState } from 'react';
import { Plus, Play, Trash2, Upload, Music } from 'lucide-react';
import { Song } from '../../types';
import { BandSongUploadModal } from './BandSongUploadModal';

interface BandSongsProps {
  bandId: string;
  songs: Song[];
  onAddSong: (song: Omit<Song, 'id'>) => Promise<void>;
  onDeleteSong: (songId: string) => Promise<void>;
  onPlaySong: (song: Song) => void;
}

export function BandSongs({ bandId, songs, onAddSong, onDeleteSong, onPlaySong }: BandSongsProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleDelete = async (songId: string) => {
    if (confirm('Are you sure you want to delete this song?')) {
      await onDeleteSong(songId);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Band Songs</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Song</span>
        </button>
      </div>

      <div className="space-y-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center justify-between p-3 bg-zinc-900/50 rounded hover:bg-red-900/30 transition group"
          >
            <div className="flex items-center space-x-3">
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-10 h-10 rounded"
              />
              <div>
                <h4 className="font-medium">{song.title}</h4>
                <p className="text-sm text-gray-400">{song.album}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPlaySong(song)}
                className="p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(song.id)}
                className="p-2 rounded-full bg-red-900/20 text-red-400 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {songs.length === 0 && (
          <p className="text-center text-gray-400 py-4">
            No songs uploaded yet
          </p>
        )}
      </div>

      {showUploadModal && (
        <BandSongUploadModal
          bandId={bandId}
          onClose={() => setShowUploadModal(false)}
          onUpload={onAddSong}
        />
      )}
    </div>
  );
}
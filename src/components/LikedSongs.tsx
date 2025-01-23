import React from 'react';
import { useLikedSongs } from '../hooks/useLikedSongs';
import { Song } from '../types';
import { Play, Heart } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

export function LikedSongs() {
  const { likedSongs, error } = useLikedSongs();
  const { dispatch } = usePlayer();

  const handlePlaySong = (song: Song) => {
    if (!song.audioUrl) {
      alert('Preview not available for this song');
      return;
    }
    dispatch({ type: 'SET_SONG', payload: song });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-52 h-52 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center">
          <Heart className="w-24 h-24 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
          <p className="text-gray-400">{likedSongs.length} songs</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {likedSongs.map((song) => (
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
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
            </div>
            
            <button
              onClick={() => handlePlaySong(song)}
              className="p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
              disabled={!song.audioUrl}
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        ))}

        {likedSongs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No liked songs yet</p>
            <p className="text-sm">Start liking songs to build your collection</p>
          </div>
        )}
      </div>
    </div>
  );
}
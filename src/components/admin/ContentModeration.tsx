import React from 'react';
import { Song } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Play, Flag, CheckCircle, XCircle } from 'lucide-react';

export function ContentModeration() {
  const [songs, setSongs] = useLocalStorage<(Song & { flagged?: boolean })[]>('metal_aloud_songs', []);
  const [selectedSong, setSelectedSong] = React.useState<Song | null>(null);

  const handleApproveSong = (songId: string) => {
    setSongs(songs.map(song =>
      song.id === songId ? { ...song, flagged: false } : song
    ));
  };

  const handleRemoveSong = (songId: string) => {
    if (confirm('Are you sure you want to remove this song?')) {
      setSongs(songs.filter(song => song.id !== songId));
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Content Moderation</h2>
      
      <div className="space-y-4">
        {songs.filter(s => s.flagged).map(song => (
          <div 
            key={song.id}
            className="bg-zinc-900/50 rounded-lg p-4 flex items-center justify-between border border-red-900/10"
          >
            <div className="flex items-center space-x-4">
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold">{song.title}</h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedSong(song)}
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition"
              >
                <Play className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleApproveSong(song.id)}
                className="p-2 rounded-full bg-green-600/20 text-green-400 hover:bg-green-600/30 transition"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleRemoveSong(song.id)}
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        
        {songs.filter(s => s.flagged).length === 0 && (
          <p className="text-center text-gray-400">No flagged content</p>
        )}
      </div>
    </div>
  );
}
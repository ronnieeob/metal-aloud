import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Playlist, Song } from '../types';
import { Play, Plus } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { PlaylistModal } from './playlist/PlaylistModal';

export function LibrarySection() {
  const [showModal, setShowModal] = React.useState(false);
  const [playlists] = useLocalStorage<Playlist[]>('metal_aloud_playlists', []);
  const { dispatch } = usePlayer();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handlePlaySong = (song: Song) => {
    if (!song.audioUrl) {
      alert('Preview not available for this song');
      return;
    }
    dispatch({ type: 'SET_SONG', payload: song });
  };

  const handleCreatePlaylist = (playlistData: Omit<Playlist, 'id' | 'songs'>) => {
    const playlist = {
      ...playlistData,
      id: crypto.randomUUID(),
      songs: []
    };
    setSelectedPlaylist(playlist);
    // Handle playlist creation
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl metal-font text-red-500">Your Library</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      <div className="grid gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold">{playlist.name}</h3>
                  <p className="text-sm text-gray-400">{playlist.songs.length} songs</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {playlist.songs.map((song) => (
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

              {playlist.songs.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  No songs in this playlist
                </p>
              )}
            </div>
          </div>
        ))}

        {playlists.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No playlists yet</p>
            <p className="text-sm mt-2">Create a playlist to start organizing your music</p>
          </div>
        )}
      </div>

      {showModal && (
        <PlaylistModal
          onClose={() => setShowModal(false)}
          onSave={(playlist) => {
            // Handle playlist creation
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
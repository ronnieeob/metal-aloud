import React, { useState } from 'react';
import { Music, Image, Plus, X } from 'lucide-react';
import { FileUploadZone } from './FileUploadZone';

interface Album {
  name: string;
  year: string;
  coverFile: File | null;
  songFiles: File[];
}

interface AlbumUploadProps {
  albums: Album[];
  setAlbums: React.Dispatch<React.SetStateAction<Album[]>>;
  onSongsUploaded: (files: File[]) => void;
}

export function AlbumUpload({ albums, setAlbums, onSongsUploaded }: AlbumUploadProps) {
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);
  const [newAlbum, setNewAlbum] = useState<Album>({
    name: '',
    year: new Date().getFullYear().toString(),
    coverFile: null,
    songFiles: []
  });

  const handleAddAlbum = () => {
    if (!newAlbum.name || !newAlbum.year) return;
    
    setAlbums(prev => [...prev, newAlbum]);
    onSongsUploaded(newAlbum.songFiles);
    setNewAlbum({
      name: '',
      year: new Date().getFullYear().toString(),
      coverFile: null,
      songFiles: []
    });
    setShowNewAlbumForm(false);
  };

  const handleRemoveAlbum = (index: number) => {
    setAlbums(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Albums</h3>
        <button
          onClick={() => setShowNewAlbumForm(true)}
          className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Album</span>
        </button>
      </div>

      {showNewAlbumForm && (
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-red-900/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Album Name</label>
              <input
                type="text"
                value={newAlbum.name}
                onChange={(e) => setNewAlbum(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-red-900/20 rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Release Year</label>
              <input
                type="number"
                value={newAlbum.year}
                onChange={(e) => setNewAlbum(prev => ({ ...prev, year: e.target.value }))}
                className="w-full bg-zinc-800 border border-red-900/20 rounded p-2"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                <Image className="w-4 h-4 text-red-400" />
                <span>Album Cover</span>
              </h4>
              <FileUploadZone
                type="images"
                accept="image/*"
                multiple={false}
                maxSize={5}
                onFilesSelected={(files) => setNewAlbum(prev => ({ ...prev, coverFile: files[0] }))}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                <Music className="w-4 h-4 text-red-400" />
                <span>Songs</span>
              </h4>
              <FileUploadZone
                type="songs"
                accept="audio/*"
                multiple={true}
                maxSize={20}
                onFilesSelected={(files) => setNewAlbum(prev => ({ ...prev, songFiles: files }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowNewAlbumForm(false)}
              className="px-3 py-1 text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAlbum}
              disabled={!newAlbum.name || !newAlbum.year || !newAlbum.coverFile || newAlbum.songFiles.length === 0}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
            >
              Add Album
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {albums.map((album, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 rounded-lg p-4 border border-red-900/20"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{album.name}</h4>
                <p className="text-sm text-gray-400">{album.year}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {album.songFiles.length} songs
                </p>
              </div>
              <button
                onClick={() => handleRemoveAlbum(index)}
                className="p-1 hover:bg-red-900/20 rounded-full"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
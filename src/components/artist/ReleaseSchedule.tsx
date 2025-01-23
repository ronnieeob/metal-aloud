import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { ReleaseModal } from './ReleaseModal';

interface Release {
  id: string;
  title: string;
  type: 'single' | 'album' | 'ep';
  releaseDate: string;
  status: 'scheduled' | 'released' | 'delayed';
  description?: string;
}

export function ReleaseSchedule() {
  const { user } = useAuth();
  const [releases, setReleases] = useLocalStorage<Release[]>(`metal_aloud_releases_${user?.id}`, []);
  const [showModal, setShowModal] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);

  const handleSaveRelease = (release: Omit<Release, 'id'>) => {
    if (editingRelease) {
      setReleases(prev => prev.map(r => 
        r.id === editingRelease.id ? { ...release, id: editingRelease.id } : r
      ));
    } else {
      const newRelease = {
        ...release,
        id: crypto.randomUUID(),
        artistId: user?.id,
        createdAt: new Date().toISOString()
      };
      setReleases(prev => [...prev, newRelease]);
    }
    setShowModal(false);
    setEditingRelease(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this release?')) {
      setReleases(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-500">Release Schedule</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Release</span>
        </button>
      </div>

      <div className="space-y-4">
        {releases.map((release) => (
          <div
            key={release.id}
            className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-red-900/10"
          >
            <div>
              <h3 className="font-semibold text-lg">{release.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="capitalize">{release.type}</span>
                <span>•</span>
                <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
                <span>•</span>
                <span className={`capitalize ${
                  release.status === 'released' ? 'text-green-400' :
                  release.status === 'delayed' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>{release.status}</span>
              </div>
              {release.description && (
                <p className="text-sm text-gray-400 mt-2">{release.description}</p>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setEditingRelease(release);
                  setShowModal(true);
                }}
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(release.id)}
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {releases.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No releases scheduled</p>
          </div>
        )}
      </div>
      
      {showModal && (
        <ReleaseModal
          onClose={() => {
            setShowModal(false);
            setEditingRelease(null);
          }}
          onSave={handleSaveRelease}
          release={editingRelease || undefined}
        />
      )}
    </div>
  );
}
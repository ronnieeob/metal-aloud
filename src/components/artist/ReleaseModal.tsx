import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

interface ReleaseModalProps {
  onClose: () => void;
  onSave: (release: Omit<Release, 'id'>) => void;
  release?: Release;
}

interface Release {
  id: string;
  title: string;
  type: 'single' | 'album' | 'ep';
  releaseDate: string;
  status: 'scheduled' | 'released' | 'delayed';
  description?: string;
}

export function ReleaseModal({ onClose, onSave, release }: ReleaseModalProps) {
  const [formData, setFormData] = useState({
    title: release?.title || '',
    type: release?.type || 'single',
    releaseDate: release?.releaseDate || new Date().toISOString().split('T')[0],
    status: release?.status || 'scheduled',
    description: release?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">
            {release ? 'Edit Release' : 'Schedule Release'}
          </h2>
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
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Release['type'] })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
            >
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Release Date</label>
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Release['status'] })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
            >
              <option value="scheduled">Scheduled</option>
              <option value="released">Released</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-32 bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              placeholder="Add any additional details about the release..."
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
              <Calendar className="w-4 h-4" />
              <span>{release ? 'Update Release' : 'Schedule Release'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
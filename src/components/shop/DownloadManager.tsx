import React, { useState, useEffect } from 'react';
import { Download, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DownloadItem {
  id: string;
  songId: string;
  title: string;
  artist: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
}

export function DownloadManager() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Load saved downloads
      const savedDownloads = localStorage.getItem(`metal_aloud_downloads_${user.id}`);
      if (savedDownloads) {
        setDownloads(JSON.parse(savedDownloads));
      }
    }
  }, [user]);

  const startDownload = async (songId: string, title: string, artist: string) => {
    if (!user) return;

    // Create download URL
    const downloadUrl = `${window.location.origin}/api/download/${songId}`;

    const download: DownloadItem = {
      id: crypto.randomUUID(),
      songId,
      title,
      artist,
      progress: 0,
      status: 'pending'
    };

    setDownloads(prev => {
      const updated = [...prev, download];
      localStorage.setItem(`metal_aloud_downloads_${user.id}`, JSON.stringify(updated));
      return updated;
    });

    try {
      // Create anchor element
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${title} - ${artist}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Mark as completed
      updateStatus(download.id, 'completed');
    } catch (err) {
      updateStatus(download.id, 'failed', err instanceof Error ? err.message : 'Download failed');
    }
  };

  const updateProgress = (downloadId: string, progress: number) => {
    setDownloads(prev => {
      const updated = prev.map(d =>
        d.id === downloadId ? { ...d, progress } : d
      );
      localStorage.setItem(`metal_aloud_downloads_${user!.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const updateStatus = (downloadId: string, status: DownloadItem['status'], error?: string) => {
    setDownloads(prev => {
      const updated = prev.map(d =>
        d.id === downloadId ? { ...d, status, error } : d
      );
      localStorage.setItem(`metal_aloud_downloads_${user!.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Downloads</h2>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {downloads.map((download) => (
          <div
            key={download.id}
            className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{download.title}</h3>
                <p className="text-sm text-gray-400">{download.artist}</p>
              </div>
              {download.status === 'completed' ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : download.status === 'failed' ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <Download className="w-5 h-5 text-blue-400" />
              )}
            </div>

            {download.status === 'downloading' && (
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${download.progress}%` }}
                />
              </div>
            )}

            {download.error && (
              <p className="text-sm text-red-400 mt-2">{download.error}</p>
            )}
          </div>
        ))}

        {downloads.length === 0 && (
          <p className="text-center text-gray-400 py-8">No downloads yet</p>
        )}
      </div>
    </div>
  );
}
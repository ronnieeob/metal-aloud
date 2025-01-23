import React from 'react';
import { ArtistProfile } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Check, X } from 'lucide-react';

export function ArtistVerification() {
  const [profiles, setProfiles] = useLocalStorage<ArtistProfile[]>('metal_aloud_artist_profiles', []);

  const handleVerify = (profileId: string) => {
    setProfiles(profiles.map(profile =>
      profile.id === profileId ? { ...profile, verified: true } : profile
    ));
  };

  const handleReject = (profileId: string) => {
    if (confirm('Are you sure you want to reject this artist?')) {
      setProfiles(profiles.filter(profile => profile.id !== profileId));
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Artist Verification</h2>
      
      <div className="grid gap-6">
        {profiles.filter(p => !p.verified).map(profile => (
          <div 
            key={profile.id}
            className="bg-zinc-900/50 rounded-lg p-4 flex items-center justify-between border border-red-900/10"
          >
            <div>
              <h3 className="font-semibold text-lg">{profile.bio.split('\n')[0]}</h3>
              <p className="text-sm text-gray-400 mt-1">{profile.website}</p>
              <div className="flex gap-2 mt-2">
                {Object.entries(profile.socialLinks).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      {platform}
                    </a>
                  )
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleVerify(profile.id)}
                className="p-2 rounded-full bg-green-600/20 text-green-400 hover:bg-green-600/30 transition"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleReject(profile.id)}
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        
        {profiles.filter(p => !p.verified).length === 0 && (
          <p className="text-center text-gray-400">No pending verifications</p>
        )}
      </div>
    </div>
  );
}
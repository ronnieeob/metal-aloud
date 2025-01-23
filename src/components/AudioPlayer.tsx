import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { Waveform } from './Waveform';
import { useLikedSongs } from '../hooks/useLikedSongs';
import { useRewards } from '../hooks/useRewards';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

export function AudioPlayer() {
  const { state, dispatch } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, setIsLoading] = useState(false);
  const { isLiked, toggleLike } = useLikedSongs();
  const { handleSongPlay } = useRewards();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  // Use IntersectionObserver for waveform rendering
  const waveformRef = useRef<HTMLDivElement>(null);
  const [showWaveform, setShowWaveform] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Only render waveform when visible
            setShowWaveform(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (waveformRef.current) {
      observer.observe(waveformRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLike = () => {
    if (!state.currentSong) return;
    toggleLike(state.currentSong);
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      audioRef.current.preload = 'auto';
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentSong) return;

    // Reset error and loading states
    setError(null);
    setIsLoading(true);
    
    // Reset error state on new song
    setError(null);

    const playAudio = async () => {
      try {
        await audio.play();
        retryCountRef.current = 0;
        handleSongPlay(); // Award points when song starts playing
      } catch (err) {
        console.error('Playback failed:', err);
        if (retryCountRef.current < RETRY_ATTEMPTS) {
          retryCountRef.current++;
          setTimeout(playAudio, RETRY_DELAY);
        } else {
          setError('Failed to play audio. Please try another song.');
          dispatch({ type: 'TOGGLE_PLAY' });
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (state.isPlaying) {
        playAudio();
      }
    };

    const handleError = () => {
      setError('This song is currently unavailable. Please try another one.');
      dispatch({ type: 'TOGGLE_PLAY' });
      setIsLoading(false);
    };
    const handleEnded = () => {
      // Play next song if available
      if (state.queue.length > 0) {
        dispatch({ type: 'SET_SONG', payload: state.queue[0] });
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: state.queue[0].id });
      } else {
        dispatch({ type: 'TOGGLE_PLAY' });
      }
    };

    audio.src = state.currentSong.audioUrl;
    audio.volume = state.volume;

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    if (state.isPlaying) {
      playAudio();
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, [state.currentSong, state.isPlaying, state.volume]);

  useEffect(() => {
    if (state.currentSong && state.isPlaying) {
      handleSongPlay();
      if (state.queue.length > 0) {
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: state.queue[0].id });
      }
    }
  }, [state.currentSong, state.isPlaying, handleSongPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audioRef]);

  const handlePlayPause = () => {
    dispatch({ type: 'TOGGLE_PLAY' });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    dispatch({ type: 'SET_VOLUME', payload: volume });
    
    // Save volume preference
    localStorage.setItem('metal_aloud_volume', volume.toString());
  };

  // Load saved volume on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem('metal_aloud_volume');
    if (savedVolume !== null) {
      dispatch({ type: 'SET_VOLUME', payload: parseFloat(savedVolume) });
    }
  }, []);

  if (!state.currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg text-white p-2 md:p-4 border-t border-red-900/20 z-50">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-screen-xl mx-auto space-y-2 md:space-y-0">
        {error && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="bg-red-900/90 text-white px-4 py-2 rounded-t text-sm">
              {error}
            </div>
          </div>
        )}
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <img
            src={state.currentSong.coverUrl}
            alt={state.currentSong.title}
            className="w-12 h-12 rounded-md object-cover"
          />
          <div>
            <h4 className="text-sm font-semibold text-red-100">{state.currentSong.title}</h4>
            <p className="text-xs text-red-400">{state.currentSong.artist}</p>
            <div className="mt-1 hidden md:block">
              <button
                onClick={handleLike}
                className={`text-sm ${isLiked(state.currentSong.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
              >
                <Heart className="w-4 h-4" fill={isLiked(state.currentSong.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center w-full md:flex-1 md:max-w-2xl md:mx-8">
          <div className="flex items-center space-x-6">
            <button className="hover:text-red-400 transition">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-full bg-red-600 text-white hover:scale-105 transition"
              onClick={handlePlayPause}
            >
              {state.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <button className="hover:text-gray-300 transition">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          <div ref={waveformRef} className="w-full mt-2">
            {showWaveform && <Waveform audioRef={audioRef} progress={progress} />}
          </div>
        </div>
        
        <div className="hidden lg:flex items-center space-x-2">
          <Volume2 className="w-5 h-5" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.volume}
            onChange={handleVolumeChange}
            className="w-24 accent-white"
          />
        </div>
      </div>
    </div>
  );
}
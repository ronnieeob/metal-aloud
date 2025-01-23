import { useRef, useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { state, dispatch } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    if (state.currentSong) {
      audio.src = state.currentSong.audioUrl;
      if (state.isPlaying) {
        audio.play();
      } else {
        audio.pause();
      }
    }

    audio.volume = state.volume;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [state.currentSong, state.isPlaying, state.volume]);

  return audioRef;
}
import React, { useEffect, useRef } from 'react';

export function Waveform({ audioRef, progress }: { audioRef: React.RefObject<HTMLAudioElement>, progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaElementSourceNode>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    
    if (!canvas || !audio) return;
    
    try {
      // Create audio context and nodes only once
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      // Create source node only once per audio element
      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
    
      const draw = () => {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
      
        analyserRef.current!.getByteFrequencyData(dataArray);
      
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
      
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;
        
          const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
          gradient.addColorStop(0, '#dc2626'); // red-600
          gradient.addColorStop(1, '#991b1b'); // red-800
        
          ctx.fillStyle = gradient;
        
          // Only show bars up to the current progress
          if (x / WIDTH <= progress / 100) {
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
          }
        
          x += barWidth + 1;
        }
        
        if (audio.paused) return;
        requestAnimationFrame(draw);
      };
    
      draw();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } catch (err) {
      console.error('Waveform error:', err);
      // Fallback to simple progress bar
      return (
        <div className="w-full h-[40px] rounded-lg bg-zinc-900">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-800 rounded-lg transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      );
    }
  }, [audioRef.current, progress]); // Re-run when audio element or progress changes
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const animationId = animationRef.current;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [audioRef]);
  
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={40}
      className="w-full rounded-lg"
    />
  );
}
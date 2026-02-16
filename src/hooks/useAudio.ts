import { useState, useEffect, useRef } from 'react';

interface UseAudioProps {
  src: string;
  volume?: number;
  loop?: boolean;
}

export const useAudio = ({ src, volume = 1, loop = false }: UseAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    audioRef.current = audio;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [src, volume, loop]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const fadeOut = (duration = 1000) => {
    if (!audioRef.current) return;
    
    const steps = 20;
    const stepTime = duration / steps;
    const volStep = audioRef.current.volume / steps;

    const interval = setInterval(() => {
      if (audioRef.current && audioRef.current.volume > 0) {
        const newVol = Math.max(0, audioRef.current.volume - volStep);
        audioRef.current.volume = newVol;
      } else {
        clearInterval(interval);
        pause();
      }
    }, stepTime);
  };

  return { play, pause, fadeOut, isPlaying, audioRef };
};

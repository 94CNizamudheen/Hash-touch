import { useRef, useCallback } from 'react';
import notificationSound from '@/assets/new-notification.mp3';

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on first use
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(notificationSound);
      audioRef.current.volume = 0.7; // Set volume to 70%
    }
  }, []);

  const playSound = useCallback(() => {
    initializeAudio();

    if (audioRef.current) {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;

      // Play the sound
      audioRef.current.play().catch((error) => {
        console.warn('Failed to play notification sound:', error);
      });
    }
  }, [initializeAudio]);

  return { playSound };
}

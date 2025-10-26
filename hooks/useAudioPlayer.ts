
import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext. It's best to do this once.
    // It must be created after a user gesture on some browsers.
    // We will ensure it is created/resumed before playing.
    return () => {
        // Cleanup on unmount
        audioContextRef.current?.close();
    }
  }, []);

  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
        // Fix for TypeScript error: Property 'webkitAudioContext' does not exist on type 'Window'. Cast window to `any` to allow for vendor-prefixed AudioContext.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const play = useCallback((audioBuffer: AudioBuffer) => {
    const context = ensureAudioContext();
    if (!context) return;

    // Stop any existing playback
    if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start();
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
      sourceNodeRef.current = null;
    };
    sourceNodeRef.current = source;
  }, [ensureAudioContext]);

  const pause = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      // 'stop' is final, so we nullify the ref. A true 'pause' is complex with Web Audio API.
      // For this app, stopping and re-playing from the start is sufficient.
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { play, pause, isPlaying, audioContext: audioContextRef.current, ensureAudioContext };
};

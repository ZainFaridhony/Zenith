
import React, { useState } from 'react';
import type { MeditationSession } from '../types';
import { generateMeditationScript, generateImage, generateSpeech } from '../services/geminiService';
import { decodeAudioData, decode } from '../utils/audioUtils';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import Spinner from './Spinner';
import { PlayIcon, PauseIcon, DownloadIcon } from './icons';

interface MeditationGeneratorProps {
  session: MeditationSession | null;
  setSession: (session: MeditationSession | null) => void;
}

const MeditationGenerator: React.FC<MeditationGeneratorProps> = ({ session, setSession }) => {
  const [prompt, setPrompt] = useState<string>('a 5-minute meditation on reducing anxiety');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  // Fix: Destructure `ensureAudioContext` to initialize AudioContext on user gesture.
  const { play, pause, isPlaying, ensureAudioContext } = useAudioPlayer();

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a topic for your meditation.');
      return;
    }
    setLoading(true);
    setError(null);
    setSession(null);

    try {
      // Fix: Ensure AudioContext is created on user gesture (button click).
      const audioContext = ensureAudioContext();

      setLoadingMessage('Crafting your meditation script...');
      const script = await generateMeditationScript(prompt);

      setLoadingMessage('Painting a tranquil scene...');
      const imagePrompt = `A serene, calming, and visually beautiful landscape that embodies the feeling of: ${prompt}. Photorealistic, high resolution.`;
      const imageUrl = await generateImage(imagePrompt);

      setLoadingMessage('Recording your guide\'s voice...');
      const audioData = await generateSpeech(script);

      if (audioData && audioContext) {
        const decodedBuffer = await decodeAudioData(decode(audioData), audioContext);
        
        const blob = new Blob([decode(audioData).buffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);

        setSession({ script, imageUrl, audio: { buffer: decodedBuffer, url: audioUrl } });
      } else {
        setSession({ script, imageUrl, audio: null });
        setError("Could not generate audio. You can still read the script.");
      }

    } catch (err) {
      console.error(err);
      setError('An error occurred while generating your session. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleTogglePlay = () => {
    if (session?.audio?.buffer) {
        if(isPlaying) {
            pause();
        } else {
            play(session.audio.buffer);
        }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Create Your Meditation</h2>
        <p className="text-text-secondary mt-1">Describe the meditation you'd like to experience.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., a 10-minute session for better sleep"
          className="flex-grow w-full px-4 py-2 bg-base rounded-md border border-border focus:ring-2 focus:ring-primary focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Session'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading && <Spinner message={loadingMessage} />}

      {session && !loading && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="relative rounded-lg overflow-hidden h-64 sm:h-80 w-full shadow-lg">
            <img src={session.imageUrl} alt="Meditation visual" className="w-full h-full object-cover" />
            {session.audio && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                 <button onClick={handleTogglePlay} className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300">
                    {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-base rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Meditation Script</h3>
                {session.audio?.url && (
                    <a href={session.audio.url} download="meditation.wav" className="flex items-center space-x-2 text-sm text-primary hover:underline">
                        <DownloadIcon className="w-4 h-4"/>
                        <span>Download Audio</span>
                    </a>
                )}
            </div>
            <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{session.script}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationGenerator;

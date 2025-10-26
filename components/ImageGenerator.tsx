
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A tranquil zen garden with a cherry blossom tree, photorealistic.');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Image Generator</h2>
        <p className="text-text-secondary mt-1">Bring your tranquil visions to life.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A peaceful lake at sunrise"
          className="flex-grow w-full px-4 py-2 bg-base rounded-md border border-border focus:ring-2 focus:ring-primary focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading && <Spinner message="Generating your image..." />}
      
      {generatedImage && !loading && (
        <div className="mt-6">
            <img src={generatedImage} alt={prompt} className="rounded-lg w-full max-w-lg mx-auto shadow-lg" />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;


import React, { useState } from 'react';
import type { View, MeditationSession } from './types';
import Header from './components/Header';
import MeditationGenerator from './components/MeditationGenerator';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import ChatBot from './components/ChatBot';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [view, setView] = useState<View>('meditation');
  const [session, setSession] = useState<MeditationSession | null>(null);

  const renderView = () => {
    switch (view) {
      case 'meditation':
        return <MeditationGenerator session={session} setSession={setSession} />;
      case 'image-editor':
        return <ImageEditor initialImage={session?.imageUrl || ''} />;
      case 'image-generator':
        return <ImageGenerator />;
      case 'chatbot':
        return <ChatBot />;
      default:
        return <MeditationGenerator session={session} setSession={setSession} />;
    }
  };

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <LogoIcon className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Zenith AI</h1>
        </div>
        <div className="bg-surface rounded-2xl shadow-subtle overflow-hidden">
          <Header currentView={view} setView={setView} />
          <main className="p-6">
            {renderView()}
          </main>
        </div>
        <footer className="text-center text-text-secondary mt-8 text-sm">
          <p>Crafted for tranquility. Powered by Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

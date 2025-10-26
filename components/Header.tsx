
import React from 'react';
import type { View } from '../types';
import { MeditateIcon, EditIcon, ImageIcon, ChatIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const navItems: { id: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'meditation', label: 'Meditation', icon: MeditateIcon },
    { id: 'image-generator', label: 'Image Gen', icon: ImageIcon },
    { id: 'image-editor', label: 'Image Edit', icon: EditIcon },
    { id: 'chatbot', label: 'Chat', icon: ChatIcon },
  ];

  return (
    <header className="bg-surface border-b border-border">
      <nav className="flex items-center justify-center sm:justify-start px-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-4 text-sm font-medium transition-colors duration-200 focus:outline-none ${
              currentView === item.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;

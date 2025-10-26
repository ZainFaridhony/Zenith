
export type View = 'meditation' | 'image-editor' | 'image-generator' | 'chatbot';

export interface MeditationSession {
  script: string;
  imageUrl: string;
  audio: {
    buffer: AudioBuffer;
    url: string;
  } | null;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface Chunk {
  text: string;
  meaning?: string;
  isWord: boolean;
  lemma?: string; // Original root form of the word (e.g., 'fui' -> 'ser/ir')
}

export interface Sentence {
  spanish: string;
  chinese: string;
  chunks: Chunk[];
}

export interface LessonData {
  scenario: string;
  sentences: Sentence[];
  tips: string;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  hasAudio: boolean;
}

export interface SavedWord extends Chunk {
  addedAt: number; // timestamp
  reviewCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  translation?: string;
  chunks?: Chunk[];
  isPlaying?: boolean;
}

export enum AppView {
  HOME = 'HOME',
  LOADING = 'LOADING',
  LESSON = 'LESSON',
  VOCABULARY = 'VOCABULARY',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS'
}
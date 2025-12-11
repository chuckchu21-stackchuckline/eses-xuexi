import { Chunk, SavedWord } from '../types';

const STORAGE_KEY = 'entorno_vocab_v1';
const A2_TARGET_COUNT = 1000; // Common estimated vocabulary size for A2 level
const DAILY_GOAL = 10;

export const getSavedWords = (): SavedWord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveWord = (chunk: Chunk): SavedWord[] => {
  const words = getSavedWords();
  
  // Prevent duplicates (check against text or lemma)
  const isDuplicate = words.some(w => 
    w.text.toLowerCase() === chunk.text.toLowerCase() || 
    (chunk.lemma && w.lemma && w.lemma.toLowerCase() === chunk.lemma.toLowerCase())
  );
  
  if (isDuplicate) {
    return words;
  }

  const newWord: SavedWord = {
    ...chunk,
    addedAt: Date.now(),
    reviewCount: 0
  };

  const newWords = [newWord, ...words];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newWords));
  return newWords;
};

export const removeWord = (text: string): SavedWord[] => {
  const words = getSavedWords();
  const newWords = words.filter(w => w.text !== text);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newWords));
  return newWords;
};

export const incrementReviewCount = (text: string): SavedWord[] => {
  const words = getSavedWords();
  const newWords = words.map(w => {
    if (w.text === text) {
      return { ...w, reviewCount: (w.reviewCount || 0) + 1 };
    }
    return w;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newWords));
  return newWords;
};

export const isWordSaved = (text: string): boolean => {
  const words = getSavedWords();
  return words.some(w => w.text.toLowerCase() === text.toLowerCase());
};

export const getProgressStats = () => {
  const words = getSavedWords();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const wordsToday = words.filter(w => w.addedAt >= today.getTime()).length;
  
  return {
    totalWords: words.length,
    target: A2_TARGET_COUNT,
    percentage: Math.min(Math.round((words.length / A2_TARGET_COUNT) * 100), 100),
    todayCount: wordsToday,
    dailyGoal: DAILY_GOAL,
    dailyProgress: Math.min(Math.round((wordsToday / DAILY_GOAL) * 100), 100)
  };
};
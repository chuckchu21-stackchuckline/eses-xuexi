import React, { useState, useEffect } from 'react';
import { Chunk } from '../types';
import { generateLessonAudio } from '../services/geminiService';
import { playRawAudio } from '../services/audioUtils';
import { saveWord, isWordSaved } from '../services/vocabService';
import { Button } from './Button';

interface WordSheetProps {
  chunk: Chunk | null;
  onClose: () => void;
}

export const WordSheet: React.FC<WordSheetProps> = ({ chunk, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (chunk) {
      setIsSaved(isWordSaved(chunk.text));
    }
  }, [chunk]);

  if (!chunk) return null;

  const handlePlayWord = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      const audioData = await generateLessonAudio(chunk.text);
      await playRawAudio(audioData, () => setIsPlaying(false));
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const handleSave = () => {
    if (isSaved) return;
    saveWord(chunk);
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl transform transition-transform animate-slide-up pointer-events-auto border-t border-slate-100">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
        
        <div className="flex items-start justify-between mb-2">
          <div>
             <h3 className="text-4xl font-bold text-slate-800 tracking-tight mb-1">
              {chunk.text}
             </h3>
             {chunk.lemma && chunk.lemma.toLowerCase() !== chunk.text.toLowerCase() && (
               <p className="text-slate-400 text-sm font-medium">原型: {chunk.lemma}</p>
             )}
          </div>
          
          <button
            onClick={handlePlayWord}
            disabled={isPlaying}
            className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center active:scale-95 transition-all hover:bg-emerald-200"
          >
            <span className="material-icons-round text-2xl">
              {isPlaying ? 'more_horiz' : 'volume_up'}
            </span>
          </button>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">中文释义</p>
          <p className="text-xl font-medium text-slate-700">
            {chunk.meaning || "暂无释义"}
          </p>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-3">
           <button 
            onClick={onClose}
            className="col-span-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
           >
            关闭
           </button>
           <Button 
             className="col-span-2"
             onClick={handleSave}
             disabled={isSaved}
             variant={isSaved ? 'secondary' : 'primary'}
             icon={isSaved ? 'check' : 'bookmark_add'}
           >
             {isSaved ? '已加入单词本' : '收藏单词'}
           </Button>
        </div>
      </div>
    </div>
  );
};
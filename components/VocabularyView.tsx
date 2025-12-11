import React, { useState, useEffect } from 'react';
import { SavedWord } from '../types';
import { getSavedWords, getProgressStats, removeWord } from '../services/vocabService';
import { generateLessonAudio } from '../services/geminiService';
import { playRawAudio } from '../services/audioUtils';
import { Button } from './Button';
import { ReviewSession } from './ReviewSession';
import { isSpeechSupported } from '../services/speechService';

export const VocabularyView: React.FC = () => {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [stats, setStats] = useState(getProgressStats());
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);

  useEffect(() => {
    setWords(getSavedWords());
    setStats(getProgressStats());
    setSpeechAvailable(isSpeechSupported());
  }, []);

  const handlePlay = async (word: SavedWord) => {
    if (playingWord) return;
    try {
      setPlayingWord(word.text);
      const audioData = await generateLessonAudio(word.text);
      await playRawAudio(audioData, () => setPlayingWord(null));
    } catch (e) {
      console.error(e);
      setPlayingWord(null);
    }
  };

  const handleDelete = (text: string) => {
    if (confirm('确定要移除这个单词吗？')) {
      const newWords = removeWord(text);
      setWords(newWords);
      setStats(getProgressStats());
    }
  };

  const startReview = () => {
    if (words.length === 0) return;
    setIsReviewing(true);
  };

  if (isReviewing) {
    return (
      <ReviewSession 
        words={words} 
        onClose={() => {
          setIsReviewing(false);
          // Refresh stats after review might change something (future proofing)
          setStats(getProgressStats());
        }} 
      />
    );
  }

  return (
    <div className="p-6 pb-24 animate-fade-in">
      
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">学习进度监督</h2>
        <p className="text-slate-500 text-sm">目标：A2 水平 (1000 词)</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Total Progress */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200">
          <div className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-2">A2 达成率</div>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-4xl font-bold">{stats.percentage}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-1000" 
              style={{ width: `${stats.percentage}%` }} 
            />
          </div>
          <div className="mt-2 text-xs text-emerald-100 text-right">
            {stats.totalWords} / {stats.target} 词
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">今日任务</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-800">{stats.todayCount}</span>
              <span className="text-sm text-slate-400 font-medium">/ {stats.dailyGoal} 词</span>
            </div>
          </div>
          
          <div className="mt-3">
             {stats.todayCount >= stats.dailyGoal ? (
               <div className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                 <span className="material-icons-round text-sm mr-1">check_circle</span>
                 已达标
               </div>
             ) : (
               <div className="text-xs text-orange-500 font-medium flex items-center">
                 <span className="material-icons-round text-sm mr-1">schedule</span>
                 加油，还差 {stats.dailyGoal - stats.todayCount} 个
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Review CTA */}
      <div className="mb-8">
        <Button 
          fullWidth 
          onClick={startReview}
          disabled={words.length === 0}
          icon="mic"
          className={words.length > 0 ? "animate-pulse-slow" : "opacity-50"}
        >
          {speechAvailable ? "开始口语复习 (AI 纠音)" : "浏览器不支持语音识别"}
        </Button>
        {words.length === 0 && (
          <p className="text-center text-xs text-slate-400 mt-2">
            先去场景学习收藏几个单词吧
          </p>
        )}
      </div>

      {/* Word List */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="material-icons-round text-emerald-500">menu_book</span>
          我的单词本 ({words.length})
        </h3>

        {words.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <span className="material-icons-round text-4xl text-slate-300 mb-2">inbox</span>
            <p className="text-slate-500">还没有收藏单词哦</p>
            <p className="text-xs text-slate-400 mt-1">去生成场景，点击单词开始积累吧</p>
          </div>
        ) : (
          <div className="space-y-3">
            {words.map((word) => (
              <div key={word.text} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-bold text-slate-800">{word.text}</span>
                    {word.lemma && word.lemma !== word.text.toLowerCase() && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">原: {word.lemma}</span>
                    )}
                  </div>
                  <div className="text-slate-600 text-sm">{word.meaning}</div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handlePlay(word)}
                    disabled={playingWord === word.text}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playingWord === word.text ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400 hover:bg-slate-50 hover:text-emerald-500'}`}
                  >
                    <span className="material-icons-round">
                      {playingWord === word.text ? 'more_horiz' : 'volume_up'}
                    </span>
                  </button>
                  <button 
                    onClick={() => handleDelete(word.text)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <span className="material-icons-round text-lg">delete_outline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
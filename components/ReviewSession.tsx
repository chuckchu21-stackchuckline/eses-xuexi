import React, { useState, useEffect } from 'react';
import { SavedWord } from '../types';
import { Button } from './Button';
import { generateLessonAudio } from '../services/geminiService';
import { playRawAudio } from '../services/audioUtils';
import { startListening, stopListening, checkPronunciation, isSpeechSupported } from '../services/speechService';

interface ReviewSessionProps {
  words: SavedWord[];
  onClose: () => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({ words, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [spokenText, setSpokenText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentWord = words[currentIndex];
  const progress = Math.round(((currentIndex + 1) / words.length) * 100);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    try {
      setIsPlayingAudio(true);
      const audioData = await generateLessonAudio(currentWord.text);
      await playRawAudio(audioData, () => setIsPlayingAudio(false));
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setFeedback('idle');
      setSpokenText('');
      setIsListening(true);
      
      startListening(
        (transcript) => {
          setSpokenText(transcript);
          const isCorrect = checkPronunciation(currentWord.text, transcript);
          setFeedback(isCorrect ? 'correct' : 'incorrect');
          setIsListening(false);
          
          if (isCorrect) {
            // Auto play audio reward? Or just visual
          }
        },
        () => setIsListening(false),
        (err) => {
          alert("无法访问麦克风或识别失败: " + err);
          setIsListening(false);
        }
      );
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setFeedback('idle');
      setSpokenText('');
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose(); // Finish
    }
  };

  if (!currentWord) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <span className="material-icons-round text-2xl">close</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">口语复习</span>
          <span className="text-sm font-bold text-slate-800">{currentIndex + 1} / {words.length}</span>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-200">
        <div 
          className="h-full bg-emerald-500 transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Flashcard */}
        <div className="bg-white w-full max-w-sm aspect-[4/5] rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8 relative z-10 transition-all">
          
          <button 
            onClick={handlePlayAudio}
            className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlayingAudio ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            <span className="material-icons-round text-2xl">
              {isPlayingAudio ? 'more_horiz' : 'volume_up'}
            </span>
          </button>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{currentWord.text}</h2>
            {currentWord.lemma && currentWord.lemma !== currentWord.text.toLowerCase() && (
               <p className="text-slate-400 text-sm mb-6 bg-slate-100 px-3 py-1 rounded-full">原型: {currentWord.lemma}</p>
            )}
            
            {/* Hidden/Revealed Meaning */}
            <div className={`transition-all duration-500 ${feedback === 'correct' ? 'opacity-100' : 'opacity-50 blur-sm hover:blur-none hover:opacity-100'}`}>
              <p className="text-xl text-slate-600 font-medium">{currentWord.meaning}</p>
            </div>
          </div>

          {/* Feedback Section inside card */}
          <div className="h-16 w-full flex items-center justify-center">
            {feedback === 'correct' && (
              <div className="flex items-center text-emerald-600 animate-bounce-short">
                <span className="material-icons-round text-3xl mr-2">check_circle</span>
                <span className="font-bold text-lg">太棒了！准确！</span>
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="flex flex-col items-center text-orange-500 animate-shake">
                <div className="flex items-center mb-1">
                  <span className="material-icons-round text-2xl mr-2">error_outline</span>
                  <span className="font-bold">再试一次</span>
                </div>
                <span className="text-xs text-slate-400">识别到: "{spokenText}"</span>
              </div>
            )}
            {feedback === 'idle' && isListening && (
               <div className="text-emerald-600 text-sm font-medium animate-pulse">正在听...</div>
            )}
          </div>

        </div>

        {/* Controls */}
        <div className="mt-10 w-full max-w-sm flex items-center justify-center gap-6">
          {feedback !== 'correct' ? (
             <button
              onClick={toggleMic}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                isListening 
                  ? 'bg-red-500 text-white ring-4 ring-red-200 animate-pulse' 
                  : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
              }`}
            >
              <span className="material-icons-round text-4xl">
                {isListening ? 'mic_off' : 'mic'}
              </span>
            </button>
          ) : (
             <Button 
               fullWidth 
               onClick={handleNext}
               icon="arrow_forward"
               className="animate-slide-up"
             >
               下一个单词
             </Button>
          )}
        </div>

        {/* Skip Link */}
        {feedback !== 'correct' && (
          <button 
            onClick={handleNext}
            className="mt-6 text-slate-400 text-sm font-medium hover:text-slate-600 underline decoration-slate-200 underline-offset-4"
          >
            太难了，跳过
          </button>
        )}

      </div>
    </div>
  );
};
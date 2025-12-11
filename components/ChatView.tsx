import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Chunk } from '../types';
import { startA2Chat, sendA2ChatMessage, generateLessonAudio } from '../services/geminiService';
import { playRawAudio, stopAudio } from '../services/audioUtils';
import { Button } from './Button';
import { WordSheet } from './WordSheet';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<Chunk | null>(null);
  const [revealedTranslations, setRevealedTranslations] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat
  useEffect(() => {
    const session = startA2Chat();
    setChatSession(session);
    
    // Initial greeting from AI (Simple text for start)
    const initialGreeting = "¡Hola! ¿De qué quieres hablar hoy?";
    // Manually chunkify the greeting for consistency if needed, or just handle plain text fallback
    setMessages([
      { 
        id: 'init', 
        role: 'model', 
        text: initialGreeting,
        translation: "你好！今天想聊点什么？",
        chunks: [
          { text: "¡", isWord: false },
          { text: "Hola", isWord: true, meaning: "你好", lemma: "hola" },
          { text: "! ", isWord: false },
          { text: "¿", isWord: false },
          { text: "De", isWord: true, meaning: "关于", lemma: "de" },
          { text: " ", isWord: false },
          { text: "qué", isWord: true, meaning: "什么", lemma: "qué" },
          { text: " ", isWord: false },
          { text: "quieres", isWord: true, meaning: "你想", lemma: "querer" },
          { text: " ", isWord: false },
          { text: "hablar", isWord: true, meaning: "谈论", lemma: "hablar" },
          { text: " ", isWord: false },
          { text: "hoy", isWord: true, meaning: "今天", lemma: "hoy" },
          { text: "?", isWord: false },
        ]
      }
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSession || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendA2ChatMessage(chatSession, userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.spanish,
        translation: response.chinese,
        chunks: response.chunks
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      alert("发送失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (msg: ChatMessage) => {
    if (playingMsgId === msg.id) {
      stopAudio();
      setPlayingMsgId(null);
      return;
    }

    stopAudio();
    setPlayingMsgId(msg.id);
    
    try {
      const audioData = await generateLessonAudio(msg.text);
      await playRawAudio(audioData, () => setPlayingMsgId(null));
    } catch (e) {
      console.error(e);
      setPlayingMsgId(null);
    }
  };

  const toggleTranslation = (id: string) => {
    const next = new Set(revealedTranslations);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setRevealedTranslations(next);
  };

  const handleChunkClick = (chunk: Chunk) => {
    if (chunk.isWord) {
      setSelectedChunk(chunk);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative">
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        {messages.map((msg) => {
          const isModel = msg.role === 'model';
          return (
            <div 
              key={msg.id} 
              className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative group transition-all ${
                  isModel 
                    ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none hover:shadow-md' 
                    : 'bg-emerald-600 text-white rounded-tr-none'
                }`}
              >
                {/* Text Content */}
                <div className="text-base leading-relaxed whitespace-pre-wrap flex flex-wrap items-baseline">
                  {isModel && msg.chunks ? (
                    msg.chunks.map((chunk, idx) => (
                      <span 
                        key={idx}
                        onClick={() => handleChunkClick(chunk)}
                        className={`
                          ${chunk.isWord ? 'cursor-pointer hover:bg-emerald-100 hover:text-emerald-800 rounded px-0.5 transition-colors border-b border-transparent hover:border-emerald-200' : ''}
                        `}
                      >
                        {chunk.text}
                      </span>
                    ))
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
                
                {/* AI-only Features (Translation & Audio) */}
                {isModel && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    
                    {/* Translation Toggle */}
                    <div className="flex-1">
                      <button 
                         onClick={() => toggleTranslation(msg.id)}
                         className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                         <span className="material-icons-round text-sm">translate</span>
                         {revealedTranslations.has(msg.id) ? '隐藏翻译' : '查看翻译'}
                      </button>
                      {revealedTranslations.has(msg.id) && msg.translation && (
                        <div className="mt-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg animate-fade-in">
                          {msg.translation}
                        </div>
                      )}
                    </div>

                    {/* Audio Playback */}
                    <button
                      onClick={() => handlePlayAudio(msg)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        playingMsgId === msg.id 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      <span className="material-icons-round text-lg">
                        {playingMsgId === msg.id ? 'stop' : 'volume_up'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 z-10">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="用西班牙语说点什么..."
            className="flex-1 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-3 max-h-32 resize-none outline-none text-slate-800 transition-all"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex-shrink-0 mb-0.5"
          >
            <span className="material-icons-round">send</span>
          </button>
        </div>
      </div>

      {/* Word Detail Sheet */}
      <WordSheet 
        chunk={selectedChunk} 
        onClose={() => setSelectedChunk(null)} 
      />
    </div>
  );
};
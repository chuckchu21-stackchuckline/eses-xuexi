import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { LoadingScreen } from './components/LoadingScreen';
import { WordSheet } from './components/WordSheet';
import { VocabularyView } from './components/VocabularyView';
import { ChatView } from './components/ChatView';
import { InstallGuide } from './components/InstallGuide';
import { generateLessonContent, generateLessonAudio } from './services/geminiService';
import { playRawAudio, stopAudio } from './services/audioUtils';
import { AppView, LessonData, Chunk } from './types';

const SUGGESTIONS = [
  "去药店买感冒药",
  "在咖啡馆点一杯拿铁",
  "去超市询问牛奶在哪里",
  "去邮局寄包裹回国",
  "办理银行卡丢失",
  "房东沟通退房事宜"
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [scenarioInput, setScenarioInput] = useState('');
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  // Audio States
  const [isPlayingGlobal, setIsPlayingGlobal] = useState(false);
  const [playingSentenceIdx, setPlayingSentenceIdx] = useState<number | null>(null);
  const [loadingSentenceIdx, setLoadingSentenceIdx] = useState<number | null>(null);

  const [selectedChunk, setSelectedChunk] = useState<Chunk | null>(null);
  const [visibleTranslations, setVisibleTranslations] = useState<Set<number>>(new Set());
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Compute full text for essay view
  const fullText = useMemo(() => {
    return lesson ? lesson.sentences.map(s => s.spanish).join(' ') : '';
  }, [lesson]);

  const handleGenerate = async () => {
    if (!scenarioInput.trim()) return;
    
    stopAudio();
    setIsPlayingGlobal(false);
    setPlayingSentenceIdx(null);
    setView(AppView.LOADING);
    setSelectedChunk(null);
    setVisibleTranslations(new Set());
    setShowFullText(false);
    
    try {
      // 1. Generate Structured Content
      const content = await generateLessonContent(scenarioInput);
      setLesson(content);
      
      // 2. Generate Full Audio (Combine all sentences)
      const textToSpeak = content.sentences.map(s => s.spanish).join(' ');
      const audio = await generateLessonAudio(textToSpeak);
      setAudioBase64(audio);
      
      setView(AppView.LESSON);
    } catch (error: any) {
      console.error("Generation failed", error);
      
      // Reset view to HOME immediately so the alert doesn't block the previous Loading state
      setView(AppView.HOME);

      const errString = error.message || error.toString();

      // Case 1: Key Missing
      if (errString.includes("VITE_API_KEY_MISSING")) {
        alert("⚠️ 无法生成内容：\n\n缺少 API Key。请点击右上角的“下载图标”查看如何配置 VITE_API_KEY。");
        setShowInstallGuide(true);
        return;
      }

      // Case 2: Key Format Error (User pasted prefix)
      if (errString.includes("INVALID_KEY_FORMAT_PREFIX")) {
        alert("⚠️ API Key 格式错误\n\n您似乎把 'VITE_API_KEY=' 这段文字也粘贴进去了。\n请回到 Vercel，只粘贴 AIza 开头的那串字符。");
        return;
      }

      // Case 3: Network Error (GFW)
      // "Failed to fetch" is the standard browser error for network blocks/cors
      if (errString.includes("Failed to fetch") || errString.includes("NetworkError")) {
        alert("🌐 网络连接失败\n\n您的设备无法连接到 Google 服务器。\n\n💡 提示：如果您在中国大陆，请开启手机 VPN (科学上网) 后再试。");
        return;
      }

      // Case 4: Invalid Key (400/403)
      if (errString.includes("400") || errString.includes("403") || errString.includes("API key not valid")) {
         alert("🔑 API Key 无效\n\nGoogle 提示您的 Key 不正确或已过期。\n请检查 Key 是否复制完整，或者重新生成一个。");
         return;
      }
      
      // Case 5: Generic Error
      alert(`生成失败: ${errString}\n\n请检查网络或稍后再试。`);
    }
  };

  const toggleGlobalAudio = async () => {
    if (isPlayingGlobal) {
      stopAudio();
      setIsPlayingGlobal(false);
    } else {
      // Stop any sentence audio
      setPlayingSentenceIdx(null);
      setLoadingSentenceIdx(null);
      stopAudio();

      if (!audioBase64) return;
      setIsPlayingGlobal(true);
      await playRawAudio(audioBase64, () => setIsPlayingGlobal(false));
    }
  };

  const playSentenceAudio = async (text: string, idx: number) => {
    // If clicking the one currently playing, stop it
    if (playingSentenceIdx === idx) {
      stopAudio();
      setPlayingSentenceIdx(null);
      return;
    }

    // Stop global audio or other sentence audio
    stopAudio();
    setIsPlayingGlobal(false);
    setPlayingSentenceIdx(null);

    setLoadingSentenceIdx(idx);
    try {
      const audio = await generateLessonAudio(text);
      setLoadingSentenceIdx(null);
      setPlayingSentenceIdx(idx);
      await playRawAudio(audio, () => setPlayingSentenceIdx(null));
    } catch (e: any) {
      console.error(e);
      setLoadingSentenceIdx(null);
      setPlayingSentenceIdx(null);
      
      const errString = e.message || "";
      if (errString.includes("VITE_API_KEY_MISSING")) {
         alert("请先配置 API Key");
         setShowInstallGuide(true);
      } else if (errString.includes("Failed to fetch")) {
         alert("网络连接失败，无法播放语音");
      }
    }
  };

  const toggleTranslation = (index: number) => {
    const next = new Set(visibleTranslations);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setVisibleTranslations(next);
  };

  const resetApp = () => {
    stopAudio();
    setIsPlayingGlobal(false);
    setPlayingSentenceIdx(null);
    setView(AppView.HOME);
    // Note: We deliberately reset input and lesson state when going home to start fresh
    // But if you want to keep state, remove these lines.
    setScenarioInput('');
    setLesson(null);
    setAudioBase64(null);
    setSelectedChunk(null);
  };

  const handleProfileClick = () => {
    stopAudio();
    setIsPlayingGlobal(false);
    setView(AppView.VOCABULARY);
  };

  const handleChatClick = () => {
    stopAudio();
    setIsPlayingGlobal(false);
    setView(AppView.CHAT);
  };

  const handleChunkClick = (chunk: Chunk) => {
    if (chunk.isWord) {
      setSelectedChunk(chunk);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <Header 
        onHome={resetApp} 
        onProfile={handleProfileClick}
        onChat={handleChatClick}
        onInstall={() => setShowInstallGuide(true)}
        activeView={view === AppView.VOCABULARY ? 'VOCABULARY' : view === AppView.CHAT ? 'CHAT' : undefined}
      />
      
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        
        {/* HOME VIEW */}
        {view === AppView.HOME && (
          <div className="p-6 flex flex-col h-full animate-fade-in">
            <div className="mt-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Hola! 👋</h2>
              <p className="text-slate-500 text-lg">你现在想去哪里？<br/>告诉我，我来教你怎么说。</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">输入场景</label>
              <textarea
                value={scenarioInput}
                onChange={(e) => setScenarioInput(e.target.value)}
                placeholder="例如：去理发店剪头发..."
                className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all outline-none resize-none text-slate-800 font-medium"
                rows={3}
              />
              <div className="mt-4">
                <Button 
                  fullWidth 
                  onClick={handleGenerate}
                  disabled={!scenarioInput.trim()}
                  icon="auto_awesome"
                >
                  开始学习
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">推荐场景</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setScenarioInput(s)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-sm font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setShowInstallGuide(true)}
                className="text-emerald-600 text-sm font-medium flex items-center justify-center gap-1 mx-auto hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span className="material-icons-round text-base">install_mobile</span>
                安装帮助
              </button>
            </div>
          </div>
        )}

        {/* LOADING VIEW */}
        {view === AppView.LOADING && <LoadingScreen />}

        {/* VOCABULARY VIEW */}
        {view === AppView.VOCABULARY && <VocabularyView />}

        {/* CHAT VIEW */}
        {view === AppView.CHAT && <ChatView />}

        {/* LESSON VIEW */}
        {view === AppView.LESSON && lesson && (
          <div className="pb-24 animate-slide-up">
            {/* Sticky Audio Player */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-4 shadow-sm flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">当前场景</h3>
                <p className="font-bold text-slate-800 truncate text-sm">{lesson.scenario}</p>
              </div>
              <button 
                onClick={toggleGlobalAudio}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlayingGlobal ? 'bg-red-50 text-red-500' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'}`}
              >
                <span className="material-icons-round text-2xl">
                  {isPlayingGlobal ? 'stop' : 'play_arrow'}
                </span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Full Text Essay Preview */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                 <button 
                  onClick={() => setShowFullText(!showFullText)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                 >
                   <div className="flex items-center gap-2 text-slate-700 font-bold">
                     <span className="material-icons-round text-emerald-500">article</span>
                     原文短文预览
                   </div>
                   <span className={`material-icons-round text-slate-400 transition-transform duration-300 ${showFullText ? 'rotate-180' : ''}`}>
                     expand_more
                   </span>
                 </button>
                 {showFullText && (
                   <div className="p-5 border-t border-slate-100 prose prose-slate">
                     <p className="text-lg leading-relaxed text-slate-800 font-medium">
                       {fullText}
                     </p>
                   </div>
                 )}
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl text-slate-500 text-sm border border-blue-100 flex gap-2">
                <span className="material-icons-round text-blue-400 text-base">touch_app</span>
                <span>点击单词查意，点击喇叭听单句。</span>
              </div>

              {/* Sentences List */}
              <div className="space-y-4">
                {lesson.sentences.map((sentence, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md relative">
                    
                    {/* Sentence Header with Play Button */}
                    <div className="flex items-start gap-3 mb-3">
                       <button
                         onClick={() => playSentenceAudio(sentence.spanish, idx)}
                         disabled={loadingSentenceIdx === idx}
                         className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                           playingSentenceIdx === idx 
                             ? 'bg-emerald-100 text-emerald-600' 
                             : loadingSentenceIdx === idx
                               ? 'bg-slate-100 text-slate-400 cursor-wait'
                               : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
                         }`}
                       >
                         {loadingSentenceIdx === idx ? (
                           <span className="material-icons-round text-lg animate-spin">refresh</span>
                         ) : (
                           <span className="material-icons-round text-xl">
                             {playingSentenceIdx === idx ? 'stop' : 'volume_up'}
                           </span>
                         )}
                       </button>

                       {/* Interactive Chunks */}
                       <div className="flex-1 pt-1">
                          <div className="text-xl leading-relaxed font-medium text-slate-800 flex flex-wrap items-baseline">
                            {sentence.chunks.map((chunk, cIdx) => (
                              <span 
                                key={cIdx}
                                onClick={() => handleChunkClick(chunk)}
                                className={`
                                  ${chunk.isWord ? 'cursor-pointer hover:bg-emerald-100 hover:text-emerald-800 rounded px-0.5 transition-colors border-b-2 border-transparent hover:border-emerald-200' : ''}
                                  ${selectedChunk === chunk ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : ''}
                                `}
                              >
                                {chunk.text}
                              </span>
                            ))}
                          </div>
                       </div>
                    </div>

                    {/* Translation Toggle */}
                    <div className="pl-[52px]">
                      <button 
                        onClick={() => toggleTranslation(idx)}
                        className="w-full text-left group"
                      >
                         {!visibleTranslations.has(idx) ? (
                           <div className="flex items-center gap-2 text-slate-300 text-sm font-medium group-hover:text-emerald-600 transition-colors">
                              <span className="material-icons-round text-base">translate</span>
                              查看中文
                           </div>
                         ) : (
                           <div className="animate-fade-in text-slate-500 leading-relaxed text-base border-l-2 border-slate-200 pl-3 py-1">
                             {sentence.chinese}
                           </div>
                         )}
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Tips */}
              <section className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 mt-8">
                 <h3 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                  <span className="material-icons-round">lightbulb</span>
                  生活小贴士
                </h3>
                <p className="text-indigo-800 leading-relaxed text-sm">
                  {lesson.tips}
                </p>
              </section>

              <div className="pt-4">
                 <Button variant="secondary" fullWidth onClick={resetApp}>
                   学习下一个场景
                 </Button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Word Detail Sheet */}
      <WordSheet 
        chunk={selectedChunk} 
        onClose={() => setSelectedChunk(null)} 
      />

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <InstallGuide onClose={() => setShowInstallGuide(false)} />
      )}
      
    </div>
  );
};

export default App;
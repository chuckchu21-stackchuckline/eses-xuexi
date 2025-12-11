import React from 'react';

interface HeaderProps {
  onHome?: () => void;
  onProfile?: () => void;
  onChat?: () => void;
  onInstall?: () => void;
  onSettings?: () => void;
  activeView?: string;
}

export const Header: React.FC<HeaderProps> = ({ onHome, onProfile, onChat, onInstall, onSettings, activeView }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
      {/* Home Button (Left) */}
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={onHome}
      >
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
          <span className="text-white font-bold text-lg">E</span>
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden xs:block">Entorno</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Chat Button */}
        <button 
          onClick={onChat}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
            activeView === 'CHAT'
              ? 'bg-emerald-100 text-emerald-700 font-bold'
              : 'bg-transparent text-slate-400 hover:bg-slate-50 hover:text-emerald-600'
          }`}
        >
          <span className="material-icons-round text-xl">chat_bubble</span>
          {activeView === 'CHAT' && <span className="text-xs hidden sm:inline">对话</span>}
        </button>
        
        {/* Profile Button */}
        <button 
          onClick={onProfile}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            activeView === 'VOCABULARY' 
              ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500 ring-offset-2' 
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          <span className="material-icons-round text-xl">
            {activeView === 'VOCABULARY' ? 'insights' : 'person'}
          </span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onSettings}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            activeView === 'SETTINGS'
              ? 'bg-slate-200 text-slate-700'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <span className="material-icons-round text-xl">settings</span>
        </button>
      </div>
    </header>
  );
};
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center animate-fade-in">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-icons-round text-emerald-600 text-3xl animate-pulse">psychology</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">正在生成课程...</h2>
      <p className="text-slate-500">AI 正在根据你的场景编写对话并录制语音。</p>
    </div>
  );
};
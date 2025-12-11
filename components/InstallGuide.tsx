import React, { useState, useEffect } from 'react';

interface InstallGuideProps {
  onClose: () => void;
}

export const InstallGuide: React.FC<InstallGuideProps> = ({ onClose }) => {
  const [step, setStep] = useState<'pc' | 'deploy'>('deploy'); // Default to deploy tab since user is stuck there
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">代码去哪了？</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setStep('deploy')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${step === 'deploy' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            解决空仓库问题
          </button>
          <button 
            onClick={() => setStep('pc')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${step === 'pc' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            电脑使用
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 'pc' ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                   当前预览链接
                 </label>
                 <div className="flex gap-2">
                   <input 
                    type="text" 
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-600 font-mono select-all focus:border-emerald-500 outline-none"
                   />
                   <button 
                    onClick={handleCopy}
                    className={`px-3 py-2 rounded-lg text-white text-xs font-bold transition-all ${copied ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                   >
                     {copied ? '已复制' : '复制'}
                   </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-sm border border-amber-200 flex items-start gap-3">
                <span className="material-icons-round text-2xl text-amber-600">contact_support</span>
                <div>
                  <strong>"为什么我的 GitHub 是空的？"</strong>
                  <p className="mt-1 text-amber-800 opacity-90 leading-relaxed text-xs">
                    别担心！代码其实就在<strong>这个网页里</strong>。你之前创建了仓库，但是还没把代码“推”过去。
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="relative pl-6 border-l-2 border-emerald-500 pb-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">第一步：找到“推送”按钮</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  请现在抬头看这个网页的<strong>右上角</strong>。
                </p>
                <div className="mt-2 bg-slate-800 text-white p-3 rounded-lg text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-round text-sm">cloud_upload</span>
                    <span>如果不显示 "Connect to GitHub"...</span>
                  </div>
                  <div className="pl-6 text-slate-400">
                    哪怕它显示了 GitHub 图标，也请点一下！找找有没有 <strong>"Push Changes"</strong> 或 <strong>"Sync"</strong> 这样的按钮。点击它！
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-6 border-l-2 border-slate-200 pb-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">第二步：验证</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                  当你这边显示 "Synced" 或 "Up to date" 后，回到你的 GitHub 页面<strong>刷新</strong>。
                </p>
                <p className="text-xs text-emerald-600 font-bold">
                  看到 src, package.json 这些文件了吗？看到了就说明代码过去了！
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative pl-6 border-l-2 border-slate-200 pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">第三步：Vercel 部署</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  只要 GitHub 里有文件了，去 Vercel 重新 Import 一次，填入 API Key，就能成功了。
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
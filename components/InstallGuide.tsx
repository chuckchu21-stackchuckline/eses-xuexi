import React, { useState } from 'react';

interface InstallGuideProps {
  onClose: () => void;
}

export const InstallGuide: React.FC<InstallGuideProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'apikey' | 'install'>('apikey');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">设置指南</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setTab('apikey')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'apikey' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            1. 配置 API Key (必读)
          </button>
          <button 
            onClick={() => setTab('install')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'install' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            2. 安装到手机
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {tab === 'apikey' ? (
            <div className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900 leading-relaxed">
                <strong className="block mb-1">为什么通过 Vercel 部署后是白屏？</strong>
                这是因为缺少 API Key。请按照以下步骤填写，填写后 APP 即可正常运行。
              </div>

              <div className="relative pl-6 border-l-2 border-emerald-500 pb-2">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                 <h4 className="font-bold text-slate-800 text-sm mb-1">第一步：获取 Key</h4>
                 <p className="text-xs text-slate-500 mb-2">访问 Google AI Studio 免费获取。</p>
                 <a 
                   href="https://aistudio.google.com/app/apikey" 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                 >
                   <span>点击去获取 Key</span>
                   <span className="material-icons-round text-xs">open_in_new</span>
                 </a>
              </div>

              <div className="relative pl-6 border-l-2 border-slate-200 pb-0">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                 <h4 className="font-bold text-slate-800 text-sm mb-1">第二步：在 Vercel 填写</h4>
                 <p className="text-xs text-slate-500 mb-2">
                   回到 Vercel 的 <strong>Environment Variables</strong> 页面，添加以下信息：
                 </p>
                 
                 <div className="bg-slate-800 rounded-lg p-3 space-y-3">
                   <div>
                     <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Key (变量名)</div>
                     <div className="flex items-center gap-2">
                        <code className="text-emerald-400 font-mono text-sm select-all">VITE_API_KEY</code>
                        <span className="text-[10px] text-slate-500">(注意：必须要有 VITE_ 前缀)</span>
                     </div>
                   </div>
                   
                   <div>
                     <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Value (值)</div>
                     <code className="text-white font-mono text-xs break-all">
                       粘贴你刚才复制的 Google API Key
                     </code>
                   </div>
                 </div>

                 <p className="text-xs text-slate-400 mt-3 italic">
                   添加完成后，Vercel 会自动重新部署（可能需要等1分钟），然后刷新手机 APP 即可。
                 </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 text-center">
                 <p className="text-slate-500 text-sm">
                   配置好 Key 之后，你可以把它变成手机桌面 APP。
                 </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  <span className="material-icons-round text-blue-500">apple</span>
                  iOS (iPhone)
                </h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                  <li>使用 <strong>Safari</strong> 浏览器打开链接</li>
                  <li>点击底部的 <strong>分享按钮</strong></li>
                  <li>选择 <strong>添加到主屏幕</strong></li>
                </ol>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  <span className="material-icons-round text-green-500">android</span>
                  Android (安卓)
                </h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                  <li>使用 <strong>Chrome</strong> 浏览器打开链接</li>
                  <li>点击右上角的 <strong>菜单 (三个点)</strong></li>
                  <li>选择 <strong>安装应用</strong> 或 <strong>添加到主屏幕</strong></li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
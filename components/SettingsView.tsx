import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { saveCustomApiKey, getCustomApiKey, generateLessonContent } from '../services/geminiService';

export const SettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'none' | 'success' | 'error'>('none');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setApiKey(getCustomApiKey());
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      saveCustomApiKey('');
      setTestResult('none');
      alert("API Key 已清除");
      return;
    }

    setIsTesting(true);
    setTestResult('none');
    setErrorMsg('');
    
    // Temporarily save to test
    saveCustomApiKey(apiKey.trim());

    try {
      // Try a simple generation to verify
      await generateLessonContent("Test connection");
      setTestResult('success');
    } catch (e: any) {
      setTestResult('error');
      setErrorMsg(e.message || e.toString());
      // Don't clear key, let user correct it
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in pb-24">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">设置</h2>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <span className="material-icons-round text-emerald-500">vpn_key</span>
          API Key 设置
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          如果 Vercel 部署后无法生成内容，请在此处直接粘贴您的 API Key。这会覆盖系统默认设置。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult('none');
              }}
              placeholder="AIzaSy..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <Button 
            fullWidth 
            onClick={handleSave} 
            disabled={isTesting}
            variant={testResult === 'success' ? 'secondary' : 'primary'}
          >
            {isTesting ? '正在测试...' : testResult === 'success' ? '验证成功 (已保存)' : '保存并测试连接'}
          </Button>

          {testResult === 'error' && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 break-words">
              <strong>连接失败:</strong> {errorMsg}
            </div>
          )}
          
          {testResult === 'success' && (
             <div className="bg-emerald-50 text-emerald-600 text-xs p-3 rounded-xl border border-emerald-100 flex items-center">
               <span className="material-icons-round text-sm mr-1">check_circle</span>
               Key 有效！现在可以去首页生成内容了。
             </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-center">
        <p className="text-xs text-slate-400 mb-2">Entorno v1.0.1</p>
        <p className="text-xs text-slate-400">Made with 💚 for Spanish Learners</p>
      </div>
    </div>
  );
};
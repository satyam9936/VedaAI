import React, { useState } from 'react';
import { X, Key, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiKeyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string | null;
  onSaveApiKey: (key: string | null) => void;
  backendConnected?: boolean;
}

export const ApiKeyDrawer: React.FC<ApiKeyDrawerProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  onSaveApiKey,
  backendConnected = false,
}) => {
  const [inputKey, setInputKey] = useState(currentApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim() || null);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Gemini Vision AI Settings</h2>
                <p className="text-xs text-slate-400">Configure your Google Gemini API Key</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Backend Connected Banner */}
            {backendConnected && (
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  <span>🟢 AI Connected via Server</span>
                </div>
                <p className="text-emerald-300/80 text-[11px] leading-relaxed">
                  The backend server has a Gemini API key configured. You don't need to add one manually — the app works automatically!
                </p>
              </div>
            )}
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-veda-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Zero Database / In-Memory &amp; LocalStorage</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Your key is stored securely in your browser's local storage and used directly to make vision requests to Google's Gemini REST API. No server or external database is required.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  {backendConnected ? 'Custom API Key (Optional Override)' : 'Google Gemini API Key'}
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-veda-500 focus:ring-1 focus:ring-veda-500 transition"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-veda-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Get Free Gemini API Key</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                {currentApiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-slate-400 hover:text-rose-400 transition"
                  >
                    Clear Saved Key
                  </button>
                )}
              </div>

              {savedSuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>API Key Saved successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-veda-600 hover:bg-veda-500 text-white font-semibold text-xs shadow-lg shadow-veda-600/30 transition flex items-center justify-center gap-2"
              >
                <Key className="h-4 w-4" />
                <span>Save API Key</span>
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          VedaAI Assessment Extraction System v1.0.0
        </div>

      </div>
    </div>
  );
};

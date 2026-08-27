import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Key, 
  BookOpen, 
  Award, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { AssessmentData } from '@vedaai/types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  assessment: AssessmentData;
  onOpenUpload: () => void;
  onOpenApiKey: () => void;
  hasApiKey: boolean;
  onLoadPreset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  assessment,
  onOpenUpload,
  onOpenApiKey,
  hasApiKey,
  onLoadPreset,
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-veda-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-veda-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-veda-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">VedaAI</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-veda-500/10 text-veda-400 border border-veda-500/20 font-medium">
                Assessment Extraction &amp; Mapping
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated Question-Answer Extraction, Bounding Box Mapping &amp; AI Insights</p>
          </div>
        </div>

        {/* Middle Quick Stats */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-850/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">{assessment.subject}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Award className="h-3.5 w-3.5" />
            <span className="font-semibold">{assessment.totalObtainedMarks} / {assessment.totalMaxMarks} ({assessment.percentage}%)</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{assessment.overallSummary.outOfOrderCount} Out of Order</span>
          </div>
        </div>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          <button
            onClick={onLoadPreset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
            title="Reset to demo sample assessment"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span>Demo Preset</span>
          </button>

          <button
            onClick={onOpenApiKey}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              hasApiKey 
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Key className={`h-3.5 w-3.5 ${hasApiKey ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{hasApiKey ? 'Gemini API Active' : 'Configure AI Key'}</span>
            {hasApiKey && <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-0.5" />}
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-veda-600 to-indigo-600 hover:from-veda-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-veda-600/25 border border-veda-400/30 transition transform active:scale-95"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Exam</span>
          </button>

          {/* User Profile Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(prev => !prev)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs transition"
              >
                <div className="h-6 w-6 rounded-full bg-veda-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0)}
                </div>
                <span className="font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs animate-fade-in">
                  <div className="p-2 border-b border-slate-800 space-y-0.5">
                    <p className="font-bold text-slate-100">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="text-[10px] text-veda-400 block font-medium pt-0.5">{user.institution}</span>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full mt-1 p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out Teacher Account</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

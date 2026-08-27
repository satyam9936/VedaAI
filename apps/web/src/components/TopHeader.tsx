import React, { useState } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  Bell, 
  Sparkles, 
  ChevronDown,
  FileText,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  onBack?: () => void;
  title?: string;
  onOpenApiKey?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onBack,
  title = 'Exams',
  onOpenApiKey
}) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const isGoogle = user?.authProvider === 'google';
  const isGitHub = user?.authProvider === 'github';

  return (
    <header className="h-16 px-6 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4 select-none relative">
      
      {/* Left Breadcrumb & Back Arrow */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition"
          title="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="text-slate-700">{title}</span>
        </div>
      </div>

      {/* Right User & Action Controls */}
      <div className="flex items-center gap-3">
        
        {/* Help icon */}
        <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition" title="Help &amp; Documentation">
          <HelpCircle className="h-4.5 w-4.5" />
        </button>

        {/* Notification Bell with red dot */}
        <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition relative" title="Notifications">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>

        {/* AI Key Configure Button */}
        <button
          onClick={onOpenApiKey}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition flex items-center justify-center"
          title="AI Settings &amp; API Key"
        >
          <Sparkles className="h-4.5 w-4.5 text-orange-500" />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 transition"
          >
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden relative">
              {user?.name ? user.name.charAt(0) : 'S'}
              {isGoogle && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-blue-500 rounded-full border border-white" />
              )}
              {isGitHub && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-slate-800 rounded-full border border-white" />
              )}
            </div>
            
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="font-bold text-xs text-slate-800 leading-tight">
                {user?.name || 'Satyam Rastogi'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">
                {isGoogle ? 'Google Account' : isGitHub ? 'GitHub Account' : 'Teacher Portal'}
              </span>
            </div>

            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-12 w-64 bg-slate-900 border border-slate-800 text-white rounded-2xl p-3 shadow-2xl z-50 animate-fade-in space-y-2">
              <div className="p-2 bg-slate-950 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white truncate max-w-[140px]">{user?.name}</span>
                  {isGoogle && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Google
                    </span>
                  )}
                  {isGitHub && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      GitHub
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block truncate">{user?.email}</span>
                <span className="text-[10px] text-slate-500 block truncate">{user?.institution}</span>
              </div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out Account</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

import React from 'react';
import { 
  ArrowLeft, 
  Clipboard, 
  HelpCircle, 
  Bell, 
  Sparkles, 
  ChevronDown,
  Menu,
  Key
} from 'lucide-react';

interface TopBarProps {
  onBack?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenApiKey?: () => void;
  hasApiKey?: boolean;
  backendConnected?: boolean;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onBack, 
  onOpenMobileMenu,
  onOpenApiKey,
  hasApiKey = false,
  backendConnected = false,
  title = 'Exams' 
}) => {
  return (
    <header className="w-full h-[55px] px-4 sm:px-6 bg-white rounded-[17px] flex items-center justify-between shrink-0 select-none shadow-sm border border-[#E3E3E3]/50">
      {/* Left Navigation Breadcrumb & Mobile Menu Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-[#292929] hover:bg-[#F5F5F5] transition"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        <button 
          onClick={onBack}
          className="p-1 rounded-lg text-[#7F7F7F] hover:text-[#292929] hover:bg-black/5 transition"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <div className="flex items-center gap-2">
          <Clipboard className="w-4.5 h-4.5 text-[#7F7F7F] stroke-[2]" />
          <span className="text-[15px] sm:text-[16px] font-medium text-[#7F7F7F] font-sans">
            {title}
          </span>
        </div>
      </div>

      {/* Right User Actions & Profile (Exact Order) */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
        {/* API Key Drawer Button */}
        {onOpenApiKey && (
          <button
            onClick={onOpenApiKey}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition ${
              hasApiKey
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-4 h-4" />
            <span className="hidden md:inline">
              {backendConnected ? '🟢 AI Connected' : hasApiKey ? 'API Key Active' : 'Add Gemini Key'}
            </span>
          </button>
        )}

        {/* 1. Help/question icon */}
        <button 
          className="p-1 text-[#7F7F7F] hover:text-[#292929] transition hidden xs:block"
          title="Help & Support"
        >
          <HelpCircle className="w-5 h-5 stroke-[2]" />
        </button>

        {/* 2 & 3. Notification bell + small orange dot */}
        <button 
          className="relative p-1 text-[#7F7F7F] hover:text-[#292929] transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F15A35]" />
        </button>

        {/* 4. AI / Sparkle icon */}
        <button 
          className="p-1 text-[#7F7F7F] hover:text-[#292929] transition"
          title="AI Assistant"
        >
          <Sparkles className="w-5 h-5 stroke-[2]" />
        </button>

        {/* 5, 6 & 7. User avatar, Satyam Rastogi, dropdown chevron */}
        <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer hover:opacity-80 transition ml-0.5 sm:ml-1">
          <div className="w-8 h-8 rounded-full bg-[#292929] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden shrink-0">
            SR
          </div>
          <span className="text-[14px] sm:text-[16px] font-medium text-[#292929] font-sans hidden sm:block truncate max-w-[120px] md:max-w-none">
            Satyam Rastogi
          </span>
          <ChevronDown className="w-4 h-4 text-[#7F7F7F] stroke-[2]" />
        </div>
      </div>
    </header>
  );
};

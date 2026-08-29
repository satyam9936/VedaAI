import React from 'react';
import { 
  Grid2X2, 
  Users, 
  FileText, 
  Clipboard,
  Clock3, 
  Settings, 
  PanelLeft,
  ChevronsRight,
  Sparkles,
  X
} from 'lucide-react';
import { SchoolCard } from './SchoolCard';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  activeNav?: string;
  onSelectNav?: (nav: string) => void;
  onOpenTeacherToolkit?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  activeNav = 'exams',
  onSelectNav,
  onOpenTeacherToolkit,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Grid2X2 },
    { id: 'classroom', label: 'My Classroom', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exams', icon: Clipboard },
    { id: 'library', label: 'My Library', icon: Clock3 },
  ];

  const handleNavClick = (id: string) => {
    onSelectNav?.(id);
    onCloseMobile?.();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="flex flex-col w-full">
        {/* Logo Branding & Collapse/Close */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-3">
            <div className="w-[44px] h-[44px] rounded-2xl bg-[#292929] flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
              V
            </div>
            <span className="font-bold text-[25px] tracking-tight text-[#292929] font-sans">
              VedaAI
            </span>
          </div>

          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:block p-1 text-[#777777] hover:text-[#292929] transition"
              title="Collapse sidebar"
            >
              <PanelLeft className="w-[18px] h-[18px] stroke-[2]" />
            </button>
          )}

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#777777] hover:text-[#292929] hover:bg-[#F5F5F5] transition"
              title="Close drawer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          )}
        </div>

        {/* AI Teacher's Toolkit Button */}
        <div className="w-full flex justify-center mb-6">
          <button 
            onClick={() => {
              onOpenTeacherToolkit?.();
              onCloseMobile?.();
            }}
            className="w-full h-[50px] rounded-[26px] bg-[#333333] border-[3px] border-[#F15A35] text-white font-medium text-[16px] flex items-center justify-center gap-2 shadow-sm hover:bg-[#404040] transition active:scale-[0.98] cursor-pointer"
          >
            <span>✦ AI Teacher's Toolkit</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-[16px] h-[44px] rounded-[9px] text-[16px] transition font-sans ${
                  isActive
                    ? 'bg-[#EEEEEE] text-[#292929] font-medium'
                    : 'text-[#777777] font-normal hover:text-[#292929] hover:bg-[#F7F7F7]'
                }`}
              >
                <Icon className={`w-[20px] h-[20px] stroke-[2] ${isActive ? 'text-[#292929]' : 'text-[#777777]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom */}
      <div className="flex flex-col items-center gap-3 w-full pt-4 border-t border-[#E3E3E3]/40 mt-auto">
        <button className="w-full flex items-center gap-3.5 px-[16px] py-1.5 text-[16px] font-normal text-[#777777] hover:text-[#292929] rounded-[9px] transition">
          <Settings className="w-[20px] h-[20px] stroke-[2] text-[#777777]" />
          <span>Settings</span>
        </button>

        <SchoolCard isCollapsed={false} />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[300px] sm:w-[327px] bg-white z-50 p-5 shadow-2xl flex flex-col justify-between lg:hidden transition-transform duration-300 ease-out pb-safe pt-safe ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Collapsed View */}
      {isCollapsed ? (
        <aside className="hidden lg:flex w-[58px] bg-white rounded-[18px] h-full flex-col justify-between items-center py-5 z-20 shrink-0 select-none shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E3E3E3]/60 transition-all duration-300">
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="w-10 h-10 rounded-2xl bg-[#292929] flex items-center justify-center text-white font-bold text-xl shadow-sm">
              V
            </div>

            <button 
              onClick={onOpenTeacherToolkit}
              className="w-10 h-10 rounded-full bg-[#333333] border-[2.5px] border-[#F15A35] flex items-center justify-center text-[#F15A35] shadow-sm hover:scale-105 transition cursor-pointer"
              title="AI Teacher's Toolkit"
            >
              <Sparkles className="w-5 h-5 text-[#F15A35]" />
            </button>

            <nav className="flex flex-col items-center gap-3 mt-2 w-full px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-10 h-10 rounded-[9px] flex items-center justify-center transition ${
                      isActive 
                        ? 'bg-[#EEEEEE] text-[#292929]' 
                        : 'text-[#777777] hover:text-[#292929] hover:bg-[#F5F5F5]'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col items-center gap-4 w-full px-2">
            <SchoolCard isCollapsed={true} />
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#777777] hover:text-[#292929] hover:bg-[#F5F5F5] transition"
              title="Expand Sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      ) : (
        /* Desktop Expanded View */
        <aside className="hidden lg:flex w-[327px] h-full bg-white rounded-[18px] flex-col justify-between p-6 z-20 shrink-0 select-none shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E3E3E3]/60 transition-all duration-300">
          {sidebarContent}
        </aside>
      )}
    </>
  );
};

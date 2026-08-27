import React from 'react';
import { 
  Sparkles, 
  LayoutGrid, 
  Users, 
  FileText, 
  Clipboard,
  PieChart, 
  Settings, 
  PanelLeftClose, 
  PanelLeft,
  ChevronsRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeNav: string;
  onSelectNav: (nav: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeNav,
  onSelectNav
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'classroom', label: 'My Classroom', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exams', icon: Clipboard },
    { id: 'library', label: 'My Library', icon: PieChart },
  ];

  return (
    <aside className={`bg-white rounded-3xl shadow-sm border border-slate-200/80 transition-all duration-300 flex flex-col justify-between p-4 z-30 shrink-0 select-none ${
      isCollapsed ? 'w-20 items-center' : 'w-64'
    }`}>
      
      {/* Top Header Logo & Collapse Toggle */}
      <div className="space-y-5 w-full">
        <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            {/* VedaAI Logo Icon */}
            <div className="h-10 w-10 rounded-2xl bg-black flex items-center justify-center text-white font-black text-xl shadow-md">
              V
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                VedaAI
              </span>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* AI Teacher's Toolkit Pill CTA Button */}
        {isCollapsed ? (
          <div className="flex justify-center w-full">
            <button 
              onClick={onToggleCollapse}
              className="h-11 w-11 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-orange-500 shadow-md hover:scale-105 transition"
            >
              <Sparkles className="h-5 w-5 text-orange-400" />
            </button>
          </div>
        ) : (
          <button className="w-full py-2.5 px-4 rounded-full bg-slate-900 border-2 border-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 transition">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span>AI Teacher's Toolkit</span>
          </button>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1 pt-2 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings & School Emblem Card / Expand Button */}
      <div className="space-y-3 pt-4 border-t border-slate-100 w-full">
        {!isCollapsed && (
          <button className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition">
            <Settings className="h-4.5 w-4.5 text-slate-400" />
            <span>Settings</span>
          </button>
        )}

        {/* Delhi Public School Card */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs shadow-sm">
              <span className="text-base">🌳</span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              title="Expand sidebar"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0 shadow-sm">
              <span className="text-base">🌳</span>
            </div>
            <div className="truncate">
              <span className="font-bold text-xs text-slate-900 block truncate">Delhi Public School</span>
              <span className="text-[10px] text-slate-500 block truncate font-medium">Bokaro Steel City</span>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
};


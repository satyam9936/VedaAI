import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardShellProps {
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  isMobileMenuOpen: boolean;
  onOpenMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onBackHeader?: () => void;
  onOpenApiKey?: () => void;
  hasApiKey?: boolean;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  isMobileMenuOpen,
  onOpenMobileMenu,
  onCloseMobileMenu,
  activeNav,
  onSelectNav,
  onBackHeader,
  onOpenApiKey,
  hasApiKey,
  children,
}) => {
  return (
    <div className="w-full h-screen min-h-screen bg-[#F7F7F7] flex p-3 overflow-hidden font-sans select-none box-border">
      {/* SaaS Dashboard Container Filling 100% Viewport Height & Width */}
      <div className="w-full h-full bg-[#F7F7F7] flex flex-col lg:flex-row gap-3 relative overflow-hidden">
        
        {/* Fixed Left Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={onToggleSidebarCollapse}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={onCloseMobileMenu}
          activeNav={activeNav}
          onSelectNav={onSelectNav}
        />

        {/* Main Content Workspace Filling Remaining Viewport */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden gap-3 relative">
          <TopBar 
            onBack={onBackHeader} 
            onOpenMobileMenu={onOpenMobileMenu}
            onOpenApiKey={onOpenApiKey}
            hasApiKey={hasApiKey}
            title="Exams" 
          />
          <main className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
};

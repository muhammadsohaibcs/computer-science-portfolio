import React, { memo, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:pl-[256px] pt-[60px]">
        <div className="p-4 sm:p-6 min-h-[calc(100vh-60px)] animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';
export default Layout;

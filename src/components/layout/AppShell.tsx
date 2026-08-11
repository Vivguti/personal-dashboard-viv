import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { QuickAddButton } from './QuickAddButton';

export function AppShell() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans">
      <Header />
      
      <div className="flex flex-1 relative">
        <Sidebar />
        
        <main className="flex-1 md:ml-60 flex flex-col min-w-0 pb-[80px] md:pb-0">
          <div className="flex-1 w-full p-4 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />
      
      <QuickAddButton 
        externalOpen={isQuickAddOpen} 
        onExternalClose={() => setIsQuickAddOpen(false)} 
      />
    </div>
  );
};

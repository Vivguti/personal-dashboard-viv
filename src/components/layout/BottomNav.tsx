import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Heart, Wallet, Plus } from 'lucide-react';

export interface BottomNavProps {
  onQuickAddClick: () => void;
}

export function BottomNav({ onQuickAddClick }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <NavLink
          to="/"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
            ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`
          }
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
            ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`
          }
        >
          <CheckSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Tasks</span>
        </NavLink>

        <div className="relative w-16 h-full flex items-center justify-center">
          <button
            onClick={onQuickAddClick}
            className="absolute -top-5 flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            aria-label="Quick Add"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>

        <NavLink
          to="/health"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
            ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`
          }
        >
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-medium">Health</span>
        </NavLink>

        <NavLink
          to="/finance"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
            ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`
          }
        >
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-medium">Finance</span>
        </NavLink>
      </div>
    </nav>
  );
};

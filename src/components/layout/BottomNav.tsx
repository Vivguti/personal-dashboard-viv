import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Heart, Wallet, Plus } from 'lucide-react'

export interface BottomNavProps {
  onQuickAddClick: () => void
}

export function BottomNav({ onQuickAddClick }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gray-200/80 dark:border-gray-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
            ${isActive ? 'text-emerald-800 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
            ${isActive ? 'text-emerald-800 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`
          }
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Tasks</span>
        </NavLink>

        <div className="relative w-16 h-full flex items-center justify-center">
          <button
            onClick={onQuickAddClick}
            className="absolute -top-4 flex items-center justify-center w-13 h-13 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 dark:focus:ring-offset-gray-900"
            aria-label="Quick Add"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        <NavLink
          to="/health"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
            ${isActive ? 'text-emerald-800 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`
          }
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Health</span>
        </NavLink>

        <NavLink
          to="/finance"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors
            ${isActive ? 'text-emerald-800 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`
          }
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Finance</span>
        </NavLink>
      </div>
    </nav>
  )
}

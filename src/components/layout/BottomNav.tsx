import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, CheckSquare, Heart, Plus } from 'lucide-react'

export interface BottomNavProps {
  onQuickAddClick: () => void
}

export function BottomNav({ onQuickAddClick }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-[#dce5de] dark:border-[#26352e] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors
            ${isActive ? 'text-[#315c4a] dark:text-[#f3f7f3] font-bold' : 'text-[#718078] dark:text-[#a8bdaf]'}`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors
            ${isActive ? 'text-[#315c4a] dark:text-[#f3f7f3] font-bold' : 'text-[#718078] dark:text-[#a8bdaf]'}`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-bold">Schedule</span>
        </NavLink>

        <div className="relative w-14 h-full flex items-center justify-center">
          <button
            onClick={onQuickAddClick}
            className="absolute -top-4 flex items-center justify-center w-13 h-13 bg-[#315c4a] hover:bg-[#26352e] text-white rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#315c4a]"
            aria-label="Quick Add"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors
            ${isActive ? 'text-[#315c4a] dark:text-[#f3f7f3] font-bold' : 'text-[#718078] dark:text-[#a8bdaf]'}`
          }
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold">Tasks</span>
        </NavLink>

        <NavLink
          to="/health"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors
            ${isActive ? 'text-[#315c4a] dark:text-[#f3f7f3] font-bold' : 'text-[#718078] dark:text-[#a8bdaf]'}`
          }
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-bold">Wellness</span>
        </NavLink>
      </div>
    </nav>
  )
}

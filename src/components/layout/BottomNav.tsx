import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, CheckSquare, Heart, Plus } from 'lucide-react'

export interface BottomNavProps {
  onQuickAddClick: () => void
}

export function BottomNav({ onQuickAddClick }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#eef1eb] border-t border-[#c4cfbc] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {[
          { to: '/',         icon: LayoutDashboard, label: 'Home'     },
          { to: '/calendar', icon: CalendarDays,    label: 'Schedule' },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors ${
                isActive ? 'text-[#5e6544] font-black' : 'text-[#8c947d]'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{label}</span>
          </NavLink>
        ))}

        <div className="relative w-14 h-full flex items-center justify-center">
          <button
            onClick={onQuickAddClick}
            className="absolute -top-4 flex items-center justify-center w-13 h-13 bg-[#5e6544] hover:bg-[#2e2f22] text-white rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5e6544]"
            aria-label="Quick Add"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        {[
          { to: '/tasks',  icon: CheckSquare, label: 'Tasks'   },
          { to: '/health', icon: Heart,       label: 'Wellness'},
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-full space-y-1 transition-colors ${
                isActive ? 'text-[#5e6544] font-black' : 'text-[#8c947d]'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

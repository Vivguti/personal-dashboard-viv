import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Target,
  Heart,
  Wallet,
  Briefcase,
  Settings,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function Sidebar() {
  const { user } = useAuth()

  const navItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/calendar', label: 'Schedule', icon: CalendarDays },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/health', label: 'Wellness', icon: Heart },
    { path: '/finance', label: 'Money', icon: Wallet },
    { path: '/business', label: 'Business', icon: Briefcase },
  ]

  return (
    <aside className="hidden md:flex flex-col w-60 fixed left-0 top-16 bottom-0 bg-[#f5e8d0] border-r border-[#d6c7ad] z-30">
      <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px]
              ${
                isActive
                  ? 'bg-[#8c947d] text-white shadow-xs border border-[#8c947d]'
                  : 'text-[#8c947d] hover:bg-[#d6c7ad]/40 hover:text-[#2e2f22]'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-[#d6c7ad]">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px]
              ${
                isActive
                  ? 'bg-[#8c947d] text-white shadow-xs border border-[#8c947d]'
                  : 'text-[#8c947d] hover:bg-[#d6c7ad]/40 hover:text-[#2e2f22]'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-[#d6c7ad]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#8c947d] text-white flex items-center justify-center flex-shrink-0 border border-[#8c947d]">
            <span className="font-black text-xs">
              {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#8c947d] truncate">
              {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

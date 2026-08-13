import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, CalendarDays,
  Heart, Wallet, Briefcase, Settings, BookOpen
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function Sidebar() {
  const { user } = useAuth()

  const navItems = [
    { path: '/',          label: 'Home',     icon: LayoutDashboard },
    { path: '/tasks',     label: 'Tasks',    icon: CheckSquare     },
    { path: '/calendar',  label: 'Schedule', icon: CalendarDays    },
    { path: '/goals',     label: 'Studio',   icon: BookOpen        },
    { path: '/health',    label: 'Wellness', icon: Heart           },
    { path: '/finance',   label: 'Money',    icon: Wallet          },
    { path: '/business',  label: 'Business', icon: Briefcase       },
  ]

  return (
    <aside className="hidden md:flex flex-col w-60 fixed left-0 top-16 bottom-0 bg-[#315C4A] z-30">
      <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-white text-[#315C4A] shadow-sm'
                  : 'text-white/80 hover:bg-white/15 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-white/20">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-white text-[#315C4A] shadow-sm'
                  : 'text-white/80 hover:bg-white/15 hover:text-white'
              }`
            }
          >
            <Settings className="w-4 h-4" /> Settings
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-[#315C4A] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="font-black text-xs">
              {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <p className="text-xs font-bold text-white/80 truncate">
            {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
          </p>
        </div>
      </div>
    </aside>
  )
}

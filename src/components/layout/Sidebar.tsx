import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, CalendarDays,
  Target, Heart, Wallet, Briefcase, Settings,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function Sidebar() {
  const { user } = useAuth()

  const navItems = [
    { path: '/',          label: 'Home',     icon: LayoutDashboard },
    { path: '/tasks',     label: 'Tasks',    icon: CheckSquare     },
    { path: '/calendar',  label: 'Schedule', icon: CalendarDays    },
    { path: '/goals',     label: 'Goals',    icon: Target          },
    { path: '/health',    label: 'Wellness', icon: Heart           },
    { path: '/finance',   label: 'Money',    icon: Wallet          },
    { path: '/business',  label: 'Business', icon: Briefcase       },
  ]

  return (
    <aside className="hidden md:flex flex-col w-60 fixed left-0 top-16 bottom-0 bg-[#eef1eb] border-r border-[#c4cfbc] z-30">
      <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-[#8c947d] text-white shadow-xs'
                  : 'text-[#5e6544] hover:bg-[#dfe8db] hover:text-[#2e2f22]'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-[#c4cfbc]">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-[#8c947d] text-white shadow-xs'
                  : 'text-[#5e6544] hover:bg-[#dfe8db] hover:text-[#2e2f22]'
              }`
            }
          >
            <Settings className="w-4 h-4" /> Settings
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-[#c4cfbc]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#8c947d] text-white flex items-center justify-center flex-shrink-0">
            <span className="font-black text-xs">
              {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <p className="text-xs font-bold text-[#5e6544] truncate">
            {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
          </p>
        </div>
      </div>
    </aside>
  )
}

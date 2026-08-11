import { useState } from 'react'
import { Sun, Moon, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/Button'
import { AIAssistantDrawer } from '@/components/ai/AIAssistantDrawer'

export function Header() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false)

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?'

  return (
    <>
      {/* Top Bar Background: Soft Sage Green (#8C947D) */}
      <header className="sticky top-0 z-40 w-full bg-[#8c947d] text-white border-b border-[#5e6544]/30 h-14 md:h-16 shadow-xs">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            {/* Logo Mark: Pure White Background (#FFFFFF) with Soft Sage Text (#8C947D) */}
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-xs">
              <span className="text-[#8c947d] font-black text-xs tracking-wider">OS</span>
            </div>
            <span className="hidden md:block text-base font-black text-white tracking-tight">
              PERSONAL OS
            </span>
            <span className="md:hidden text-sm font-black text-white tracking-tight">
              POS
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAIDrawerOpen(true)}
              className="bg-[#f5e8d0] hover:bg-[#d6c7ad] text-[#2e2f22] font-bold text-xs flex items-center gap-1.5 rounded-xl border border-[#d6c7ad] shadow-xs"
            >
              <Sparkles size={14} className="text-[#8c947d]" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 rounded-full text-white hover:bg-[#5e6544]/40"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-white" />
              ) : (
                <Sun className="w-4 h-4 text-white" />
              )}
            </Button>

            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-white text-[#8c947d] font-black text-xs shadow-xs">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
    </>
  )
}

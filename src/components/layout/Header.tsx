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
      <header className="sticky top-0 z-40 w-full glass border-b border-[#d6c7ad] dark:border-[#5e6544]/40 h-14 md:h-16">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            {/* Logo Mark: Bark Background (#5E6544) with Parchment Text (#F5E8D0) */}
            <div className="w-8 h-8 bg-[#5e6544] border border-[#5e6544] rounded-xl flex items-center justify-center shadow-xs">
              <span className="text-[#f5e8d0] font-black text-xs tracking-wider">OS</span>
            </div>
            <span className="hidden md:block text-base font-black text-[#2e2f22] dark:text-[#f5e8d0] tracking-tight">
              PERSONAL OS
            </span>
            <span className="md:hidden text-sm font-black text-[#2e2f22] dark:text-[#f5e8d0] tracking-tight">
              POS
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAIDrawerOpen(true)}
              className="bg-[#f5e8d0] hover:bg-[#d6c7ad] text-[#2e2f22] font-bold text-xs flex items-center gap-1.5 rounded-xl border border-[#d6c7ad]"
            >
              <Sparkles size={14} className="text-[#5e6544]" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 rounded-full text-[#2e2f22] dark:text-[#b7c3a1]"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            <div className="w-8 h-8 rounded-full bg-[#5e6544] flex items-center justify-center border border-[#5e6544] text-[#f5e8d0] font-bold text-xs">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
    </>
  )
}

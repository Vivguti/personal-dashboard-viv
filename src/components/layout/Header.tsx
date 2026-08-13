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
      {/* Header: Deep Botanical Green — matches sidebar and Health-page palette */}
      <header className="sticky top-0 z-40 w-full bg-[#315C4A] text-white border-b border-[#26352E]/40 h-14 md:h-16 shadow-sm">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-[#315C4A] font-black text-xs tracking-wider">OS</span>
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
              className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl border border-white/25 shadow-sm backdrop-blur-sm"
            >
              <Sparkles size={14} className="text-[#A8BDAF]" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 rounded-full text-white hover:bg-white/15"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-white" />
              ) : (
                <Sun className="w-4 h-4 text-white" />
              )}
            </Button>

            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#315C4A] font-black text-xs shadow-sm">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
    </>
  )
}

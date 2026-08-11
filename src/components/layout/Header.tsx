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
      <header className="sticky top-0 z-40 w-full glass border-b border-[#dce5de] dark:border-[#26352e] h-14 md:h-16">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            {/* Botanical Logo Mark */}
            <div className="w-8 h-8 bg-[#315c4a] rounded-xl flex items-center justify-center shadow-xs">
              <span className="text-white font-black text-xs tracking-wider">OS</span>
            </div>
            <span className="hidden md:block text-base font-extrabold text-[#26352e] dark:text-[#f3f7f3] tracking-tight">
              PERSONAL OS
            </span>
            <span className="md:hidden text-sm font-extrabold text-[#26352e] dark:text-[#f3f7f3] tracking-tight">
              POS
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAIDrawerOpen(true)}
              className="bg-[#e8f0ea] dark:bg-[#26352e] text-[#315c4a] dark:text-[#f3f7f3] border border-[#c4d4ca] dark:border-[#315c4a] hover:bg-[#c4d4ca] font-bold text-xs flex items-center gap-1.5 rounded-xl"
            >
              <Sparkles size={14} className="text-[#315c4a] dark:text-[#a8bdaf]" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 rounded-full text-[#718078] dark:text-[#a8bdaf]"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            <div className="w-8 h-8 rounded-full bg-[#e8f0ea] dark:bg-[#26352e] flex items-center justify-center border border-[#c4d4ca] dark:border-[#315c4a] text-[#315c4a] dark:text-[#f3f7f3] font-bold text-xs">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
    </>
  )
}

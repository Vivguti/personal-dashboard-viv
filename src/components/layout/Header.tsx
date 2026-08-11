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
      <header className="sticky top-0 z-40 w-full glass border-b border-gray-200/80 dark:border-gray-800 h-14 md:h-16">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            {/* Botanical Logo Mark */}
            <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-xs tracking-wider">OS</span>
            </div>
            <span className="hidden md:block text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Personal OS
            </span>
            <span className="md:hidden text-base font-bold text-gray-900 dark:text-white">
              POS
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAIDrawerOpen(true)}
              className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 rounded-full text-gray-600 dark:text-gray-300"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
    </>
  )
}

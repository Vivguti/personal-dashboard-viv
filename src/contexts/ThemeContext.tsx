// ============================================
// Personal OS — Theme Context
// ============================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'personal-os-theme'

function getInitialTheme(): ThemeMode {
  return 'light' // Always default to light Parchment background (#F5E8D0)
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', '#8c947d')
    }
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

import { Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 h-14 md:h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-2">
          {/* Logo mark placeholder */}
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">OS</span>
          </div>
          <span className="hidden md:block text-xl font-bold text-gray-900 dark:text-white">
            Personal OS
          </span>
          <span className="md:hidden text-lg font-bold text-gray-900 dark:text-white">
            POS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-10 h-10 p-0 rounded-full"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
};

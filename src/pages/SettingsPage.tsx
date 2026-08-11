import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Moon, Sun, Info, LogOut } from 'lucide-react';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
          <User size={18} className="text-gray-500 dark:text-gray-400" />
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Profile</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Display Name</label>
            <div className="text-gray-900 dark:text-gray-100 font-medium">
              {user?.user_metadata?.display_name || 'Not set'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <div className="text-gray-900 dark:text-gray-100">
              {user?.email}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
          {theme === 'dark' ? (
            <Moon size={18} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <Sun size={18} className="text-gray-500 dark:text-gray-400" />
          )}
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Appearance</h2>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode interface</div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
          <Info size={18} className="text-gray-500 dark:text-gray-400" />
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">About</h2>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Version</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">Phase 1 — Foundation</span>
          </div>
        </div>
      </Card>

      <div className="pt-4">
        <Button variant="danger" className="w-full flex justify-center items-center gap-2" onClick={() => signOut()}>
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

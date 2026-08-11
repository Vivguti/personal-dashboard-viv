import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CheckSquare, CalendarDays, BarChart3, Droplets, Dumbbell, Wallet } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {getGreeting()}, {user?.user_metadata?.display_name || 'User'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{today}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="hover:shadow-md transition-shadow dark:hover:shadow-gray-900/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <CheckSquare size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Today's Priorities</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">3 tasks today</p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-800" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Placeholder Task {i}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow dark:hover:shadow-gray-900/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Next Event</h2>
            </div>
          </div>
          <div className="h-24 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No upcoming events
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow dark:hover:shadow-gray-900/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Task Progress</h2>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2 text-gray-600 dark:text-gray-300">
              <span>Completed</span>
              <span>0/0</span>
            </div>
            <ProgressBar value={0} />
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow dark:hover:shadow-gray-900/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Droplets size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Hydration</h2>
            </div>
          </div>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">/ 128 oz</div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow dark:hover:shadow-gray-900/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Dumbbell size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Training</h2>
            </div>
          </div>
          <div className="h-24 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No workout scheduled
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow dark:hover:shadow-gray-900/50 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Finance Snapshot</h2>
            </div>
          </div>
          <div className="h-24 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">$0.00</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">balance</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

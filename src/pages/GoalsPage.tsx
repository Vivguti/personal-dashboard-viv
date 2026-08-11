import { Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function GoalsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Goals</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mb-6">
          <Target size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No goals set</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
          Define your goals to start tracking progress and achieving more.
        </p>
        <Button>New Goal</Button>
      </div>
    </div>
  );
};

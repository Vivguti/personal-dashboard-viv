import { Filter, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function TasksPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
        <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Filter size={20} />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
          <CheckSquare size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No tasks yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
          Create your first task to get started and keep your life organized.
        </p>
        <Button>New Task</Button>
      </div>
    </div>
  );
};

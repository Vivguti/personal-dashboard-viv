import { CalendarDays } from 'lucide-react';

export function CalendarPage() {
  const currentMonthYear = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{currentMonthYear}</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
          <CalendarDays size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No events scheduled</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Your calendar will appear here once events are added.
        </p>
      </div>
    </div>
  );
};

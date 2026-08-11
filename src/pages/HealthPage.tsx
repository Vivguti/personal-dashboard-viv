import { useState } from 'react';
import { Droplets, Apple, Dumbbell, Moon, Pill } from 'lucide-react';

type TabId = 'hydration' | 'nutrition' | 'training' | 'sleep' | 'supplements';

export function HealthPage() {
  const [activeTab, setActiveTab] = useState<TabId>('hydration');

  const tabs = [
    { id: 'hydration', label: 'Hydration', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { id: 'training', label: 'Training', icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 'supplements', label: 'Supplements', icon: Pill, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ] as const;

  const currentTab = tabs.find(t => t.id === activeTab)!;
  const ActiveIcon = currentTab.icon;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Health</h1>
      </header>

      <div className="w-full overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${currentTab.bg} ${currentTab.color}`}>
          <ActiveIcon size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No {currentTab.label.toLowerCase()} data</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Start tracking your {currentTab.label.toLowerCase()} to see insights here.
        </p>
      </div>
    </div>
  );
};

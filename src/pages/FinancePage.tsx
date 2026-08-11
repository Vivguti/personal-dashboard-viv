import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Target } from 'lucide-react';

type TabId = 'overview' | 'income' | 'expenses' | 'budgets' | 'goals';

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'income', label: 'Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'goals', label: 'Goals' },
  ] as const;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finance</h1>
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

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Wallet size={20} />
              </div>
              <h2 className="font-semibold text-gray-700 dark:text-gray-300">Total Balance</h2>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">$0.00</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <TrendingUp size={20} />
              </div>
              <h2 className="font-semibold text-gray-700 dark:text-gray-300">Monthly Income</h2>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">$0.00</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <TrendingDown size={20} />
              </div>
              <h2 className="font-semibold text-gray-700 dark:text-gray-300">Monthly Expenses</h2>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">$0.00</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <PiggyBank size={20} />
              </div>
              <h2 className="font-semibold text-gray-700 dark:text-gray-300">Savings Progress</h2>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">0%</div>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-6">
            <Target size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No {activeTab} data</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Add data to start tracking your {activeTab}.
          </p>
        </div>
      )}
    </div>
  );
};

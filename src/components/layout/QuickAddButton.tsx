import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { 
  CheckSquare, CalendarPlus, Dumbbell, UtensilsCrossed, 
  Droplets, Pill, Repeat, DollarSign, CreditCard, 
  FolderKanban, Target, StickyNote 
} from 'lucide-react';

export interface QuickAddButtonProps {
  externalOpen?: boolean;
  onExternalClose?: () => void;
  onSelectOption?: (optionId: string) => void;
}

export function QuickAddButton({ 
  externalOpen, 
  onExternalClose,
  onSelectOption
}: QuickAddButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  
  const handleClose = () => {
    if (onExternalClose) {
      onExternalClose();
    } else {
      setInternalOpen(false);
    }
  };

  const handleOpen = () => {
    setInternalOpen(true);
  };

  const options = [
    { id: 'task', label: 'Task', icon: CheckSquare, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 'event', label: 'Event', icon: CalendarPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { id: 'workout', label: 'Workout', icon: Dumbbell, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
    { id: 'meal', label: 'Meal', icon: UtensilsCrossed, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
    { id: 'supplement', label: 'Supplement', icon: Pill, color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20' },
    { id: 'habit', label: 'Habit', icon: Repeat, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    { id: 'income', label: 'Income', icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'expense', label: 'Expense', icon: CreditCard, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
    { id: 'project', label: 'Project', icon: FolderKanban, color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' },
    { id: 'goal', label: 'Goal', icon: Target, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
    { id: 'note', label: 'Note', icon: StickyNote, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <>
      {/* Desktop Floating Action Button (hidden on mobile) */}
      <div className="hidden md:block fixed bottom-8 right-8 z-40">
        <button
          onClick={handleOpen}
          className="flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
          aria-label="Quick Add"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} title="Quick Add">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                if (onSelectOption) onSelectOption(option.id);
                handleClose();
              }}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${option.color}`}>
                <option.icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

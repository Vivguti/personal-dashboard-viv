import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import {
  CheckSquare, CalendarPlus, Dumbbell, UtensilsCrossed,
  Droplets, Pill, Repeat, DollarSign, CreditCard,
  FolderKanban, Target, Moon
} from 'lucide-react'

import { TaskModal } from '@/components/forms/TaskModal'
import { EventModal } from '@/components/forms/EventModal'
import { ProjectModal } from '@/components/forms/ProjectModal'
import { GoalModal } from '@/components/forms/GoalModal'
import { HydrationModal } from '@/components/forms/HydrationModal'
import { MealModal } from '@/components/forms/MealModal'
import { WorkoutModal } from '@/components/forms/WorkoutModal'
import { SleepModal } from '@/components/forms/SleepModal'
import { SupplementModal } from '@/components/forms/SupplementModal'
import { HabitModal } from '@/components/forms/HabitModal'
import { IncomeModal } from '@/components/forms/IncomeModal'
import { ExpenseModal } from '@/components/forms/ExpenseModal'

export interface QuickAddButtonProps {
  externalOpen?: boolean
  onExternalClose?: () => void
  onSelectOption?: (optionId: string) => void
}

export function QuickAddButton({
  externalOpen,
  onExternalClose,
  onSelectOption,
}: QuickAddButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Creation modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)

  // Health modal states
  const [isHydrationModalOpen, setIsHydrationModalOpen] = useState(false)
  const [isMealModalOpen, setIsMealModalOpen] = useState(false)
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false)
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false)
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false)

  // Finance modal states
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen

  const handleClose = () => {
    if (onExternalClose) {
      onExternalClose()
    } else {
      setInternalOpen(false)
    }
  }

  const handleOpen = () => {
    setInternalOpen(true)
  }

  const handleOptionClick = (id: string) => {
    if (onSelectOption) onSelectOption(id)
    handleClose()

    switch (id) {
      case 'task':
        setIsTaskModalOpen(true)
        break
      case 'event':
        setIsEventModalOpen(true)
        break
      case 'project':
        setIsProjectModalOpen(true)
        break
      case 'goal':
        setIsGoalModalOpen(true)
        break
      case 'water':
        setIsHydrationModalOpen(true)
        break
      case 'meal':
        setIsMealModalOpen(true)
        break
      case 'workout':
        setIsWorkoutModalOpen(true)
        break
      case 'sleep':
        setIsSleepModalOpen(true)
        break
      case 'supplement':
        setIsSupplementModalOpen(true)
        break
      case 'habit':
        setIsHabitModalOpen(true)
        break
      case 'income':
        setIsIncomeModalOpen(true)
        break
      case 'expense':
        setIsExpenseModalOpen(true)
        break
    }
  }

  const options = [
    { id: 'task', label: 'Task', icon: CheckSquare, color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'event', label: 'Event', icon: CalendarPlus, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { id: 'workout', label: 'Workout', icon: Dumbbell, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
    { id: 'meal', label: 'Meal', icon: UtensilsCrossed, color: 'text-green-600 bg-green-50 dark:bg-green-950/40' },
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 'supplement', label: 'Supplement', icon: Pill, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
    { id: 'habit', label: 'Habit', icon: Repeat, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
    { id: 'income', label: 'Income', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'expense', label: 'Expense', icon: CreditCard, color: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
    { id: 'project', label: 'Project', icon: FolderKanban, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
    { id: 'goal', label: 'Goal', icon: Target, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
  ]

  return (
    <>
      {/* Desktop Floating Action Button */}
      <div className="hidden md:block fixed bottom-8 right-8 z-40">
        <button
          onClick={handleOpen}
          className="flex items-center justify-center w-14 h-14 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 dark:focus:ring-offset-gray-900"
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
              onClick={() => handleOptionClick(option.id)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${option.color}`}>
                <option.icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Creation Modals */}
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <EventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} />
      <HydrationModal isOpen={isHydrationModalOpen} onClose={() => setIsHydrationModalOpen(false)} />
      <MealModal isOpen={isMealModalOpen} onClose={() => setIsMealModalOpen(false)} />
      <WorkoutModal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} />
      <SleepModal isOpen={isSleepModalOpen} onClose={() => setIsSleepModalOpen(false)} />
      <SupplementModal isOpen={isSupplementModalOpen} onClose={() => setIsSupplementModalOpen(false)} />
      <HabitModal isOpen={isHabitModalOpen} onClose={() => setIsHabitModalOpen(false)} />
      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
    </>
  )
}

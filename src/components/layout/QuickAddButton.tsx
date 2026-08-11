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
    { id: 'task', label: 'Priority', icon: CheckSquare, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'event', label: 'Schedule', icon: CalendarPlus, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'workout', label: 'Movement', icon: Dumbbell, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'meal', label: 'Nutrition', icon: UtensilsCrossed, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'supplement', label: 'Supplement', icon: Pill, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'habit', label: 'Habit', icon: Repeat, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'income', label: 'Income', icon: DollarSign, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'expense', label: 'Expense', icon: CreditCard, color: 'text-[#a85d48] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'project', label: 'Project', icon: FolderKanban, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
    { id: 'goal', label: 'Goal', icon: Target, color: 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22]' },
  ]

  return (
    <>
      {/* Desktop Floating Action Button */}
      <div className="hidden md:block fixed bottom-8 right-8 z-40">
        <button
          onClick={handleOpen}
          className="flex items-center justify-center w-14 h-14 bg-[#5e6544] hover:bg-[#2e2f22] text-[#faf8f3] rounded-full shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5e6544]"
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

import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckSquare } from 'lucide-react'
import type { Task, WorkloadSummary } from '@/types'
import { Button } from '@/components/ui/Button'
import { TaskCard } from '@/components/cards/TaskCard'
import { WorkloadWidget } from '@/components/cards/WorkloadWidget'
import { TaskModal } from '@/components/forms/TaskModal'
import { getTasks, toggleTaskComplete, deleteTask } from '@/services/tasksService'
import { computeWorkloadSummary } from '@/services/workloadService'

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workloadSummary, setWorkloadSummary] = useState<WorkloadSummary | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
      setWorkloadSummary(computeWorkloadSummary('Overall Tasks', fetchedTasks, []))
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleComplete = async (task: Task) => {
    const isCompleted = task.status === 'completed'
    const updated = await toggleTaskComplete(task.id, !isCompleted)
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setWorkloadSummary(computeWorkloadSummary('Overall Tasks', tasks.map((t) => (t.id === updated.id ? updated : t)), []))
    }
  }

  const handleDelete = async (task: Task) => {
    const success = await deleteTask(task.id)
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    }
  }

  const handleEdit = (task: Task) => {
    setTaskToEdit(task)
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setTaskToEdit(null)
    setIsModalOpen(true)
  }

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'inbox' && t.status !== 'inbox') return false
    if (activeTab === 'planned' && t.status !== 'planned') return false
    if (activeTab === 'in_progress' && t.status !== 'in_progress') return false
    if (activeTab === 'completed' && t.status !== 'completed') return false

    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    return true
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} total tasks · {tasks.filter(t => t.status === 'completed').length} completed
          </p>
        </div>

        <Button onClick={handleCreateNew} icon={<Plus size={18} />}>
          New Task
        </Button>
      </div>

      {/* Workload Capacity Summary */}
      {workloadSummary && <WorkloadWidget summary={workloadSummary} />}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'inbox', label: 'Inbox' },
            { id: 'planned', label: 'Planned' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Task List / Empty State */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading tasks...</div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center mb-4">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            No tasks found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {searchQuery || activeTab !== 'all'
              ? 'No tasks match your current filters.'
              : 'Add your first task to start managing your daily workload.'}
          </p>
          <Button onClick={handleCreateNew} icon={<Plus size={18} />}>
            Create Task
          </Button>
        </div>
      )}

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
        onTaskSaved={loadData}
      />
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, CheckSquare, Inbox, Calendar, TrendingUp, CheckCircle2,
  Clock, Zap, BarChart3
} from 'lucide-react'
import type { Task, WorkloadSummary } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TaskCard } from '@/components/cards/TaskCard'
import { TaskModal } from '@/components/forms/TaskModal'
import { getTasks, toggleTaskComplete, deleteTask } from '@/services/tasksService'
import { computeWorkloadSummary } from '@/services/workloadService'
import { useAppSync, triggerSync } from '@/lib/sync'

// ─── Sage & White Palette ────────────────────────────────────────────────────
// Deep Botanical Green : #315C4A   Sage : #A8BDAF   Light Sage : #E8F0EA
// Very Light Sage : #F3F7F3   Dark Charcoal : #26352E   Muted : #718078
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'all' | 'inbox' | 'planned' | 'in_progress' | 'completed'

const TAB_ACTIVE   = 'bg-[#315C4A] text-white border-[#315C4A]'
const TAB_INACTIVE = 'bg-white text-[#718078] hover:bg-[#E8F0EA] border-[#E8F0EA]'

const tabs = [
  { id: 'all' as TabId,         label: 'All Tasks',   icon: CheckSquare  },
  { id: 'inbox' as TabId,       label: 'Inbox',       icon: Inbox        },
  { id: 'planned' as TabId,     label: 'Planned',     icon: Calendar     },
  { id: 'in_progress' as TabId, label: 'In Progress', icon: TrendingUp   },
  { id: 'completed' as TabId,   label: 'Completed',   icon: CheckCircle2 },
]

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<TabId>('all')
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
      setWorkloadSummary(computeWorkloadSummary('Your Priorities', fetchedTasks, []))
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useAppSync(loadData)

  const handleToggleComplete = async (task: Task) => {
    const isCompleted = task.status === 'completed'
    const updated = await toggleTaskComplete(task.id, !isCompleted)
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setWorkloadSummary(computeWorkloadSummary('Your Priorities', tasks.map((t) => (t.id === updated.id ? updated : t)), []))
      triggerSync()
    }
  }

  const handleDelete = async (task: Task) => {
    const success = await deleteTask(task.id)
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      triggerSync()
    }
  }

  const handleEdit = (task: Task) => { setTaskToEdit(task); setIsModalOpen(true) }
  const handleCreateNew = () => { setTaskToEdit(null); setIsModalOpen(true) }

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'inbox'       && t.status !== 'inbox')       return false
    if (activeTab === 'planned'     && t.status !== 'planned')     return false
    if (activeTab === 'in_progress' && t.status !== 'in_progress') return false
    if (activeTab === 'completed'   && t.status !== 'completed')   return false
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Stats for dashboard cards
  const totalCount     = tasks.length
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const inboxCount     = tasks.filter(t => t.status === 'inbox').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const criticalCount  = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length
  const highCount      = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
  const estMinutes     = tasks.filter(t => t.status !== 'completed').reduce((s, t) => s + (t.estimated_minutes ?? 0), 0)
  const estHours       = Math.floor(estMinutes / 60)
  const estMins        = estMinutes % 60

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E8F0EA]">
        <div>
          <h1 className="text-2xl font-black text-[#26352E] tracking-tight">Your Priorities</h1>
          <p className="text-sm text-[#718078] mt-0.5">Focus, energy, and workload at a glance</p>
        </div>
        <Button
          onClick={handleCreateNew}
          icon={<Plus size={16} />}
          className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none shadow-sm font-semibold"
        >
          New Priority
        </Button>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${activeTab === tab.id ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#718078] text-sm">Loading priorities…</div>
      ) : (
        <>
          {/* ── TAB: ALL — Dashboard Overview ─────────────────────────── */}
          {activeTab === 'all' && (
            <div className="space-y-6">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Completion Rate */}
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#718078] uppercase tracking-wider">Completion</span>
                    <div className="w-8 h-8 rounded-xl bg-[#E8F0EA] flex items-center justify-center">
                      <CheckCircle2 size={15} className="text-[#315C4A]" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#26352E]">{completionRate}%</div>
                  <p className="text-xs text-[#718078]">{completedCount} of {totalCount} done</p>
                  <div className="w-full h-1.5 bg-[#F3F7F3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#315C4A] rounded-full transition-all duration-700"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </Card>

                {/* In Progress */}
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#718078] uppercase tracking-wider">Active</span>
                    <div className="w-8 h-8 rounded-xl bg-[#E8F0EA] flex items-center justify-center">
                      <TrendingUp size={15} className="text-[#315C4A]" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#26352E]">{inProgressCount}</div>
                  <p className="text-xs text-[#718078]">{inboxCount} in inbox</p>
                </Card>

                {/* Critical / High */}
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#718078] uppercase tracking-wider">Urgent</span>
                    <div className="w-8 h-8 rounded-xl bg-[#26352E]/10 flex items-center justify-center">
                      <Zap size={15} className="text-[#26352E]" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#26352E]">{criticalCount + highCount}</div>
                  <p className="text-xs text-[#718078]">{criticalCount} critical · {highCount} high</p>
                </Card>

                {/* Estimated Time */}
                <Card className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#718078] uppercase tracking-wider">Est. Work</span>
                    <div className="w-8 h-8 rounded-xl bg-[#E8F0EA] flex items-center justify-center">
                      <Clock size={15} className="text-[#315C4A]" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#26352E]">{estHours}h {estMins}m</div>
                  <p className="text-xs text-[#718078]">remaining workload</p>
                </Card>
              </div>

              {/* Workload chart summary */}
              {workloadSummary && (
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F3F7F3] pb-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#718078]">Capacity Breakdown</p>
                      <h3 className="text-base font-black text-[#26352E] mt-0.5">Daily Workload</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart3 size={16} className="text-[#315C4A]" />
                      <span className="text-xs font-bold text-[#315C4A]">
                        {workloadSummary.percentageCapacityUsed ?? 0}% used
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-[#F3F7F3] rounded-xl">
                      <div className="text-lg font-black text-[#26352E]">
                        {Math.floor((workloadSummary.totalEstimatedMinutes ?? 0) / 60)}h
                      </div>
                      <div className="text-[10px] font-bold text-[#718078] uppercase mt-0.5">Scheduled</div>
                    </div>
                    <div className="p-3 bg-[#F3F7F3] rounded-xl">
                      <div className="text-lg font-black text-[#315C4A]">
                        {Math.floor((workloadSummary.remainingCapacityMinutes ?? 0) / 60)}h
                      </div>
                      <div className="text-[10px] font-bold text-[#718078] uppercase mt-0.5">Free</div>
                    </div>
                    <div className="p-3 bg-[#F3F7F3] rounded-xl">
                      <div className="text-lg font-black text-[#26352E]">{workloadSummary.capacityStatus ?? '—'}</div>
                      <div className="text-[10px] font-bold text-[#718078] uppercase mt-0.5">Status</div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#F3F7F3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#315C4A] rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, workloadSummary.percentageCapacityUsed ?? 0)}%` }}
                    />
                  </div>
                </Card>
              )}

              {/* Full task list under All */}
              <div className="space-y-3">
                {tasks.length > 0 ? tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )) : (
                  <EmptyState onCreateNew={handleCreateNew} message="Add your first priority to start managing your workload." />
                )}
              </div>
            </div>
          )}

          {/* ── TAB: INBOX ────────────────────────────────────────────── */}
          {activeTab === 'inbox' && (
            <TabContent
              tasks={filteredTasks}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onToggle={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={handleCreateNew}
              emptyMsg="Nothing in your inbox. Great job staying on top of things!"
            />
          )}

          {/* ── TAB: PLANNED ──────────────────────────────────────────── */}
          {activeTab === 'planned' && (
            <TabContent
              tasks={filteredTasks}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onToggle={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={handleCreateNew}
              emptyMsg="No planned tasks yet. Schedule something to get started."
            />
          )}

          {/* ── TAB: IN PROGRESS ──────────────────────────────────────── */}
          {activeTab === 'in_progress' && (
            <TabContent
              tasks={filteredTasks}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onToggle={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={handleCreateNew}
              emptyMsg="Nothing in progress right now. Start a task to see it here."
            />
          )}

          {/* ── TAB: COMPLETED ────────────────────────────────────────── */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {/* Completion summary card */}
              <Card className="p-5 flex items-center gap-5 bg-[#315C4A] border-none">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Achievements</p>
                  <h3 className="text-xl font-black text-white mt-0.5">{completedCount} Completed</h3>
                  <p className="text-xs text-white/70 mt-0.5">{completionRate}% overall completion rate</p>
                </div>
              </Card>

              <TabContent
                tasks={filteredTasks}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onToggle={handleToggleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreateNew={handleCreateNew}
                emptyMsg="No completed tasks yet — finish something to see it here!"
              />
            </div>
          )}
        </>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
        onTaskSaved={loadData}
      />
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

interface TabContentProps {
  tasks: Task[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  onToggle: (t: Task) => void
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
  onCreateNew: () => void
  emptyMsg: string
}

function TabContent({ tasks, searchQuery, setSearchQuery, onToggle, onEdit, onDelete, onCreateNew, emptyMsg }: TabContentProps) {
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search priorities..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-64 px-3 py-2 text-sm rounded-xl border border-[#E8F0EA] bg-white text-[#26352E] placeholder-[#718078]/60 focus:outline-none focus:ring-2 focus:ring-[#315C4A]"
      />

      {/* Task list */}
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreateNew={onCreateNew} message={emptyMsg} />
      )}
    </div>
  )
}

function EmptyState({ onCreateNew, message }: { onCreateNew: () => void; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-[#E8F0EA]">
      <div className="w-14 h-14 bg-[#E8F0EA] text-[#315C4A] rounded-2xl flex items-center justify-center mb-4">
        <CheckSquare size={28} />
      </div>
      <h3 className="text-base font-bold text-[#26352E] mb-1">No priorities found</h3>
      <p className="text-sm text-[#718078] max-w-sm mb-6">{message}</p>
      <Button
        onClick={onCreateNew}
        icon={<Plus size={16} />}
        className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none shadow-sm font-semibold"
      >
        Create Priority
      </Button>
    </div>
  )
}

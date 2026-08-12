import { useState, useEffect, useCallback } from 'react'
import { Target, Plus, FolderKanban, TrendingUp } from 'lucide-react'
import type { Goal, Project } from '@/types'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { GoalModal } from '@/components/forms/GoalModal'
import { ProjectModal } from '@/components/forms/ProjectModal'
import { getGoals } from '@/services/goalsService'
import { getProjects } from '@/services/projectsService'

const TAB_ACTIVE   = 'border-[#5e6544] text-[#2e2f22]'
const TAB_INACTIVE = 'border-transparent text-[#8c947d] hover:text-[#2e2f22]'

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-[#a85d48]/10 text-[#a85d48] border-[#a85d48]/30',
  high:     'bg-[#5e6544]/15 text-[#5e6544] border-[#8c947d]/40',
  medium:   'bg-[#b7c3a1]/40 text-[#5e6544] border-[#b7c3a1]',
  low:      'bg-[#dfe8db] text-[#8c947d] border-[#c4cfbc]',
}

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-[#5e6544]/10 text-[#5e6544] border-[#b7c3a1]',
  planning:  'bg-[#dfe8db] text-[#8c947d] border-[#c4cfbc]',
  on_hold:   'bg-[#c4cfbc]/60 text-[#8c947d] border-[#c4cfbc]',
  completed: 'bg-[#b7c3a1]/40 text-[#5e6544] border-[#b7c3a1]',
  cancelled: 'bg-[#a85d48]/10 text-[#a85d48] border-[#a85d48]/30',
}

export function GoalsPage() {
  const [activeTab, setActiveTab] = useState<'goals' | 'projects'>('goals')
  const [goals, setGoals] = useState<Goal[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [fetchedGoals, fetchedProjects] = await Promise.all([getGoals(), getProjects()])
      setGoals(fetchedGoals)
      setProjects(fetchedProjects)
    } catch (err) {
      console.error('Failed to load goals/projects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleOpenGoalModal    = (g?: Goal)    => { setGoalToEdit(g ?? null);    setIsGoalModalOpen(true) }
  const handleOpenProjectModal = (p?: Project) => { setProjectToEdit(p ?? null); setIsProjectModalOpen(true) }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#c4cfbc]">
        <div>
          <h1 className="text-2xl font-black text-[#2e2f22] tracking-tight">What You're Building</h1>
          <p className="text-sm text-[#8c947d] mt-0.5">{goals.length} Goals · {projects.length} Projects</p>
        </div>
        {activeTab === 'goals' ? (
          <Button variant="secondary" onClick={() => handleOpenGoalModal()} icon={<Plus size={16} />}>New Goal</Button>
        ) : (
          <Button variant="secondary" onClick={() => handleOpenProjectModal()} icon={<Plus size={16} />}>New Project</Button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-[#c4cfbc]">
        {([['goals', `Identity Goals (${goals.length})`], ['projects', `Projects (${projects.length})`]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === id ? TAB_ACTIVE : TAB_INACTIVE}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#8c947d] text-sm">Loading…</div>
      ) : activeTab === 'goals' ? (
        goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const current = goal.current_value ?? 0
              const target  = goal.target_value ?? 1
              const percent = Math.min(100, Math.round((current / target) * 100))
              return (
                <div key={goal.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-5 hover:border-[#8c947d] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-base text-[#2e2f22]">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-xs text-[#8c947d] mt-0.5 line-clamp-2">{goal.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${PRIORITY_BADGE[goal.priority] ?? PRIORITY_BADGE.low}`}>
                      {goal.priority}
                    </span>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <div className="flex justify-between text-xs text-[#8c947d]">
                      <span>Progress</span>
                      <span className="font-bold text-[#5e6544]">{current} / {target} {goal.unit ?? ''} ({percent}%)</span>
                    </div>
                    <ProgressBar value={percent} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-[#c4cfbc]">
            <div className="w-14 h-14 bg-[#dfe8db] text-[#8c947d] rounded-2xl flex items-center justify-center mb-4">
              <Target size={28} />
            </div>
            <h3 className="text-base font-bold text-[#2e2f22] mb-1">No identity goals set</h3>
            <p className="text-sm text-[#8c947d] max-w-sm mb-6">Define clear long-term goals to connect with your projects and daily focus.</p>
            <Button variant="secondary" onClick={() => handleOpenGoalModal()} icon={<Plus size={16} />}>New Goal</Button>
          </div>
        )
      ) : (
        projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project: Project) => (
              <div key={project.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-5 hover:border-[#8c947d] transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-base text-[#2e2f22]">{project.title}</h3>
                    {project.description && (
                      <p className="text-xs text-[#8c947d] mt-0.5 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${STATUS_BADGE[project.status] ?? STATUS_BADGE.planning}`}>
                    {project.status}
                  </span>
                </div>
                {project.deadline && (
                  <p className="text-[10px] text-[#8c947d] mt-2">
                    Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                {(project.estimated_minutes ?? 0) > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-[#8c947d] mb-1">
                      <span className="flex items-center gap-1"><TrendingUp size={10} /> Progress</span>
                      <span className="font-bold text-[#5e6544]">
                        {Math.round(((project.completed_minutes ?? 0) / (project.estimated_minutes ?? 1)) * 100)}%
                      </span>
                    </div>
                    <ProgressBar value={Math.round(((project.completed_minutes ?? 0) / (project.estimated_minutes ?? 1)) * 100)} size="sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-[#c4cfbc]">
            <div className="w-14 h-14 bg-[#dfe8db] text-[#8c947d] rounded-2xl flex items-center justify-center mb-4">
              <FolderKanban size={28} />
            </div>
            <h3 className="text-base font-bold text-[#2e2f22] mb-1">No projects created</h3>
            <p className="text-sm text-[#8c947d] max-w-sm mb-6">Create a project to group related priorities and track overall progress.</p>
            <Button variant="secondary" onClick={() => handleOpenProjectModal()} icon={<Plus size={16} />}>New Project</Button>
          </div>
        )
      )}

      <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} goalToEdit={goalToEdit} onGoalSaved={loadData} />
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} projectToEdit={projectToEdit} onProjectSaved={loadData} />
    </div>
  )
}

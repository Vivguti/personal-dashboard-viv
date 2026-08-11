import { useState, useEffect, useCallback } from 'react'
import { Target, Plus, FolderKanban } from 'lucide-react'
import type { Goal, Project } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { GoalModal } from '@/components/forms/GoalModal'
import { ProjectModal } from '@/components/forms/ProjectModal'
import { getGoals } from '@/services/goalsService'
import { getProjects } from '@/services/projectsService'

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
      const [fetchedGoals, fetchedProjects] = await Promise.all([
        getGoals(),
        getProjects(),
      ])
      setGoals(fetchedGoals)
      setProjects(fetchedProjects)
    } catch (err) {
      console.error('Failed to load goals/projects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenGoalModal = (g?: Goal) => {
    setGoalToEdit(g ?? null)
    setIsGoalModalOpen(true)
  }

  const handleOpenProjectModal = (p?: Project) => {
    setProjectToEdit(p ?? null)
    setIsProjectModalOpen(true)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#26352e] dark:text-[#f3f7f3] tracking-tight">What You're Building</h1>
          <p className="text-sm text-[#718078] dark:text-[#a8bdaf]">
            {goals.length} Goals · {projects.length} Projects
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'goals' ? (
            <Button onClick={() => handleOpenGoalModal()} icon={<Plus size={18} />}>
              New Goal
            </Button>
          ) : (
            <Button onClick={() => handleOpenProjectModal()} icon={<Plus size={18} />}>
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-[#d6c7ad]">
        <button
          onClick={() => setActiveTab('goals')}
          className={`pb-3 px-4 font-extrabold text-sm transition-colors border-b-2 ${
            activeTab === 'goals'
              ? 'border-[#d6c7ad] text-[#2e2f22] dark:text-[#f5e8d0]'
              : 'border-transparent text-[#8c947d] hover:text-[#2e2f22]'
          }`}
        >
          Identity Goals ({goals.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-4 font-extrabold text-sm transition-colors border-b-2 ${
            activeTab === 'projects'
              ? 'border-[#d6c7ad] text-[#2e2f22] dark:text-[#f5e8d0]'
              : 'border-transparent text-[#8c947d] hover:text-[#2e2f22]'
          }`}
        >
          Projects ({projects.length})
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#718078] text-sm">Loading data...</div>
      ) : activeTab === 'goals' ? (
        /* Goals View */
        goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const current = goal.current_value ?? 0
              const target = goal.target_value ?? 1
              const percent = Math.min(100, Math.round((current / target) * 100))

              return (
                <Card key={goal.id} className="p-5 hover:border-[#315c4a] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-base text-[#26352e] dark:text-[#f3f7f3]">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-[#718078] dark:text-[#a8bdaf] mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#e8f0ea] dark:bg-[#26352e] text-[#315c4a] dark:text-[#f3f7f3]">
                      {goal.priority}
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-4">
                    <div className="flex justify-between text-xs text-[#718078] dark:text-[#a8bdaf]">
                      <span>Progress</span>
                      <span className="font-bold text-[#315c4a]">
                        {current} / {target} {goal.unit ?? ''} ({percent}%)
                      </span>
                    </div>
                    <ProgressBar value={percent} />
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-[#1c2722] rounded-2xl border border-[#dce5de] dark:border-[#26352e]">
            <div className="w-16 h-16 bg-[#e8f0ea] dark:bg-[#26352e] text-[#315c4a] dark:text-[#f3f7f3] rounded-2xl flex items-center justify-center mb-4">
              <Target size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#26352e] dark:text-[#f3f7f3] mb-1">No identity goals set</h3>
            <p className="text-sm text-[#718078] dark:text-[#a8bdaf] max-w-sm mb-6">
              Define clear long-term goals to connect with your projects and daily focus.
            </p>
            <Button onClick={() => handleOpenGoalModal()} icon={<Plus size={18} />}>
              New Goal
            </Button>
          </div>
        )
      ) : (
        /* Projects View */
        projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project: Project) => (
              <Card key={project.id} className="p-5 hover:border-[#315c4a] transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-base text-[#26352e] dark:text-[#f3f7f3]">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-[#718078] dark:text-[#a8bdaf] mt-0.5 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#e8f0ea] dark:bg-[#26352e] text-[#315c4a] dark:text-[#f3f7f3]">
                    {project.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-[#1c2722] rounded-2xl border border-[#dce5de] dark:border-[#26352e]">
            <div className="w-16 h-16 bg-[#e8f0ea] dark:bg-[#26352e] text-[#315c4a] dark:text-[#f3f7f3] rounded-2xl flex items-center justify-center mb-4">
              <FolderKanban size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#26352e] dark:text-[#f3f7f3] mb-1">
              No projects created
            </h3>
            <p className="text-sm text-[#718078] dark:text-[#a8bdaf] max-w-sm mb-6">
              Create a project to group related priorities and track overall progress.
            </p>
            <Button onClick={() => handleOpenProjectModal()} icon={<Plus size={18} />}>
              New Project
            </Button>
          </div>
        )
      )}

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
        onGoalSaved={loadData}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectToEdit={projectToEdit}
        onProjectSaved={loadData}
      />
    </div>
  )
}

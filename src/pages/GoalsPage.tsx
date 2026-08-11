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
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Goals & Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('goals')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'goals'
              ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Goals ({goals.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'projects'
              ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Projects ({projects.length})
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading data...</div>
      ) : activeTab === 'goals' ? (
        /* Goals View */
        goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const current = goal.current_value ?? 0
              const target = goal.target_value ?? 1
              const percent = Math.min(100, Math.round((current / target) * 100))

              return (
                <Card key={goal.id} className="p-5 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                      {goal.priority}
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Progress</span>
                      <span>
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
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center mb-4">
              <Target size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No goals set</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Set clear long-term goals to connect with your projects and daily tasks.
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
              <Card key={project.id} className="p-5 hover:border-emerald-500/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                    {project.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center mb-4">
              <FolderKanban size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              No projects created
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Create a project to group your related tasks and track overall completion.
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

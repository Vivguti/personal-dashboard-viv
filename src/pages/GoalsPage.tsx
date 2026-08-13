import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2, Circle, MapPin, BookOpen,
  ChevronRight, Layers, AlertTriangle, CalendarDays, Trash2, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  getStudioProjects, getStudioDeadlines, toggleDeadlineComplete,
  deleteStudioProject, deleteStudioDeadline,
  type StudioProject, type StudioDeadline, type StudioPhase, type DeadlineType
} from '@/services/studioService'
import { useAppSync, triggerSync } from '@/lib/sync'

// ─── Palette ──────────────────────────────────────────────────────────────────
const TAB_ACTIVE   = 'bg-[#315C4A] text-white border-[#315C4A]'
const TAB_INACTIVE = 'bg-white text-[#718078] hover:bg-[#E8F0EA] border-[#E8F0EA]'

const PHASE_LABELS: Record<StudioPhase, string> = {
  brief:              'Brief',
  research:           'Research',
  concept:            'Concept',
  schematic:          'Schematic',
  design_dev:         'Design Dev',
  construction_docs:  'Construction Docs',
  final_presentation: 'Final Presentation',
}

const PHASE_ORDER: StudioPhase[] = [
  'brief', 'research', 'concept', 'schematic',
  'design_dev', 'construction_docs', 'final_presentation',
]

const DEADLINE_TYPE_BADGE: Record<DeadlineType, string> = {
  pin_up:     'bg-[#A8BDAF]/40 text-[#315C4A] border-[#A8BDAF]',
  critique:   'bg-[#26352E]/10 text-[#26352E] border-[#26352E]/30',
  submission: 'bg-[#315C4A]/10 text-[#315C4A] border-[#315C4A]/30',
  review:     'bg-[#E8F0EA] text-[#718078] border-[#E8F0EA]',
  final:      'bg-[#26352E] text-white border-[#26352E]',
  workshop:   'bg-[#F3F7F3] text-[#718078] border-[#E8F0EA]',
}

const DEADLINE_TYPE_LABEL: Record<DeadlineType, string> = {
  pin_up:     'Pin-Up',
  critique:   'Critique',
  submission: 'Submission',
  review:     'Review',
  final:      'Final Jury',
  workshop:   'Workshop',
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(dateStr)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function urgencyColor(days: number, completed: boolean): string {
  if (completed) return 'text-[#A8BDAF]'
  if (days < 0)  return 'text-[#26352E] font-black'
  if (days <= 3) return 'text-[#26352E] font-bold'
  if (days <= 7) return 'text-[#315C4A] font-semibold'
  return 'text-[#718078]'
}

// ── Mini: New Deadline inline form ────────────────────────────────────────────
interface NewDeadlineFormProps {
  projects: StudioProject[]
  onSave: (d: Omit<StudioDeadline, 'id'>) => void
  onCancel: () => void
}
function NewDeadlineForm({ projects, onSave, onCancel }: NewDeadlineFormProps) {
  const [title, setTitle]       = useState('')
  const [projectId, setProject] = useState(projects[0]?.id ?? '')
  const [type, setType]         = useState<DeadlineType>('submission')
  const [dueDate, setDueDate]   = useState('')
  const [dueTime, setDueTime]   = useState('17:00')
  const [location, setLocation] = useState('')
  const [notes, setNotes]       = useState('')

  const proj = projects.find(p => p.id === projectId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate || !projectId) return
    onSave({
      projectId,
      projectTitle: proj?.title ?? '',
      courseCode:   proj?.courseCode ?? '',
      title: title.trim(),
      type,
      dueDate,
      dueTime,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      completed: false,
    })
  }

  const field = 'w-full px-3 py-2 text-sm rounded-xl border border-[#E8F0EA] bg-white text-[#26352E] placeholder-[#718078]/50 focus:outline-none focus:ring-2 focus:ring-[#315C4A]'

  return (
    <form onSubmit={handleSubmit} className="bg-[#F3F7F3] rounded-2xl border border-[#E8F0EA] p-5 space-y-3">
      <p className="text-xs font-black text-[#26352E] uppercase tracking-wider mb-1">New Deadline</p>
      <input className={field} placeholder="Deadline title (e.g. Concept Boards Pin-Up)" value={title} onChange={e => setTitle(e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <select className={field} value={projectId} onChange={e => setProject(e.target.value)}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.courseCode} – {p.title.slice(0, 25)}</option>)}
        </select>
        <select className={field} value={type} onChange={e => setType(e.target.value as DeadlineType)}>
          {(Object.entries(DEADLINE_TYPE_LABEL) as [DeadlineType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input type="date" className={field} value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        <input type="time" className={field} value={dueTime} onChange={e => setDueTime(e.target.value)} />
      </div>
      <input className={field} placeholder="Location (e.g. Studio 204, Canvas upload)" value={location} onChange={e => setLocation(e.target.value)} />
      <textarea className={`${field} resize-none`} rows={2} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
      <div className="flex gap-2 pt-1">
        <Button type="submit" className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none shadow-sm font-semibold text-xs">Save Deadline</Button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-[#E8F0EA] text-xs font-bold text-[#718078] hover:bg-[#E8F0EA] transition-all">Cancel</button>
      </div>
    </form>
  )
}

// ── Mini: New Project inline form ─────────────────────────────────────────────
interface NewProjectFormProps {
  onSave: (p: Omit<StudioProject, 'id' | 'createdAt'>) => void
  onCancel: () => void
}
function NewProjectForm({ onSave, onCancel }: NewProjectFormProps) {
  const [title, setTitle]       = useState('')
  const [courseCode, setCourse] = useState('')
  const [semester, setSemester] = useState('Fall 2026')
  const [brief, setBrief]       = useState('')
  const [finalDeadline, setFinalDeadline] = useState('')

  const field = 'w-full px-3 py-2 text-sm rounded-xl border border-[#E8F0EA] bg-white text-[#26352E] placeholder-[#718078]/50 focus:outline-none focus:ring-2 focus:ring-[#315C4A]'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !courseCode.trim()) return
    onSave({
      title: title.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      semester,
      status: 'active',
      currentPhase: 'brief',
      phaseProgress: 0,
      brief: brief.trim(),
      finalDeadline: finalDeadline ? new Date(finalDeadline).toISOString() : '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#F3F7F3] rounded-2xl border border-[#E8F0EA] p-5 space-y-3">
      <p className="text-xs font-black text-[#26352E] uppercase tracking-wider mb-1">New Studio Project</p>
      <input className={field} placeholder="Project title (e.g. Urban Infill Housing)" value={title} onChange={e => setTitle(e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <input className={field} placeholder="Course code (e.g. ARCH-401)" value={courseCode} onChange={e => setCourse(e.target.value)} required />
        <input className={field} placeholder="Semester" value={semester} onChange={e => setSemester(e.target.value)} />
      </div>
      <textarea className={`${field} resize-none`} rows={2} placeholder="Project brief / description" value={brief} onChange={e => setBrief(e.target.value)} />
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#718078] mb-1">Final Jury / Submission Date</label>
        <input type="date" className={field} value={finalDeadline} onChange={e => setFinalDeadline(e.target.value)} />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none shadow-sm font-semibold text-xs">Add Project</Button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-[#E8F0EA] text-xs font-bold text-[#718078] hover:bg-[#E8F0EA] transition-all">Cancel</button>
      </div>
    </form>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function GoalsPage() {
  const [projects, setProjects]   = useState<StudioProject[]>([])
  const [deadlines, setDeadlines] = useState<StudioDeadline[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showNewProject, setShowNewProject]   = useState(false)
  const [showNewDeadline, setShowNewDeadline] = useState(false)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [studioView, setStudioView]           = useState<'timeline' | 'projects'>('timeline')

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [fetchedProjects, fetchedDeadlines] = await Promise.all([
        getStudioProjects(),
        getStudioDeadlines(),
      ])
      setProjects(fetchedProjects)
      setDeadlines(fetchedDeadlines)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useAppSync(loadData)

  const handleToggleDeadline = async (id: string) => {
    await toggleDeadlineComplete(id)
    triggerSync()
  }

  const handleDeleteDeadline = async (id: string) => {
    await deleteStudioDeadline(id)
    triggerSync()
  }

  const handleDeleteProject = async (id: string) => {
    await deleteStudioProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
    setDeadlines(prev => prev.filter(d => d.projectId !== id))
  }

  // Stats
  const totalDeadlines  = deadlines.length
  const doneDeadlines   = deadlines.filter(d => d.completed).length
  const upcomingWeek    = deadlines.filter(d => !d.completed && daysUntil(d.dueDate) <= 7).length
  const overdue         = deadlines.filter(d => !d.completed && daysUntil(d.dueDate) < 0).length
  const sortedDeadlines = [...deadlines].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const pending         = sortedDeadlines.filter(d => !d.completed)
  const completed       = sortedDeadlines.filter(d => d.completed)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8F0EA]">
        <div>
          <h1 className="text-2xl font-black text-[#26352E] tracking-tight">Architecture Studio</h1>
          <p className="text-sm text-[#718078] mt-0.5">
            {projects.length} studio projects · {totalDeadlines - doneDeadlines} deadlines remaining
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewDeadline(v => !v)}
            className="px-3 py-2 rounded-xl border border-[#E8F0EA] bg-white text-xs font-bold text-[#315C4A] hover:bg-[#E8F0EA] transition-all flex items-center gap-1.5"
          >
            <CalendarDays size={14} /> Add Deadline
          </button>
          <Button
            onClick={() => setShowNewProject(v => !v)}
            icon={<Plus size={16} />}
            className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none shadow-sm font-semibold"
          >
            New Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#718078] text-sm">Loading…</div>
      ) : (

        /* ── ARCHITECTURE STUDIO TAB ────────────────────────────────────── */
        <div className="space-y-6">

          {/* Inline forms */}
          {showNewProject  && <NewProjectForm  onSave={async p => { const { createStudioProject } = await import('@/services/studioService'); await createStudioProject(p); await loadData(); setShowNewProject(false)  }} onCancel={() => setShowNewProject(false)}  />}
          {showNewDeadline && <NewDeadlineForm projects={projects} onSave={async d => { const { createStudioDeadline } = await import('@/services/studioService'); await createStudioDeadline(d); await loadData(); setShowNewDeadline(false) }} onCancel={() => setShowNewDeadline(false)} />}

          {/* ── Stat Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Studio Projects', value: projects.length, icon: BookOpen,      accent: 'bg-[#E8F0EA]', iconColor: 'text-[#315C4A]' },
              { label: 'Due This Week',   value: upcomingWeek,    icon: CalendarDays,  accent: upcomingWeek > 0 ? 'bg-[#26352E]/10' : 'bg-[#E8F0EA]', iconColor: upcomingWeek > 0 ? 'text-[#26352E]' : 'text-[#315C4A]' },
              { label: 'Overdue',         value: overdue,         icon: AlertTriangle, accent: overdue > 0 ? 'bg-[#26352E]' : 'bg-[#E8F0EA]', iconColor: overdue > 0 ? 'text-white' : 'text-[#315C4A]' },
              { label: 'Completed',       value: doneDeadlines,   icon: CheckCircle2,  accent: 'bg-[#E8F0EA]', iconColor: 'text-[#315C4A]' },
            ].map(stat => (
              <Card key={stat.label} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#718078] uppercase tracking-wider">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.accent}`}>
                    <stat.icon size={15} className={stat.iconColor} />
                  </div>
                </div>
                <div className={`text-2xl font-black ${overdue > 0 && stat.label === 'Overdue' ? 'text-[#26352E]' : 'text-[#26352E]'}`}>{stat.value}</div>
              </Card>
            ))}
          </div>

          {/* ── View Toggle ───────────────────────────────────────────── */}
          <div className="flex gap-1.5">
            {(['timeline', 'projects'] as const).map(v => (
              <button
                key={v}
                onClick={() => setStudioView(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all capitalize ${studioView === v ? TAB_ACTIVE : TAB_INACTIVE}`}
              >
                {v === 'timeline' ? '📅 Deadline Timeline' : '🏛 Studio Projects'}
              </button>
            ))}
          </div>

          {/* ── TIMELINE VIEW ─────────────────────────────────────────── */}
          {studioView === 'timeline' && (
            <div className="space-y-4">

              {/* Upcoming deadlines */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F3F7F3] pb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#718078]">Architecture Studio</p>
                    <h3 className="text-base font-black text-[#26352E] mt-0.5">Deadline Calendar</h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0EA] flex items-center justify-center">
                    <CalendarDays size={16} className="text-[#315C4A]" />
                  </div>
                </div>

                {pending.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#718078]">🎉 No pending deadlines!</div>
                ) : (
                  <div className="space-y-2">
                    {pending.map(dl => {
                      const days = daysUntil(dl.dueDate)
                      const dueLabel = days < 0   ? `${Math.abs(days)}d overdue`
                                     : days === 0 ? 'Due today'
                                     : days === 1 ? 'Due tomorrow'
                                     : `${days} days`
                      return (
                        <div
                          key={dl.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                            days < 0   ? 'bg-[#26352E]/5 border-[#26352E]/20' :
                            days <= 3  ? 'bg-[#F3F7F3] border-[#E8F0EA]' :
                                         'bg-white border-[#E8F0EA]'
                          }`}
                        >
                          {/* Check button */}
                          <button
                            onClick={() => handleToggleDeadline(dl.id)}
                            className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border border-[#A8BDAF] bg-white flex items-center justify-center hover:bg-[#E8F0EA] transition-colors"
                          >
                            <Circle size={12} className="text-[#A8BDAF]" />
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-black text-[#26352E]">{dl.title}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${DEADLINE_TYPE_BADGE[dl.type]}`}>
                                {DEADLINE_TYPE_LABEL[dl.type]}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#718078]">
                              <span className="font-semibold text-[#315C4A]">{dl.courseCode}</span>
                              <span className="flex items-center gap-1">
                                <CalendarDays size={10} />
                                {new Date(dl.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {dl.dueTime && ` at ${dl.dueTime}`}
                              </span>
                              {dl.location && <span className="flex items-center gap-1"><MapPin size={10} />{dl.location}</span>}
                            </div>
                            {dl.notes && <p className="text-[10px] text-[#718078] mt-1 line-clamp-1">{dl.notes}</p>}
                          </div>

                          {/* Days until + delete */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`text-xs ${urgencyColor(days, false)}`}>{dueLabel}</span>
                            <button onClick={() => handleDeleteDeadline(dl.id)} className="p-1 rounded-lg hover:bg-[#E8F0EA] text-[#718078] hover:text-[#26352E] transition-colors">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Completed deadlines */}
                {completed.length > 0 && (
                  <div className="border-t border-[#F3F7F3] pt-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#718078] mb-2">Completed ({completed.length})</p>
                    {completed.map(dl => (
                      <div key={dl.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F3F7F3] border border-[#E8F0EA] opacity-60">
                        <button onClick={() => handleToggleDeadline(dl.id)} className="flex-shrink-0 w-5 h-5 rounded-full bg-[#315C4A] flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-white" />
                        </button>
                        <span className="text-xs text-[#718078] line-through flex-1">{dl.title}</span>
                        <span className="text-[10px] text-[#718078]">{dl.courseCode}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── PROJECTS VIEW ─────────────────────────────────────────── */}
          {studioView === 'projects' && (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-14 h-14 bg-[#E8F0EA] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={28} className="text-[#315C4A]" />
                  </div>
                  <h3 className="text-base font-bold text-[#26352E] mb-2">No studio projects yet</h3>
                  <p className="text-sm text-[#718078] mb-5">Add your current studio projects to track phases and deadlines.</p>
                  <Button onClick={() => setShowNewProject(true)} icon={<Plus size={16} />} className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none font-semibold">
                    Add Studio Project
                  </Button>
                </Card>
              ) : projects.map(project => {
                const projectDeadlines = sortedDeadlines.filter(d => d.projectId === project.id)
                const isExpanded       = expandedProject === project.id
                const daysLeft         = project.finalDeadline ? daysUntil(project.finalDeadline.split('T')[0] ?? '') : null
                const phaseIdx         = PHASE_ORDER.indexOf(project.currentPhase)

                return (
                  <Card key={project.id} className="overflow-hidden">
                    {/* Project header */}
                    <div
                      className="p-5 cursor-pointer hover:bg-[#F3F7F3] transition-colors"
                      onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-[#315C4A] bg-[#E8F0EA] px-2 py-0.5 rounded-full">{project.courseCode}</span>
                            <span className="text-[10px] font-bold text-[#718078]">{project.semester}</span>
                          </div>
                          <h3 className="font-black text-base text-[#26352E]">{project.title}</h3>
                          {project.brief && <p className="text-xs text-[#718078] mt-1 line-clamp-2">{project.brief}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {daysLeft !== null && (
                            <div className={`text-right ${daysLeft <= 14 ? 'text-[#26352E]' : 'text-[#718078]'}`}>
                              <div className="text-xs font-black">{daysLeft}d</div>
                              <div className="text-[9px] font-bold uppercase">left</div>
                            </div>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteProject(project.id) }}
                            className="p-1.5 rounded-lg hover:bg-[#E8F0EA] text-[#718078] hover:text-[#26352E] transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                          <ChevronRight size={16} className={`text-[#718078] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Phase progress bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-[#718078]">
                          <span className="font-bold text-[#315C4A] flex items-center gap-1">
                            <Layers size={10} /> {PHASE_LABELS[project.currentPhase]}
                          </span>
                          <span className="font-bold">{project.phaseProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E8F0EA] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#315C4A] rounded-full transition-all duration-700"
                            style={{ width: `${project.phaseProgress}%` }}
                          />
                        </div>
                        {/* Phase steps */}
                        <div className="flex gap-0.5 mt-2">
                          {PHASE_ORDER.map((phase, i) => (
                            <div
                              key={phase}
                              title={PHASE_LABELS[phase]}
                              className={`flex-1 h-1 rounded-full transition-all ${
                                i < phaseIdx  ? 'bg-[#315C4A]' :
                                i === phaseIdx ? 'bg-[#A8BDAF]' :
                                                 'bg-[#E8F0EA]'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[8px] text-[#718078]">
                          <span>Brief</span><span>Final</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded: project deadlines */}
                    {isExpanded && (
                      <div className="border-t border-[#F3F7F3] px-5 py-4 space-y-2 bg-[#F3F7F3]/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#718078] mb-3">
                          Deadlines for this project ({projectDeadlines.length})
                        </p>
                        {projectDeadlines.length === 0 ? (
                          <p className="text-xs text-[#718078]">No deadlines added yet. Use "Add Deadline" above.</p>
                        ) : projectDeadlines.map(dl => {
                          const days = daysUntil(dl.dueDate)
                          return (
                            <div key={dl.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dl.completed ? 'opacity-50 bg-white border-[#E8F0EA]' : 'bg-white border-[#E8F0EA]'}`}>
                              <button onClick={() => handleToggleDeadline(dl.id)} className="flex-shrink-0">
                                {dl.completed
                                  ? <CheckCircle2 size={16} className="text-[#315C4A]" />
                                  : <Circle size={16} className="text-[#A8BDAF]" />
                                }
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold text-[#26352E] ${dl.completed ? 'line-through' : ''}`}>{dl.title}</p>
                                <p className="text-[10px] text-[#718078] flex items-center gap-2">
                                  <span className={`px-1 py-0.5 rounded text-[9px] font-bold border ${DEADLINE_TYPE_BADGE[dl.type]}`}>{DEADLINE_TYPE_LABEL[dl.type]}</span>
                                  {new Date(dl.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  {dl.dueTime && ` · ${dl.dueTime}`}
                                  {dl.location && ` · ${dl.location}`}
                                </p>
                              </div>
                              <span className={`text-[10px] font-bold flex-shrink-0 ${urgencyColor(days, dl.completed)}`}>
                                {dl.completed ? 'Done' : days < 0 ? `${Math.abs(days)}d late` : `${days}d`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

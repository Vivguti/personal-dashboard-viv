// ============================================
// Personal OS — Architecture Studio Projects Service
// ============================================

import { supabase } from '@/lib/supabase'

export type StudioPhase = 'brief' | 'research' | 'concept' | 'schematic' | 'design_dev' | 'construction_docs' | 'final_presentation'
export type StudioProjectStatus = 'upcoming' | 'active' | 'in_review' | 'completed'
export type DeadlineType = 'pin_up' | 'critique' | 'submission' | 'review' | 'final' | 'workshop'

export interface StudioProject {
  id: string
  title: string
  courseCode: string          // e.g. ARCH-331
  semester: string            // e.g. Fall 2026
  status: StudioProjectStatus
  currentPhase: StudioPhase
  phaseProgress: number       // 0–100
  brief: string
  finalDeadline: string       // ISO date string
  createdAt: string
}

export interface StudioDeadline {
  id: string
  projectId: string
  projectTitle: string
  courseCode: string
  title: string
  type: DeadlineType
  dueDate: string             // ISO date string
  dueTime?: string            // e.g. '14:00'
  location?: string
  notes?: string
  completed: boolean
}

// ── Demo seed data ────────────────────────────────────────────────────────────

const DEMO_PROJECTS: StudioProject[] = [
  {
    id: 'arch-proj-1',
    title: 'Adaptive Reuse: Industrial to Mixed-Use',
    courseCode: 'ARCH-401',
    semester: 'Fall 2026',
    status: 'active',
    currentPhase: 'schematic',
    phaseProgress: 60,
    brief: 'Transform an industrial warehouse into a mixed-use community hub incorporating housing, retail, and public space.',
    finalDeadline: '2026-12-12T23:59:00.000Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'arch-proj-2',
    title: 'Urban Infill Housing Study',
    courseCode: 'ARCH-331',
    semester: 'Fall 2026',
    status: 'active',
    currentPhase: 'concept',
    phaseProgress: 35,
    brief: 'Design a 12-unit affordable housing building on a narrow urban infill lot in a historic neighborhood.',
    finalDeadline: '2026-11-20T23:59:00.000Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'arch-proj-3',
    title: 'Structures Analysis: Long-Span Systems',
    courseCode: 'ARCH-331',
    semester: 'Fall 2026',
    status: 'active',
    currentPhase: 'research',
    phaseProgress: 20,
    brief: 'Structural case study comparing space frame, cable-stayed, and tensile membrane systems in civic buildings.',
    finalDeadline: '2026-10-15T23:59:00.000Z',
    createdAt: new Date().toISOString(),
  },
]

const DEMO_DEADLINES: StudioDeadline[] = [
  {
    id: 'dl-1',
    projectId: 'arch-proj-3',
    projectTitle: 'Structures Analysis',
    courseCode: 'ARCH-331',
    title: 'Precedent Study Submission',
    type: 'submission',
    dueDate: '2026-09-05',
    dueTime: '17:00',
    location: 'Canvas upload',
    notes: 'PDF export, max 20 pages, APA citations required.',
    completed: false,
  },
  {
    id: 'dl-2',
    projectId: 'arch-proj-2',
    projectTitle: 'Urban Infill Housing',
    courseCode: 'ARCH-331',
    title: 'Concept Boards Pin-Up',
    type: 'pin_up',
    dueDate: '2026-09-12',
    dueTime: '09:00',
    location: 'Studio 204',
    notes: '24×36 boards, 3 minimum. Bring physical prints.',
    completed: false,
  },
  {
    id: 'dl-3',
    projectId: 'arch-proj-1',
    projectTitle: 'Adaptive Reuse',
    courseCode: 'ARCH-401',
    title: 'Schematic Design Critique',
    type: 'critique',
    dueDate: '2026-09-19',
    dueTime: '10:00',
    location: 'Jury Room B',
    notes: 'External jurors present. Prepare 5-min presentation.',
    completed: false,
  },
  {
    id: 'dl-4',
    projectId: 'arch-proj-3',
    projectTitle: 'Structures Analysis',
    courseCode: 'ARCH-331',
    title: 'Midterm Structures Report',
    type: 'submission',
    dueDate: '2026-10-15',
    dueTime: '23:59',
    location: 'Canvas upload',
    notes: '40% of course grade.',
    completed: false,
  },
  {
    id: 'dl-5',
    projectId: 'arch-proj-2',
    projectTitle: 'Urban Infill Housing',
    courseCode: 'ARCH-331',
    title: 'Design Development Review',
    type: 'review',
    dueDate: '2026-10-24',
    dueTime: '13:00',
    location: 'Studio 204',
    notes: 'One-on-one desk crits with professor.',
    completed: false,
  },
  {
    id: 'dl-6',
    projectId: 'arch-proj-2',
    projectTitle: 'Urban Infill Housing',
    courseCode: 'ARCH-331',
    title: 'Final Housing Submission',
    type: 'final',
    dueDate: '2026-11-20',
    dueTime: '17:00',
    location: 'Studio 204',
    notes: 'Full drawing set + model + boards.',
    completed: false,
  },
  {
    id: 'dl-7',
    projectId: 'arch-proj-1',
    projectTitle: 'Adaptive Reuse',
    courseCode: 'ARCH-401',
    title: 'Final Jury — Adaptive Reuse',
    type: 'final',
    dueDate: '2026-12-12',
    dueTime: '09:00',
    location: 'Main Gallery',
    notes: 'External jury. Full exhibit setup required by 8AM.',
    completed: false,
  },
]

let demoProjects: StudioProject[] = [...DEMO_PROJECTS]
let demoDeadlines: StudioDeadline[] = [...DEMO_DEADLINES]

// ── Service functions ─────────────────────────────────────────────────────────

export async function getStudioProjects(): Promise<StudioProject[]> {
  try {
    const { data, error } = await (supabase.from('projects' as any) as any)
      .select('*').order('created_at', { ascending: false })
    if (error || !data || data.length === 0) return demoProjects
    return demoProjects // use demo — DB schema differs for studio
  } catch {
    return demoProjects
  }
}

export async function getStudioDeadlines(): Promise<StudioDeadline[]> {
  return demoDeadlines
}

export async function createStudioProject(p: Omit<StudioProject, 'id' | 'createdAt'>): Promise<StudioProject> {
  const project: StudioProject = { ...p, id: `arch-proj-${Date.now()}`, createdAt: new Date().toISOString() }
  demoProjects = [project, ...demoProjects]
  return project
}

export async function createStudioDeadline(d: Omit<StudioDeadline, 'id'>): Promise<StudioDeadline> {
  const deadline: StudioDeadline = { ...d, id: `dl-${Date.now()}` }
  demoDeadlines = [...demoDeadlines, deadline].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  return deadline
}

export async function toggleDeadlineComplete(id: string): Promise<void> {
  demoDeadlines = demoDeadlines.map(d => d.id === id ? { ...d, completed: !d.completed } : d)
}

export async function deleteStudioProject(id: string): Promise<void> {
  demoProjects  = demoProjects.filter(p => p.id !== id)
  demoDeadlines = demoDeadlines.filter(d => d.projectId !== id)
}

export async function deleteStudioDeadline(id: string): Promise<void> {
  demoDeadlines = demoDeadlines.filter(d => d.id !== id)
}

export async function updateProjectPhase(id: string, phase: StudioPhase, progress: number): Promise<void> {
  demoProjects = demoProjects.map(p => p.id === id ? { ...p, currentPhase: phase, phaseProgress: progress } : p)
}

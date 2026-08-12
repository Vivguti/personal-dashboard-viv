import { useState, useEffect, useCallback } from 'react'
import { Briefcase, Users, Target, Plus, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ClientModal }          from '@/components/forms/ClientModal'
import { LeadModal }            from '@/components/forms/LeadModal'
import { BusinessProjectModal } from '@/components/forms/BusinessProjectModal'
import { getBusinessOverview, updateLeadStatus, type Client, type Lead, type BusinessProject } from '@/services/businessService'

type TabId = 'overview' | 'clients' | 'leads' | 'projects'

const TAB_ACTIVE   = 'bg-[#5e6544] text-white border-[#5e6544]'
const TAB_INACTIVE = 'bg-white text-[#8c947d] hover:bg-[#dfe8db] border-[#c4cfbc]'

const LEAD_STATUS_BADGE: Record<string, string> = {
  new:       'bg-[#dfe8db] text-[#5e6544] border-[#c4cfbc]',
  contacted: 'bg-[#b7c3a1]/30 text-[#5e6544] border-[#b7c3a1]',
  qualified: 'bg-[#5e6544]/10 text-[#5e6544] border-[#8c947d]/30',
  proposal:  'bg-[#5e6544]/20 text-[#5e6544] border-[#5e6544]/40',
  won:       'bg-[#5e6544] text-white border-[#5e6544]',
  lost:      'bg-[#a85d48]/10 text-[#a85d48] border-[#a85d48]/30',
}

const PROJECT_STATUS_BADGE: Record<string, string> = {
  active:    'bg-[#5e6544]/10 text-[#5e6544] border-[#b7c3a1]',
  planning:  'bg-[#dfe8db] text-[#8c947d] border-[#c4cfbc]',
  on_hold:   'bg-[#c4cfbc]/60 text-[#8c947d] border-[#c4cfbc]',
  completed: 'bg-[#b7c3a1]/40 text-[#5e6544] border-[#b7c3a1]',
  cancelled: 'bg-[#a85d48]/10 text-[#a85d48] border-[#a85d48]/30',
}

const STAT_ITEMS = [
  { icon: DollarSign, label: 'Business Revenue', bg: 'bg-[#dfe8db] text-[#5e6544]' },
  { icon: Target,     label: 'Pipeline Value',   bg: 'bg-[#b7c3a1]/30 text-[#5e6544]' },
  { icon: Users,      label: 'Active Clients',   bg: 'bg-[#c4cfbc]/50 text-[#8c947d]' },
  { icon: Briefcase,  label: 'Active Projects',  bg: 'bg-[#dfe8db] text-[#8c947d]' },
]

export function BusinessPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isLoading, setIsLoading] = useState(true)

  const [totalRevenue,   setTotalRevenue]   = useState(0)
  const [pipelineValue,  setPipelineValue]  = useState(0)
  const [clients,        setClients]        = useState<Client[]>([])
  const [leads,          setLeads]          = useState<Lead[]>([])
  const [projects,       setProjects]       = useState<BusinessProject[]>([])

  const [isClientModalOpen,  setIsClientModalOpen]  = useState(false)
  const [isLeadModalOpen,    setIsLeadModalOpen]    = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const loadBusinessData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getBusinessOverview()
      setTotalRevenue(data.totalRevenue); setPipelineValue(data.pipelineValue)
      setClients(data.clients); setLeads(data.leads); setProjects(data.projects)
    } catch (err) {
      console.error('Failed to load business data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadBusinessData() }, [loadBusinessData])

  const handleLeadStageChange = async (leadId: string, newStatus: Lead['status']) => {
    await updateLeadStatus(leadId, newStatus)
    loadBusinessData()
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'clients',  label: 'Clients' },
    { id: 'leads',    label: 'Pipeline' },
    { id: 'projects', label: 'Projects' },
  ] as const

  const emptyCard = (msg: string) => (
    <div className="bg-white rounded-2xl border border-[#c4cfbc] p-8 text-center text-sm text-[#8c947d]">{msg}</div>
  )

  const statValues = [
    `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `$${pipelineValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    String(clients.length),
    String(projects.length),
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#c4cfbc]">
        <div>
          <h1 className="text-2xl font-black text-[#2e2f22] tracking-tight">Your Business</h1>
          <p className="text-sm text-[#8c947d] mt-0.5">CRM, projects, pipeline & revenue</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'clients'  && <Button variant="secondary" onClick={() => setIsClientModalOpen(true)}  icon={<Plus size={16}/>}>Add Client</Button>}
          {activeTab === 'leads'    && <Button variant="secondary" onClick={() => setIsLeadModalOpen(true)}    icon={<Plus size={16}/>}>Add Lead</Button>}
          {activeTab === 'projects' && <Button variant="secondary" onClick={() => setIsProjectModalOpen(true)} icon={<Plus size={16}/>}>New Project</Button>}
          {activeTab === 'overview' && (
            <>
              <Button variant="secondary" onClick={() => setIsClientModalOpen(true)} icon={<Plus size={16}/>}>Client</Button>
              <Button variant="secondary" onClick={() => setIsLeadModalOpen(true)}   icon={<Plus size={16}/>}>Lead</Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeTab === tab.id ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#8c947d] text-sm">Loading business dashboard…</div>
      ) : (
        <>
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_ITEMS.map(({ icon: Icon, label, bg }, i) => (
                  <div key={label} className="bg-white rounded-2xl border border-[#c4cfbc] p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl ${bg}`}><Icon size={18} /></div>
                      <h3 className="font-semibold text-[10px] text-[#8c947d] uppercase tracking-wider">{label}</h3>
                    </div>
                    <div className="text-2xl font-black text-[#2e2f22]">{statValues[i]}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#2e2f22]">Client Roster</h3>
                {clients.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clients.map((c: Client) => (
                      <div key={c.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4">
                        <h4 className="font-semibold text-[#2e2f22]">{c.name}</h4>
                        <p className="text-xs text-[#8c947d]">{c.company ?? 'Individual Client'}</p>
                        {c.email && <p className="text-xs text-[#5e6544] font-medium mt-0.5">{c.email}</p>}
                      </div>
                    ))}
                  </div>
                ) : emptyCard('No clients added. Click "Client" to build your roster.')}
              </div>
            </div>
          )}

          {/* CLIENTS */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              {clients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clients.map((c: Client) => (
                    <div key={c.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-5">
                      <h4 className="font-bold text-base text-[#2e2f22]">{c.name}</h4>
                      {c.company && <p className="text-xs font-semibold text-[#8c947d] mt-0.5">{c.company}</p>}
                      <div className="mt-3 space-y-1 text-xs text-[#8c947d]">
                        {c.email && <div>Email: <span className="text-[#5e6544]">{c.email}</span></div>}
                        {c.phone && <div>Phone: {c.phone}</div>}
                        {c.notes && <div className="mt-2 pt-2 border-t border-[#dfe8db] text-[#2e2f22]">{c.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : emptyCard('No client profiles created.')}
            </div>
          )}

          {/* LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-3">
              {leads.length > 0 ? leads.map((l: Lead) => (
                <div key={l.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[#2e2f22]">{l.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${LEAD_STATUS_BADGE[l.status] ?? LEAD_STATUS_BADGE.new}`}>
                        {l.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#8c947d] mt-0.5">
                      {l.company ?? 'Direct Lead'} · Est. ${l.estimated_value ?? 0}
                    </p>
                  </div>
                  <select
                    value={l.status}
                    onChange={(e) => handleLeadStageChange(l.id, e.target.value as Lead['status'])}
                    className="rounded-lg border border-[#c4cfbc] bg-[#dfe8db] px-2 py-1 text-xs font-semibold text-[#5e6544] focus:outline-none focus:ring-2 focus:ring-[#8c947d]"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              )) : emptyCard('No lead opportunities tracked.')}
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p: BusinessProject) => (
                    <div key={p.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[#2e2f22]">{p.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${PROJECT_STATUS_BADGE[p.status] ?? PROJECT_STATUS_BADGE.planning}`}>
                          {p.status}
                        </span>
                      </div>
                      {p.description && <p className="text-xs text-[#8c947d] mt-1">{p.description}</p>}
                    </div>
                  ))}
                </div>
              ) : emptyCard('No active business projects.')}
            </div>
          )}
        </>
      )}

      <ClientModal          isOpen={isClientModalOpen}  onClose={() => setIsClientModalOpen(false)}  onClientSaved={loadBusinessData} />
      <LeadModal            isOpen={isLeadModalOpen}    onClose={() => setIsLeadModalOpen(false)}    onLeadSaved={loadBusinessData} />
      <BusinessProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onProjectSaved={loadBusinessData} />
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Briefcase, Users, Target, Plus, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ClientModal } from '@/components/forms/ClientModal'
import { LeadModal } from '@/components/forms/LeadModal'
import { BusinessProjectModal } from '@/components/forms/BusinessProjectModal'
import { getBusinessOverview, updateLeadStatus, type Client, type Lead, type BusinessProject } from '@/services/businessService'

type TabId = 'overview' | 'clients' | 'leads' | 'projects'

export function BusinessPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Overview State
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [pipelineValue, setPipelineValue] = useState(0)
  const [clients, setClients] = useState<Client[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [projects, setProjects] = useState<BusinessProject[]>([])

  // Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const loadBusinessData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getBusinessOverview()
      setTotalRevenue(data.totalRevenue)
      setPipelineValue(data.pipelineValue)

      setClients(data.clients)
      setLeads(data.leads)
      setProjects(data.projects)
    } catch (err) {
      console.error('Failed to load business data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBusinessData()
  }, [loadBusinessData])

  const handleLeadStageChange = async (leadId: string, newStatus: Lead['status']) => {
    await updateLeadStatus(leadId, newStatus)
    loadBusinessData()
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'clients', label: 'Clients' },
    { id: 'leads', label: 'Lead Pipeline' },
    { id: 'projects', label: 'Business Projects' },
  ] as const

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#26352e] dark:text-[#f3f7f3] tracking-tight">Your Business</h1>
          <p className="text-sm text-[#718078] dark:text-[#a8bdaf]">
            CRM, client projects, deal pipeline, and business revenue
          </p>
        </div>

        <div>
          {activeTab === 'clients' && (
            <Button onClick={() => setIsClientModalOpen(true)} icon={<Plus size={18} />}>Add Client</Button>
          )}
          {activeTab === 'leads' && (
            <Button onClick={() => setIsLeadModalOpen(true)} icon={<Plus size={18} />}>Add Lead</Button>
          )}
          {activeTab === 'projects' && (
            <Button onClick={() => setIsProjectModalOpen(true)} icon={<Plus size={18} />}>New Project</Button>
          )}
          {activeTab === 'overview' && (
            <div className="flex gap-2">
              <Button onClick={() => setIsClientModalOpen(true)} icon={<Plus size={18} />}>Client</Button>
              <Button onClick={() => setIsLeadModalOpen(true)} icon={<Plus size={18} />}>Lead</Button>
            </div>
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#d6c7ad] text-[#2e2f22] border border-[#b7c3a1] shadow-xs'
                  : 'bg-white dark:bg-[#23241a] text-[#8c947d] hover:bg-[#f5e8d0] border border-[#d6c7ad]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading business dashboard...</div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-700 dark:text-emerald-300">
                      <DollarSign size={20} />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Business Revenue</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg text-blue-700 dark:text-blue-300">
                      <Target size={20} />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Pipeline Value</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    ${pipelineValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg text-purple-700 dark:text-purple-300">
                      <Users size={20} />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Active Clients</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {clients.length}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg text-amber-700 dark:text-amber-300">
                      <Briefcase size={20} />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Active Projects</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {projects.length}
                  </div>
                </Card>
              </div>

              {/* Recent Clients */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Client CRM Roster</h3>
                {clients.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clients.map((c: Client) => (
                      <Card key={c.id} className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</h4>
                          <p className="text-xs text-gray-500">{c.company ?? 'Individual Client'}</p>
                          {c.email && <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">{c.email}</p>}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center text-sm text-gray-500">
                    No clients added. Click "Add Client" to build your roster.
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CLIENTS */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              {clients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clients.map((c: Client) => (
                    <Card key={c.id} className="p-5">
                      <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">{c.name}</h4>
                      {c.company && <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{c.company}</p>}
                      <div className="mt-3 space-y-1 text-xs text-gray-500">
                        {c.email && <div>Email: {c.email}</div>}
                        {c.phone && <div>Phone: {c.phone}</div>}
                        {c.notes && <div className="mt-2 pt-2 border-t text-gray-600 dark:text-gray-300">{c.notes}</div>}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No client profiles created.</Card>
              )}
            </div>
          )}

          {/* TAB 3: LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              {leads.length > 0 ? (
                <div className="space-y-3">
                  {leads.map((l: Lead) => (
                    <Card key={l.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{l.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                            {l.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {l.company ?? 'Direct Lead'} · Est. Value: ${l.estimated_value ?? 0}
                        </p>
                      </div>

                      <select
                        value={l.status}
                        onChange={(e) => handleLeadStageChange(l.id, e.target.value as any)}
                        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs font-semibold text-gray-900 dark:text-gray-100"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No lead opportunities tracked.</Card>
              )}
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p: BusinessProject) => (
                    <Card key={p.id} className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{p.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          {p.status}
                        </span>
                      </div>
                      {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No active business projects.</Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Creation Modals */}
      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onClientSaved={loadBusinessData} />
      <LeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} onLeadSaved={loadBusinessData} />
      <BusinessProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onProjectSaved={loadBusinessData} />
    </div>
  )
}

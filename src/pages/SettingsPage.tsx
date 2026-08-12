import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { User, Info, LogOut, Leaf } from 'lucide-react'

export function SettingsPage() {
  const { user, signOut } = useAuth()

  const sectionHeader = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-2 p-4 border-b border-[#dfe8db] bg-[#eef1eb]">
      <span className="text-[#8c947d]">{icon}</span>
      <h2 className="font-bold text-sm text-[#2e2f22]">{label}</h2>
    </div>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-[#c4cfbc]">
        <h1 className="text-2xl font-black text-[#2e2f22] tracking-tight">Settings</h1>
        <p className="text-sm text-[#8c947d] mt-0.5">Account, appearance & about</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-[#c4cfbc] overflow-hidden">
        {sectionHeader(<User size={16} />, 'Profile')}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8c947d] uppercase tracking-wide mb-1">Display Name</label>
            <div className="text-sm font-semibold text-[#2e2f22]">
              {user?.user_metadata?.display_name || 'Not set'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8c947d] uppercase tracking-wide mb-1">Email</label>
            <div className="text-sm text-[#2e2f22]">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl border border-[#c4cfbc] overflow-hidden">
        {sectionHeader(<Leaf size={16} />, 'Appearance')}
        <div className="p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[#2e2f22]">Color Theme</div>
            <div className="text-xs text-[#8c947d] mt-0.5">Sage Green — always light</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#eef1eb] border border-[#c4cfbc]" title="Canvas" />
            <div className="w-5 h-5 rounded-full bg-[#8c947d]" title="Sage" />
            <div className="w-5 h-5 rounded-full bg-[#5e6544]" title="Bark" />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl border border-[#c4cfbc] overflow-hidden">
        {sectionHeader(<Info size={16} />, 'About')}
        <div className="p-5 space-y-3">
          {[
            ['Version',  '1.0.0'],
            ['Status',   'Phase 1 — Foundation'],
            ['Theme',    'Sage Green System'],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-[#8c947d]">{key}</span>
              <span className="font-semibold text-[#2e2f22]">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-2">
        <Button
          variant="danger"
          fullWidth
          onClick={() => signOut()}
          icon={<LogOut size={16} />}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}

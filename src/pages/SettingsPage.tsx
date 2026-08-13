import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { User, Info, LogOut, Leaf, Bell, Smartphone } from 'lucide-react'
import { getProfileSettings, updateNotificationPreferences, requestNotificationPermission, subscribeToPushNotifications } from '@/services/notificationService'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  
  // Notification State
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [morningSummaryEnabled, setMorningSummaryEnabled] = useState(true)
  const [morningSummaryTime, setMorningSummaryTime] = useState('07:30')
  const [eventRemindersEnabled, setEventRemindersEnabled] = useState(true)
  const [defaultReminderMinutes, setDefaultReminderMinutes] = useState(30)
  const [isSaving, setIsSaving] = useState(false)
  const [permissionError, setPermissionError] = useState('')

  useEffect(() => {
    async function loadSettings() {
      try {
        const profile: any = await getProfileSettings()
        setNotificationsEnabled(profile.notifications_enabled || false)
        setMorningSummaryEnabled(profile.morning_summary_enabled ?? true)
        setMorningSummaryTime(profile.morning_summary_time || '07:30')
        setEventRemindersEnabled(profile.event_reminders_enabled ?? true)
        setDefaultReminderMinutes(profile.default_reminder_minutes || 30)
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      setPermissionError('')

      let isEnabled = notificationsEnabled
      
      // If toggling on, request permission and subscribe
      if (isEnabled) {
        const permission = await requestNotificationPermission()
        if (permission !== 'granted') {
          setPermissionError('Notification permission denied by browser. Please enable in site settings.')
          isEnabled = false
          setNotificationsEnabled(false)
        } else {
          // Subscribe using VAPID key
          const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
          if (!vapidKey) throw new Error('VITE_VAPID_PUBLIC_KEY is not defined in environment')
          await subscribeToPushNotifications(vapidKey)
        }
      }

      // Automatically detect and save the user's current timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      await updateNotificationPreferences({
        notifications_enabled: isEnabled,
        morning_summary_enabled: morningSummaryEnabled,
        morning_summary_time: morningSummaryTime,
        event_reminders_enabled: eventRemindersEnabled,
        default_reminder_minutes: defaultReminderMinutes,
        timezone
      })
      
      setIsSaving(false)
    } catch (err: any) {
      console.error(err)
      setPermissionError(err.message || 'Failed to update notification settings')
      setIsSaving(false)
    }
  }

  const sectionHeader = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-2 p-4 border-b border-[#F3F7F3] bg-[#F3F7F3]">
      <span className="text-[#718078]">{icon}</span>
      <h2 className="font-bold text-sm text-[#26352E]">{label}</h2>
    </div>
  )

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in pb-24">
      <div className="pb-4 border-b border-[#E8F0EA]">
        <h1 className="text-2xl font-black text-[#26352E] tracking-tight">Settings</h1>
        <p className="text-sm text-[#718078] mt-0.5">Account, notifications, appearance & about</p>
      </div>

      {/* PWA Install Instructions for iOS */}
      {isIos && !isStandalone && (
        <div className="bg-[#315C4A]/10 border border-[#315C4A]/20 rounded-2xl overflow-hidden p-5 flex items-start gap-3">
          <div className="text-[#315C4A] mt-0.5"><Smartphone size={20} /></div>
          <div>
            <h3 className="text-sm font-bold text-[#26352E]">Install App on iPhone</h3>
            <p className="text-xs text-[#718078] mt-1 leading-relaxed">
              For the best experience and to enable push notifications on iOS, install Viv to your Home Screen:
              <br/><br/>
              Tap <b>Share</b> in Safari, then tap <b>Add to Home Screen</b> <span className="inline-block border border-gray-300 rounded p-0.5 bg-white shadow-sm ml-1 text-[10px]">➕</span>
            </p>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-[#E8F0EA] overflow-hidden">
        {sectionHeader(<Bell size={16} />, 'Notifications & Reminders')}
        <div className="p-5 space-y-6">
          {loading ? (
            <div className="text-sm text-[#718078]">Loading settings...</div>
          ) : (
            <>
              {permissionError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
                  {permissionError}
                </div>
              )}

              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#26352E]">Enable Push Notifications</div>
                  <div className="text-xs text-[#718078] mt-0.5">Receive reminders directly on your device.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${notificationsEnabled ? 'bg-[#315C4A]' : 'bg-[#E8F0EA]'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {notificationsEnabled && (
                <div className="space-y-5 pt-4 border-t border-[#F3F7F3] animate-fade-in">
                  
                  {/* Morning Summary */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-[#26352E]">Morning Summary</div>
                      <input 
                        type="checkbox" 
                        checked={morningSummaryEnabled} 
                        onChange={e => setMorningSummaryEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                    {morningSummaryEnabled && (
                      <div className="flex items-center justify-between pl-4 border-l-2 border-[#E8F0EA]">
                        <div className="text-xs text-[#718078]">Summary time</div>
                        <input 
                          type="time" 
                          value={morningSummaryTime}
                          onChange={e => setMorningSummaryTime(e.target.value)}
                          className="px-2 py-1 text-xs border border-[#E8F0EA] rounded-lg bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Event Reminders */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-[#26352E]">Event Reminders</div>
                      <input 
                        type="checkbox" 
                        checked={eventRemindersEnabled} 
                        onChange={e => setEventRemindersEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                    {eventRemindersEnabled && (
                      <div className="flex items-center justify-between pl-4 border-l-2 border-[#E8F0EA]">
                        <div className="text-xs text-[#718078]">Default reminder</div>
                        <select 
                          value={defaultReminderMinutes}
                          onChange={e => setDefaultReminderMinutes(Number(e.target.value))}
                          className="px-2 py-1 text-xs border border-[#E8F0EA] rounded-lg bg-white"
                        >
                          <option value="5">5 minutes before</option>
                          <option value="15">15 minutes before</option>
                          <option value="30">30 minutes before</option>
                          <option value="60">1 hour before</option>
                          <option value="1440">1 day before</option>
                        </select>
                      </div>
                    )}
                  </div>

                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  onClick={handleSaveSettings} 
                  isLoading={isSaving}
                  className="bg-[#315C4A] text-white w-full border-none shadow-sm hover:bg-[#26352E]"
                >
                  Save Notification Settings
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-[#E8F0EA] overflow-hidden">
        {sectionHeader(<User size={16} />, 'Profile')}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#718078] uppercase tracking-wide mb-1">Display Name</label>
            <div className="text-sm font-semibold text-[#26352E]">
              {user?.user_metadata?.display_name || 'Not set'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#718078] uppercase tracking-wide mb-1">Email</label>
            <div className="text-sm text-[#26352E]">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl border border-[#E8F0EA] overflow-hidden">
        {sectionHeader(<Leaf size={16} />, 'Appearance')}
        <div className="p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[#26352E]">Color Theme</div>
            <div className="text-xs text-[#718078] mt-0.5">Sage Green — always light</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#F3F7F3] border border-[#E8F0EA]" title="Canvas" />
            <div className="w-5 h-5 rounded-full bg-[#718078]" title="Sage" />
            <div className="w-5 h-5 rounded-full bg-[#315C4A]" title="Bark" />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl border border-[#E8F0EA] overflow-hidden">
        {sectionHeader(<Info size={16} />, 'About')}
        <div className="p-5 space-y-3">
          {[
            ['Version',  '1.1.0 PWA'],
            ['Status',   'Phase 2 — Mobile & Notifications'],
            ['Theme',    'Sage Green System'],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-[#718078]">{key}</span>
              <span className="font-semibold text-[#26352E]">{val}</span>
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

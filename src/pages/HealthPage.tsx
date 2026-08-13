import { useState, useEffect, useCallback } from 'react'
import {
  Droplets, Apple, Dumbbell, Moon, Pill, Repeat, Plus, Check,
  AlertCircle, RefreshCw, Smartphone, Flame, Heart, HeartPulse
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Card } from '@/components/ui/Card'

import { HydrationModal }  from '@/components/forms/HydrationModal'
import { MealModal }       from '@/components/forms/MealModal'
import { WorkoutModal }    from '@/components/forms/WorkoutModal'
import { SleepModal }      from '@/components/forms/SleepModal'
import { SupplementModal } from '@/components/forms/SupplementModal'
import { HabitModal }      from '@/components/forms/HabitModal'

import { getTodayHydrationSummary }                                                           from '@/services/hydrationService'
import { getTodayNutritionSummary }                                                           from '@/services/nutritionService'
import { getWorkouts, toggleWorkoutComplete }                                                  from '@/services/workoutService'
import { getSleepLogs, type SleepLog }                                                        from '@/services/sleepService'
import { getSupplements, logSupplementIntake, getTodaySupplementLogs, type SupplementLog }    from '@/services/supplementService'
import { getHabits, toggleHabitCompletion, getTodayHabitCompletions, type Habit, type HabitCompletion } from '@/services/habitService'
import type { Meal, Workout, Supplement } from '@/types'

// ─── Premium Sage & White Palette Colors ─────────────────────────────────────
// Deep Botanical Green   : #315C4A
// Sage                   : #A8BDAF
// Light Sage             : #E8F0EA
// Very Light Sage        : #F3F7F3
// Warm Ivory             : #FFFFFF
// White                  : #FFFFFF
// Dark Green-Charcoal    : #26352E
// Muted Green-Gray       : #718078
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'dashboard' | 'hydration' | 'nutrition' | 'training' | 'sleep' | 'supplements' | 'habits'

const TAB_ACTIVE   = 'bg-[#315C4A] text-white border-[#315C4A]'
const TAB_INACTIVE = 'bg-white text-[#718078] hover:bg-[#E8F0EA] border-[#E8F0EA]'

export function HealthPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  // Data states
  const [hydrationSummary, setHydrationSummary]   = useState<{ currentTotalOz: number; targetOz: number; percentage: number } | null>(null)
  const [nutritionSummary, setNutritionSummary]   = useState<{ calories: number; protein: number; carbohydrates: number; fat: number; meals: Meal[] } | null>(null)
  const [workouts, setWorkouts]                   = useState<Workout[]>([])
  const [sleepLogs, setSleepLogs]                 = useState<SleepLog[]>([])
  const [supplements, setSupplements]             = useState<Supplement[]>([])
  const [supplementLogs, setSupplementLogs]       = useState<SupplementLog[]>([])
  const [habits, setHabits]                       = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions]   = useState<HabitCompletion[]>([])

  // Apple Health connection states
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>('2 mins ago')
  const [syncSleep, setSyncSleep] = useState(true)
  const [syncWorkouts, setSyncWorkouts] = useState(true)
  const [syncCalories, setSyncCalories] = useState(true)
  const [syncHeartRate, setSyncHeartRate] = useState(true)

  // Heart Rate stats
  const [restingHeartRate] = useState(58)
  const [avgHeartRate] = useState(72)

  // Modals
  const [isHydrationModalOpen,  setIsHydrationModalOpen]  = useState(false)
  const [isMealModalOpen,       setIsMealModalOpen]        = useState(false)
  const [isWorkoutModalOpen,    setIsWorkoutModalOpen]     = useState(false)
  const [isSleepModalOpen,      setIsSleepModalOpen]       = useState(false)
  const [isSupplementModalOpen, setIsSupplementModalOpen]  = useState(false)
  const [isHabitModalOpen,      setIsHabitModalOpen]       = useState(false)

  const loadHealthData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [hyd, nut, wrk, slp, sup, supLogs, hab, habComps] = await Promise.all([
        getTodayHydrationSummary(), getTodayNutritionSummary(), getWorkouts(),
        getSleepLogs(), getSupplements(), getTodaySupplementLogs(), getHabits(), getTodayHabitCompletions(),
      ])
      setHydrationSummary(hyd); setNutritionSummary(nut); setWorkouts(wrk); setSleepLogs(slp)
      setSupplements(sup); setSupplementLogs(supLogs); setHabits(hab); setHabitCompletions(habComps)
    } catch (err) {
      console.error('Error loading health data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadHealthData() }, [loadHealthData])

  const handleSupplementToggle = async (suppId: string) => { await logSupplementIntake(suppId, 'taken'); loadHealthData() }
  const handleHabitToggle      = async (habitId: string, currentCompleted: boolean) => { await toggleHabitCompletion(habitId, !currentCompleted); loadHealthData() }
  const handleWorkoutToggle    = async (workout: Workout) => { await toggleWorkoutComplete(workout.id, !workout.completed); loadHealthData() }

  // Trigger Apple Health Sync
  const handleSyncWatch = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      const now = new Date()
      setLastSyncTime(`${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`)
    }, 1500)
  }

  const tabs = [
    { id: 'dashboard',    label: 'Dashboard',    icon: HeartPulse },
    { id: 'hydration',    label: 'Hydration',    icon: Droplets },
    { id: 'nutrition',    label: 'Nutrition',     icon: Apple    },
    { id: 'training',     label: 'Training',      icon: Dumbbell },
    { id: 'sleep',        label: 'Sleep',         icon: Moon     },
    { id: 'supplements',  label: 'Supplements',   icon: Pill     },
    { id: 'habits',       label: 'Habits',        icon: Repeat   },
  ] as const



  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E8F0EA]">
        <div>
          <h1 className="text-2xl font-black text-[#26352E] tracking-tight">Your Wellness</h1>
          <p className="text-sm text-[#718078] mt-0.5">Sleep quality, macros, movement capacity & watch sync</p>
        </div>
        <div>
          {activeTab === 'hydration'   && <Button variant="secondary" onClick={() => setIsHydrationModalOpen(true)}  icon={<Plus size={16}/>} className="bg-[#315C4A] hover:bg-[#26352E] text-white">Log Water</Button>}
          {activeTab === 'nutrition'   && <Button variant="secondary" onClick={() => setIsMealModalOpen(true)}        icon={<Plus size={16}/>} className="bg-[#315C4A] hover:bg-[#26352E] text-white">Log Meal</Button>}
          {activeTab === 'training'    && <Button variant="secondary" onClick={() => setIsWorkoutModalOpen(true)}     icon={<Plus size={16}/>} className="bg-[#315C4A] hover:bg-[#26352E] text-white">Log Workout</Button>}
          {activeTab === 'sleep'       && <Button variant="secondary" onClick={() => setIsSleepModalOpen(true)}       icon={<Plus size={16}/>} className="bg-[#315C4A] hover:bg-[#26352E] text-white">Log Sleep</Button>}
          {activeTab === 'supplements' && <Button variant="secondary" onClick={() => setIsSupplementModalOpen(true)}  icon={<Plus size={16}/>} className="bg-[#315C4A] hover:bg-[#26352E] text-white">Add Supplement</Button>}
          {activeTab === 'habits'      && <Button variant="secondary" onClick={() => setIsHabitModalOpen(true)}       icon={<Plus size={16}/>} className="bg-[#315C4A] hover:bg-[#26352E] text-white">Add Habit</Button>}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${activeTab === tab.id ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#718078] text-sm">Loading health data…</div>
      ) : (
        <>
          {/* TAB 0: UNIFIED HEALTH DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Column 1 & 2: Main rings, sleep stages, calories breakdown */}
              <div className="lg:col-span-2 space-y-6">

                {/* Apple Watch Rings section */}
                <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#718078] uppercase tracking-widest">Apple Health Activity</p>
                    <h3 className="text-lg font-black text-[#26352E]">Daily Activity Rings</h3>
                    <div className="space-y-1 text-xs text-[#718078] font-medium">
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#315C4A]" /> Move: 420 / 600 kcal</div>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#A8BDAF]" /> Exercise: 25 / 30 min</div>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E8F0EA]" /> Stand: 9 / 12 hours</div>
                    </div>
                  </div>

                  {/* Concentric rings SVG */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Move outer ring */}
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#F3F7F3" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#315C4A" strokeWidth="2.5" strokeDasharray="70 100" />

                      {/* Exercise middle ring */}
                      <circle cx="18" cy="18" r="12" fill="none" stroke="#F3F7F3" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="12" fill="none" stroke="#A8BDAF" strokeWidth="2.5" strokeDasharray="83 100" />

                      {/* Stand inner ring */}
                      <circle cx="18" cy="18" r="8" fill="none" stroke="#F3F7F3" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="8" fill="none" stroke="#E8F0EA" strokeWidth="2.5" strokeDasharray="75 100" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[#315C4A]">
                      <Flame size={18} fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Sleep stage breakdown */}
                <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#26352E]">Apple Health Sleep Architecture</h3>
                    <span className="text-[10px] font-bold bg-[#E8F0EA] text-[#315C4A] px-2.5 py-0.5 rounded-full">
                      ★ 84/100 Quality
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Deep Sleep', value: '1h 24m', color: 'bg-[#315C4A] text-white' },
                      { label: 'REM Sleep',  value: '2h 10m', color: 'bg-[#A8BDAF] text-[#26352E]' },
                      { label: 'Light Sleep', value: '4h 05m', color: 'bg-[#E8F0EA] text-[#315C4A]' },
                      { label: 'Awake Time',  value: '0h 25m', color: 'bg-[#F3F7F3] text-[#718078]' }
                    ].map(stage => (
                      <div key={stage.label} className={`p-3 rounded-xl border border-[#E8F0EA] ${stage.color}`}>
                        <div className="text-[9px] font-bold uppercase tracking-wide opacity-80">{stage.label}</div>
                        <div className="text-sm font-black mt-1">{stage.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-[#718078]">
                      <span>Sleep Target Progress (7.8 Hours actual / 8.0 Hours goal)</span>
                      <span className="font-bold text-[#315C4A]">97%</span>
                    </div>
                    <ProgressBar value={97} />
                  </div>
                </div>

                {/* Calories vs Active Burn */}
                <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-[#26352E]">Calories & Nutrition Target</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F3F7F3] rounded-2xl p-4 flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-[#718078] uppercase tracking-wide">Intake Target</span>
                      <h4 className="text-2xl font-black text-[#26352E] mt-1">{nutritionSummary?.calories ?? 0} kcal</h4>
                      <p className="text-[10px] text-[#718078] mt-2">Logged meals count: {nutritionSummary?.meals?.length ?? 0}</p>
                    </div>
                    <div className="bg-[#E8F0EA]/40 rounded-2xl p-4 flex flex-col justify-between border border-[#A8BDAF]">
                      <span className="text-[9px] font-bold text-[#718078] uppercase tracking-wide">Active Energy Burned</span>
                      <h4 className="text-2xl font-black text-[#315C4A] mt-1">420 kcal</h4>
                      <p className="text-[10px] text-[#718078] mt-2">Syncing via Apple Health</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Apple Watch Sync panel, Heart rate */}
              <div className="space-y-6">

                {/* Apple Watch connection card */}
                <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#E8F0EA] text-[#315C4A] rounded-xl">
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#26352E]">Apple Health Link</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="text-[10px] text-[#718078] font-bold uppercase tracking-wider">
                          Health App Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#F3F7F3] pt-3.5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#718078]">Last Synced:</span>
                      <span className="font-semibold text-[#26352E]">{lastSyncTime}</span>
                    </div>

                    {/* Sync option toggles */}
                    <div className="space-y-2 pt-2">
                      {[
                        { label: 'Auto-Sync Sleep Data', state: syncSleep, set: setSyncSleep },
                        { label: 'Import Workouts automatically', state: syncWorkouts, set: setSyncWorkouts },
                        { label: 'Sync Active Calories', state: syncCalories, set: setSyncCalories },
                        { label: 'Heart Rate Stream', state: syncHeartRate, set: setSyncHeartRate }
                      ].map(toggle => (
                        <div key={toggle.label} className="flex justify-between items-center text-xs">
                          <span className="text-[#718078]">{toggle.label}</span>
                          <button
                            onClick={() => toggle.set(!toggle.state)}
                            className={`w-8 h-4 rounded-full transition-colors relative ${toggle.state ? 'bg-[#315C4A]' : 'bg-[#E8F0EA]'}`}
                          >
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${toggle.state ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSyncWatch}
                    disabled={isSyncing}
                    className="w-full py-2.5 rounded-xl border border-[#A8BDAF] bg-[#E8F0EA] hover:bg-[#A8BDAF]/30 text-[#315C4A] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Syncing...' : 'Sync Apple Health Now'}
                  </button>
                </div>

                {/* Heart rate monitor card */}
                <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#26352E]">Apple Health Heart Rate</h3>
                    <Heart size={16} className="text-[#315C4A] animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-[#F3F7F3] rounded-xl">
                      <span className="text-[9px] font-bold text-[#718078] uppercase">Resting HR</span>
                      <div className="text-lg font-black text-[#26352E] mt-0.5">{restingHeartRate} bpm</div>
                    </div>
                    <div className="p-3 bg-[#F3F7F3] rounded-xl">
                      <span className="text-[9px] font-bold text-[#718078] uppercase">Daily Average</span>
                      <div className="text-lg font-black text-[#315C4A] mt-0.5">{avgHeartRate} bpm</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#718078] text-center font-medium leading-relaxed bg-[#F3F7F3] p-2.5 rounded-xl">
                    Heart rate variability (HRV) syncs every morning to compute your focus capacity score.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: HYDRATION */}
          {activeTab === 'hydration' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Daily Water Target</h3>
                  <span className="text-sm font-bold text-[#315C4A]">
                    {hydrationSummary?.currentTotalOz ?? 0} / {hydrationSummary?.targetOz ?? 128} oz
                  </span>
                </div>

                <ProgressBar value={hydrationSummary?.percentage ?? 0} />

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setIsHydrationModalOpen(true)}
                    icon={<Plus size={18} />}
                    className="bg-[#315C4A] hover:bg-[#26352E] text-white"
                  >
                    Quick Log Water (+8 / +16 oz)
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: NUTRITION */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4 text-center">
                  <div className="text-xs text-gray-500">Calories</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    {nutritionSummary?.calories ?? 0} kcal
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-gray-500">Protein</div>
                  <div className="text-xl font-bold text-[#315C4A] mt-1">
                    {nutritionSummary?.protein ?? 0} g
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-gray-500">Carbs</div>
                  <div className="text-xl font-bold text-amber-900 mt-1">
                    {nutritionSummary?.carbohydrates ?? 0} g
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-gray-500">Fat</div>
                  <div className="text-xl font-bold text-amber-700 mt-1">
                    {nutritionSummary?.fat ?? 0} g
                  </div>
                </Card>
              </div>

              {nutritionSummary?.meals && nutritionSummary.meals.length > 0 ? (
                <div className="space-y-2">
                  {nutritionSummary.meals.map((meal) => (
                    <Card key={meal.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#315C4A]">
                          {meal.meal_type}
                        </span>
                        <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        {meal.calories ? `${meal.calories} kcal` : ''}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No meals logged today.</Card>
              )}
            </div>
          )}

          {/* TAB 3: TRAINING */}
          {activeTab === 'training' && (
            <div className="space-y-4">
              {workouts.length > 0 ? (
                <div className="space-y-3">
                  {workouts.map((w) => (
                    <Card key={w.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{w.title}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-[#315C4A]">
                            {w.workout_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {w.duration_minutes ? `${w.duration_minutes} mins` : ''} · Intensity: {w.intensity ?? 'medium'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleWorkoutToggle(w)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                          w.completed ? 'bg-[#315C4A] text-white border-[#315C4A]' : 'border-gray-300'
                        }`}
                      >
                        {w.completed && <Check size={14} />}
                      </button>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No workouts logged yet.</Card>
              )}
            </div>
          )}

          {/* TAB 4: SLEEP */}
          {activeTab === 'sleep' && (
            <div className="space-y-4">
              {sleepLogs.length > 0 ? (
                <div className="space-y-3">
                  {sleepLogs.map((s: SleepLog) => (
                    <Card key={s.id} className="p-4">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {((s.duration_minutes ?? 0) / 60).toFixed(1)} Hours Sleep
                        </h4>
                        <span className="text-xs font-bold text-[#315C4A]">
                          ★ {s.sleep_quality} / 5 Quality
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(s.sleep_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.sleep_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No sleep logs recorded.</Card>
              )}
            </div>
          )}

          {/* TAB 5: SUPPLEMENTS */}
          {activeTab === 'supplements' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-[#315C4A]">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Informational Notice:</strong> Supplement logging is for tracking and reminder purposes only. Personal OS does not offer medical advice or diagnostic evaluation.
                </span>
              </div>

              {supplements.length > 0 ? (
                <div className="space-y-3">
                  {supplements.map((supp: Supplement) => {
                    const isTakenToday = supplementLogs.some((l: SupplementLog) => l.supplement_id === supp.id && l.status === 'taken')

                    return (
                      <Card key={supp.id} className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{supp.name}</h4>
                          <p className="text-xs text-gray-500">
                            {supp.amount} {supp.unit} · {supp.frequency} {supp.with_food ? '(With food)' : ''}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSupplementToggle(supp.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            isTakenToday
                              ? 'bg-[#315C4A] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-[#F3F7F3]'
                          }`}
                        >
                          {isTakenToday ? <Check size={14} /> : null}
                          {isTakenToday ? 'Taken Today' : 'Mark Taken'}
                        </button>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No active supplement trackers.</Card>
              )}
            </div>
          )}

          {/* TAB 6: HABITS */}
          {activeTab === 'habits' && (
            <div className="space-y-4">
              {habits.length > 0 ? (
                <div className="space-y-3">
                  {habits.map((habit: Habit) => {
                    const isCompleted = habitCompletions.some((c: HabitCompletion) => c.habit_id === habit.id)

                    return (
                      <Card key={habit.id} className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{habit.title}</h4>
                          <p className="text-xs text-gray-500">{habit.category ?? 'Daily Habit'}</p>
                        </div>

                        <button
                          onClick={() => handleHabitToggle(habit.id, isCompleted)}
                          className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                            isCompleted ? 'bg-[#315C4A] border-[#315C4A] text-white' : 'border-gray-300'
                          }`}
                        >
                          {isCompleted && <Check size={16} />}
                        </button>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No active habits defined.</Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Creation Modals */}
      <HydrationModal isOpen={isHydrationModalOpen} onClose={() => setIsHydrationModalOpen(false)} onHydrationLogged={loadHealthData} />
      <MealModal isOpen={isMealModalOpen} onClose={() => setIsMealModalOpen(false)} onMealLogged={loadHealthData} />
      <WorkoutModal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} onWorkoutLogged={loadHealthData} />
      <SleepModal isOpen={isSleepModalOpen} onClose={() => setIsSleepModalOpen(false)} onSleepLogged={loadHealthData} />
      <SupplementModal isOpen={isSupplementModalOpen} onClose={() => setIsSupplementModalOpen(false)} onSupplementSaved={loadHealthData} />
      <HabitModal isOpen={isHabitModalOpen} onClose={() => setIsHabitModalOpen(false)} onHabitSaved={loadHealthData} />
    </div>
  )
}

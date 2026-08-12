import { useState, useEffect, useCallback } from 'react'
import { Droplets, Apple, Dumbbell, Moon, Pill, Repeat, Plus, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'

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

type TabId = 'hydration' | 'nutrition' | 'training' | 'sleep' | 'supplements' | 'habits'

const TAB_ACTIVE   = 'bg-[#5e6544] text-white border-[#5e6544]'
const TAB_INACTIVE = 'bg-white text-[#8c947d] hover:bg-[#dfe8db] border-[#c4cfbc]'

export function HealthPage() {
  const [activeTab, setActiveTab] = useState<TabId>('hydration')
  const [isLoading, setIsLoading] = useState(true)

  const [hydrationSummary, setHydrationSummary]   = useState<{ currentTotalOz: number; targetOz: number; percentage: number } | null>(null)
  const [nutritionSummary, setNutritionSummary]   = useState<{ calories: number; protein: number; carbohydrates: number; fat: number; meals: Meal[] } | null>(null)
  const [workouts, setWorkouts]                   = useState<Workout[]>([])
  const [sleepLogs, setSleepLogs]                 = useState<SleepLog[]>([])
  const [supplements, setSupplements]             = useState<Supplement[]>([])
  const [supplementLogs, setSupplementLogs]       = useState<SupplementLog[]>([])
  const [habits, setHabits]                       = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions]   = useState<HabitCompletion[]>([])

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

  const tabs = [
    { id: 'hydration',    label: 'Hydration',    icon: Droplets },
    { id: 'nutrition',    label: 'Nutrition',     icon: Apple    },
    { id: 'training',     label: 'Training',      icon: Dumbbell },
    { id: 'sleep',        label: 'Sleep',         icon: Moon     },
    { id: 'supplements',  label: 'Supplements',   icon: Pill     },
    { id: 'habits',       label: 'Habits',        icon: Repeat   },
  ] as const

  const cardEmpty = (msg: string) => (
    <div className="bg-white rounded-2xl border border-[#c4cfbc] p-8 text-center text-sm text-[#8c947d]">{msg}</div>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#c4cfbc]">
        <div>
          <h1 className="text-2xl font-black text-[#2e2f22] tracking-tight">Your Wellness</h1>
          <p className="text-sm text-[#8c947d] mt-0.5">Hydration, nutrition, movement, recovery & habits</p>
        </div>
        <div>
          {activeTab === 'hydration'   && <Button variant="secondary" onClick={() => setIsHydrationModalOpen(true)}  icon={<Plus size={16}/>}>Log Water</Button>}
          {activeTab === 'nutrition'   && <Button variant="secondary" onClick={() => setIsMealModalOpen(true)}        icon={<Plus size={16}/>}>Log Meal</Button>}
          {activeTab === 'training'    && <Button variant="secondary" onClick={() => setIsWorkoutModalOpen(true)}     icon={<Plus size={16}/>}>Log Workout</Button>}
          {activeTab === 'sleep'       && <Button variant="secondary" onClick={() => setIsSleepModalOpen(true)}       icon={<Plus size={16}/>}>Log Sleep</Button>}
          {activeTab === 'supplements' && <Button variant="secondary" onClick={() => setIsSupplementModalOpen(true)}  icon={<Plus size={16}/>}>Add Supplement</Button>}
          {activeTab === 'habits'      && <Button variant="secondary" onClick={() => setIsHabitModalOpen(true)}       icon={<Plus size={16}/>}>Add Habit</Button>}
        </div>
      </div>

      {/* Tab Nav */}
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
        <div className="text-center py-12 text-[#8c947d] text-sm">Loading wellness data…</div>
      ) : (
        <>
          {/* HYDRATION */}
          {activeTab === 'hydration' && (
            <div className="bg-white rounded-2xl border border-[#c4cfbc] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#2e2f22]">Daily Water Target</h3>
                <span className="text-sm font-bold text-[#5e6544]">
                  {hydrationSummary?.currentTotalOz ?? 0} / {hydrationSummary?.targetOz ?? 128} oz
                </span>
              </div>
              <ProgressBar value={hydrationSummary?.percentage ?? 0} />
              <div className="flex justify-center pt-2">
                <Button variant="secondary" onClick={() => setIsHydrationModalOpen(true)} icon={<Plus size={16}/>}>
                  Quick Log Water
                </Button>
              </div>
            </div>
          )}

          {/* NUTRITION */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Calories', value: `${nutritionSummary?.calories ?? 0} kcal`, color: 'text-[#2e2f22]' },
                  { label: 'Protein',  value: `${nutritionSummary?.protein ?? 0} g`,     color: 'text-[#5e6544]' },
                  { label: 'Carbs',    value: `${nutritionSummary?.carbohydrates ?? 0} g`,color: 'text-[#8c947d]' },
                  { label: 'Fat',      value: `${nutritionSummary?.fat ?? 0} g`,          color: 'text-[#8c947d]' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 text-center">
                    <div className="text-xs text-[#8c947d] font-semibold uppercase tracking-wide">{label}</div>
                    <div className={`text-xl font-black mt-1 ${color}`}>{value}</div>
                  </div>
                ))}
              </div>
              {nutritionSummary?.meals && nutritionSummary.meals.length > 0 ? (
                <div className="space-y-2">
                  {nutritionSummary.meals.map((meal) => (
                    <div key={meal.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c947d]">{meal.meal_type}</span>
                        <h4 className="font-semibold text-[#2e2f22]">{meal.name}</h4>
                      </div>
                      <div className="text-sm font-semibold text-[#5e6544]">{meal.calories ? `${meal.calories} kcal` : ''}</div>
                    </div>
                  ))}
                </div>
              ) : cardEmpty('No meals logged today.')}
            </div>
          )}

          {/* TRAINING */}
          {activeTab === 'training' && (
            <div className="space-y-3">
              {workouts.length > 0 ? workouts.map((w) => (
                <div key={w.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[#2e2f22]">{w.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#dfe8db] text-[#5e6544] border border-[#c4cfbc]">
                        {w.workout_type}
                      </span>
                    </div>
                    <p className="text-xs text-[#8c947d] mt-1">
                      {w.duration_minutes ? `${w.duration_minutes} mins` : ''} · Intensity: {w.intensity ?? 'medium'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleWorkoutToggle(w)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      w.completed ? 'bg-[#5e6544] border-[#5e6544] text-white' : 'border-[#c4cfbc] hover:border-[#8c947d]'
                    }`}
                  >
                    {w.completed && <Check size={13} />}
                  </button>
                </div>
              )) : cardEmpty('No workouts logged yet.')}
            </div>
          )}

          {/* SLEEP */}
          {activeTab === 'sleep' && (
            <div className="space-y-3">
              {sleepLogs.length > 0 ? sleepLogs.map((s: SleepLog) => (
                <div key={s.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-[#2e2f22]">{((s.duration_minutes ?? 0) / 60).toFixed(1)} Hours Sleep</h4>
                    <span className="text-xs font-bold text-[#5e6544]">★ {s.sleep_quality} / 5 Quality</span>
                  </div>
                  <p className="text-xs text-[#8c947d]">
                    {new Date(s.sleep_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(s.sleep_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )) : cardEmpty('No sleep logs recorded.')}
            </div>
          )}

          {/* SUPPLEMENTS */}
          {activeTab === 'supplements' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#dfe8db] border border-[#c4cfbc] rounded-xl flex items-start gap-2 text-xs text-[#5e6544]">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-[#8c947d]" />
                <span><strong>Informational Notice:</strong> Supplement logging is for tracking and reminder purposes only. Personal OS does not offer medical advice.</span>
              </div>
              {supplements.length > 0 ? (
                <div className="space-y-3">
                  {supplements.map((supp: Supplement) => {
                    const isTaken = supplementLogs.some((l: SupplementLog) => l.supplement_id === supp.id && l.status === 'taken')
                    return (
                      <div key={supp.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-[#2e2f22]">{supp.name}</h4>
                          <p className="text-xs text-[#8c947d]">{supp.amount} {supp.unit} · {supp.frequency}{supp.with_food ? ' (with food)' : ''}</p>
                        </div>
                        <button
                          onClick={() => handleSupplementToggle(supp.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            isTaken ? 'bg-[#5e6544] text-white' : 'bg-[#dfe8db] text-[#5e6544] hover:bg-[#c4cfbc]'
                          }`}
                        >
                          {isTaken && <Check size={13} />}
                          {isTaken ? 'Taken' : 'Mark Taken'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : cardEmpty('No active supplement trackers.')}
            </div>
          )}

          {/* HABITS */}
          {activeTab === 'habits' && (
            <div className="space-y-3">
              {habits.length > 0 ? habits.map((habit: Habit) => {
                const isCompleted = habitCompletions.some((c: HabitCompletion) => c.habit_id === habit.id)
                return (
                  <div key={habit.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#2e2f22]">{habit.title}</h4>
                      <p className="text-xs text-[#8c947d]">{habit.category ?? 'Daily Habit'}</p>
                    </div>
                    <button
                      onClick={() => handleHabitToggle(habit.id, isCompleted)}
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                        isCompleted ? 'bg-[#5e6544] border-[#5e6544] text-white' : 'border-[#c4cfbc] hover:border-[#8c947d]'
                      }`}
                    >
                      {isCompleted && <Check size={15} />}
                    </button>
                  </div>
                )
              }) : cardEmpty('No active habits defined.')}
            </div>
          )}
        </>
      )}

      <HydrationModal  isOpen={isHydrationModalOpen}  onClose={() => setIsHydrationModalOpen(false)}  onHydrationLogged={loadHealthData} />
      <MealModal       isOpen={isMealModalOpen}        onClose={() => setIsMealModalOpen(false)}        onMealLogged={loadHealthData} />
      <WorkoutModal    isOpen={isWorkoutModalOpen}     onClose={() => setIsWorkoutModalOpen(false)}     onWorkoutLogged={loadHealthData} />
      <SleepModal      isOpen={isSleepModalOpen}       onClose={() => setIsSleepModalOpen(false)}       onSleepLogged={loadHealthData} />
      <SupplementModal isOpen={isSupplementModalOpen}  onClose={() => setIsSupplementModalOpen(false)}  onSupplementSaved={loadHealthData} />
      <HabitModal      isOpen={isHabitModalOpen}       onClose={() => setIsHabitModalOpen(false)}       onHabitSaved={loadHealthData} />
    </div>
  )
}

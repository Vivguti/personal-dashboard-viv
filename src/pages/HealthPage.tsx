import { useState, useEffect, useCallback } from 'react'
import { Droplets, Apple, Dumbbell, Moon, Pill, Repeat, Plus, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'

import { HydrationModal } from '@/components/forms/HydrationModal'
import { MealModal } from '@/components/forms/MealModal'
import { WorkoutModal } from '@/components/forms/WorkoutModal'
import { SleepModal } from '@/components/forms/SleepModal'
import { SupplementModal } from '@/components/forms/SupplementModal'
import { HabitModal } from '@/components/forms/HabitModal'

import { getTodayHydrationSummary } from '@/services/hydrationService'
import { getTodayNutritionSummary } from '@/services/nutritionService'
import { getWorkouts, toggleWorkoutComplete } from '@/services/workoutService'
import { getSleepLogs, type SleepLog } from '@/services/sleepService'
import { getSupplements, logSupplementIntake, getTodaySupplementLogs, type SupplementLog } from '@/services/supplementService'
import { getHabits, toggleHabitCompletion, getTodayHabitCompletions, type Habit, type HabitCompletion } from '@/services/habitService'
import type { Meal, Workout, Supplement } from '@/types'

type TabId = 'hydration' | 'nutrition' | 'training' | 'sleep' | 'supplements' | 'habits'

export function HealthPage() {
  const [activeTab, setActiveTab] = useState<TabId>('hydration')
  const [isLoading, setIsLoading] = useState(true)

  // Data states
  const [hydrationSummary, setHydrationSummary] = useState<{ currentTotalOz: number; targetOz: number; percentage: number } | null>(null)
  const [nutritionSummary, setNutritionSummary] = useState<{ calories: number; protein: number; carbohydrates: number; fat: number; meals: Meal[] } | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([])
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [supplementLogs, setSupplementLogs] = useState<SupplementLog[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([])

  // Modal states
  const [isHydrationModalOpen, setIsHydrationModalOpen] = useState(false)
  const [isMealModalOpen, setIsMealModalOpen] = useState(false)
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false)
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false)
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false)

  const loadHealthData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [hyd, nut, wrk, slp, sup, supLogs, hab, habComps] = await Promise.all([
        getTodayHydrationSummary(),
        getTodayNutritionSummary(),
        getWorkouts(),
        getSleepLogs(),
        getSupplements(),
        getTodaySupplementLogs(),
        getHabits(),
        getTodayHabitCompletions(),
      ])

      setHydrationSummary(hyd)
      setNutritionSummary(nut)
      setWorkouts(wrk)
      setSleepLogs(slp)
      setSupplements(sup)
      setSupplementLogs(supLogs)
      setHabits(hab)
      setHabitCompletions(habComps)
    } catch (err) {
      console.error('Error loading health data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHealthData()
  }, [loadHealthData])

  const handleSupplementToggle = async (suppId: string) => {
    await logSupplementIntake(suppId, 'taken')
    loadHealthData()
  }

  const handleHabitToggle = async (habitId: string, currentCompleted: boolean) => {
    await toggleHabitCompletion(habitId, !currentCompleted)
    loadHealthData()
  }

  const handleWorkoutToggle = async (workout: Workout) => {
    await toggleWorkoutComplete(workout.id, !workout.completed)
    loadHealthData()
  }

  const tabs = [
    { id: 'hydration', label: 'Hydration', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/40' },
    { id: 'training', label: 'Training', icon: Dumbbell, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 'supplements', label: 'Supplements', icon: Pill, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40' },
    { id: 'habits', label: 'Habits', icon: Repeat, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  ] as const

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Health & Recovery</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Daily logs, workouts, macros, sleep & supplements
          </p>
        </div>

        <div>
          {activeTab === 'hydration' && (
            <Button onClick={() => setIsHydrationModalOpen(true)} icon={<Plus size={18} />}>Log Water</Button>
          )}
          {activeTab === 'nutrition' && (
            <Button onClick={() => setIsMealModalOpen(true)} icon={<Plus size={18} />}>Log Meal</Button>
          )}
          {activeTab === 'training' && (
            <Button onClick={() => setIsWorkoutModalOpen(true)} icon={<Plus size={18} />}>Log Workout</Button>
          )}
          {activeTab === 'sleep' && (
            <Button onClick={() => setIsSleepModalOpen(true)} icon={<Plus size={18} />}>Log Sleep</Button>
          )}
          {activeTab === 'supplements' && (
            <Button onClick={() => setIsSupplementModalOpen(true)} icon={<Plus size={18} />}>Add Supplement</Button>
          )}
          {activeTab === 'habits' && (
            <Button onClick={() => setIsHabitModalOpen(true)} icon={<Plus size={18} />}>Create Habit</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading health data...</div>
      ) : (
        <>
          {/* TAB 1: HYDRATION */}
          {activeTab === 'hydration' && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Daily Water Target</h3>
                  <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400">
                    {hydrationSummary?.currentTotalOz ?? 0} / {hydrationSummary?.targetOz ?? 128} oz
                  </span>
                </div>

                <ProgressBar value={hydrationSummary?.percentage ?? 0} />

                <div className="mt-6 flex justify-center">
                  <Button onClick={() => setIsHydrationModalOpen(true)} icon={<Plus size={18} />}>
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
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {nutritionSummary?.calories ?? 0} kcal
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-gray-500">Protein</div>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    {nutritionSummary?.protein ?? 0} g
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-gray-500">Carbs</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {nutritionSummary?.carbohydrates ?? 0} g
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-xs text-gray-500">Fat</div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {nutritionSummary?.fat ?? 0} g
                  </div>
                </Card>
              </div>

              {nutritionSummary?.meals && nutritionSummary.meals.length > 0 ? (
                <div className="space-y-2">
                  {nutritionSummary.meals.map((meal) => (
                    <Card key={meal.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {meal.meal_type}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{meal.name}</h4>
                      </div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{w.title}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
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
                          w.completed ? 'bg-emerald-700 text-white border-emerald-700' : 'border-gray-300'
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
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {((s.duration_minutes ?? 0) / 60).toFixed(1)} Hours Sleep
                        </h4>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
              {/* Safety Disclaimer Banner */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
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
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{supp.name}</h4>
                          <p className="text-xs text-gray-500">
                            {supp.amount} {supp.unit} · {supp.frequency} {supp.with_food ? '(With food)' : ''}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSupplementToggle(supp.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            isTakenToday
                              ? 'bg-emerald-700 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'
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
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{habit.title}</h4>
                          <p className="text-xs text-gray-500">{habit.category ?? 'Daily Habit'}</p>
                        </div>

                        <button
                          onClick={() => handleHabitToggle(habit.id, isCompleted)}
                          className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                            isCompleted ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-gray-300'
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

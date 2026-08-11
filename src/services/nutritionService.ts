// ============================================
// Personal OS — Nutrition Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Meal, InsertTables } from '@/types'

export async function getTodayMeals(): Promise<Meal[]> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await (supabase
    .from('meals' as any) as any)
    .select('*')
    .gte('timestamp', startOfDay.toISOString())
    .lte('timestamp', endOfDay.toISOString())
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching meals:', error)
    return []
  }

  return (data ?? []) as Meal[]
}

export async function logMeal(
  meal: Omit<InsertTables<'meals'>, 'user_id'>
): Promise<Meal | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('meals' as any) as any)
    .insert({ ...meal, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error logging meal:', error)
    throw new Error(error.message)
  }

  return data as Meal
}

export async function deleteMeal(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('meals' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting meal:', error)
    return false
  }

  return true
}

export async function getTodayNutritionSummary() {
  const meals = await getTodayMeals()
  let calories = 0
  let protein = 0
  let carbohydrates = 0
  let fat = 0

  for (const m of meals) {
    calories += m.calories ?? 0
    protein += m.protein ?? 0
    carbohydrates += m.carbohydrates ?? 0
    fat += m.fat ?? 0
  }

  return {
    calories,
    protein: Math.round(protein),
    carbohydrates: Math.round(carbohydrates),
    fat: Math.round(fat),
    mealsCount: meals.length,
    meals,
  }
}

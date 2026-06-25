export interface Ingredient {
  id: number
  name: string
  unit: string
  kcal_per_100g: number
  protein_per_100g: number
  carb_per_100g: number
  fat_per_100g: number
  notes?: string
}

export interface MealIngredient {
  id: number
  ingredient_id: number
  raw_weight_g: number
  ingredient: Ingredient
}

export interface Meal {
  id: number
  name: string
  category?: string
  notes?: string
  ingredients: MealIngredient[]
  kcal: number
}

export interface FoodEntry {
  id: number
  meal_id: number
  meal_name: string
  portion_multiplier: number
  meal_time?: string
  workout_id?: number
  kcal: number
}

export interface Workout {
  id: number
  daily_log_id: number
  source: string
  activity_type?: string
  duration_min?: number
  distance_km?: number
  kcal_burned?: number
  notes?: string
}

export interface SportNutrition {
  id: number
  daily_log_id: number
  workout_id?: number
  product_name: string
  amount_g_or_ml: number
  kcal: number
  carb_g?: number
}

export interface Macros {
  protein_g: number
  carb_g: number
  fat_g: number
}

export interface DailySummary {
  date: string
  body_weight_kg?: number
  water_glasses: number
  goal_kcal_deficit?: number
  food_kcal: number
  sport_kcal: number
  burned_kcal: number
  bmr?: number
  net_kcal?: number
  macros: Macros
  food_entries: FoodEntry[]
  workouts: Workout[]
  sport_nutrition: SportNutrition[]
}

export interface UserProfile {
  id: number
  name?: string
  gender?: string
  height_cm?: number
  birth_date?: string
  goal_kcal_deficit?: number
}

export interface TrainerToken {
  id: number
  token: string
  label?: string
  active: boolean
  created_at: string
  last_accessed?: string
}

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export const MEAL_TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack']
export const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack']

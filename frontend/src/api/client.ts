import axios from 'axios'
import type {
  Ingredient, Meal, DailySummary, UserProfile,
  TrainerToken, Workout, SportNutrition, FoodEntry,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.PROD ? '' : 'http://localhost:8000',
})

// ─── Ingredients ──────────────────────────────────────────────────────────────
export const getIngredients = () =>
  api.get<Ingredient[]>('/api/ingredients').then(r => r.data)

export const createIngredient = (data: Omit<Ingredient, 'id'>) =>
  api.post<Ingredient>('/api/ingredients', data).then(r => r.data)

export const updateIngredient = (id: number, data: Partial<Ingredient>) =>
  api.put<Ingredient>(`/api/ingredients/${id}`, data).then(r => r.data)

export const deleteIngredient = (id: number) =>
  api.delete(`/api/ingredients/${id}`)

// ─── Meals ────────────────────────────────────────────────────────────────────
export const getMeals = () =>
  api.get<Meal[]>('/api/meals').then(r => r.data)

export const createMeal = (data: {
  name: string
  category?: string
  notes?: string
  ingredients: { ingredient_id: number; raw_weight_g: number }[]
}) => api.post<Meal>('/api/meals', data).then(r => r.data)

export const updateMeal = (id: number, data: {
  name?: string
  category?: string
  notes?: string
  ingredients?: { ingredient_id: number; raw_weight_g: number }[]
}) => api.put<Meal>(`/api/meals/${id}`, data).then(r => r.data)

export const deleteMeal = (id: number) =>
  api.delete(`/api/meals/${id}`)

// ─── Daily Log ────────────────────────────────────────────────────────────────
export const getDailySummary = (date: string) =>
  api.get<DailySummary>(`/api/daily-log/${date}/summary`).then(r => r.data)

export const updateDailyLog = (date: string, data: {
  body_weight_kg?: number
  water_glasses?: number
  notes?: string
}) => api.patch(`/api/daily-log/${date}`, data).then(r => r.data)

// ─── Food Entries ─────────────────────────────────────────────────────────────
export const addFoodEntry = (date: string, data: {
  meal_id: number
  portion_multiplier: number
  meal_time?: string
  workout_id?: number
}) => api.post<FoodEntry>(`/api/daily-log/${date}/food-entries`, data).then(r => r.data)

export const deleteFoodEntry = (id: number) =>
  api.delete(`/api/daily-log/food-entries/${id}`)

// ─── Workouts ─────────────────────────────────────────────────────────────────
export const addWorkout = (date: string, data: {
  source?: string
  activity_type?: string
  duration_min?: number
  distance_km?: number
  kcal_burned?: number
  notes?: string
}) => api.post<Workout>(`/api/daily-log/${date}/workouts`, data).then(r => r.data)

export const deleteWorkout = (id: number) =>
  api.delete(`/api/daily-log/workouts/${id}`)

// ─── Sport Nutrition ──────────────────────────────────────────────────────────
export const addSportNutrition = (date: string, data: {
  product_name: string
  amount_g_or_ml: number
  kcal: number
  carb_g?: number
  workout_id?: number
}) => api.post<SportNutrition>(`/api/daily-log/${date}/sport-nutrition`, data).then(r => r.data)

export const deleteSportNutrition = (id: number) =>
  api.delete(`/api/daily-log/sport-nutrition/${id}`)

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = () =>
  api.get<UserProfile>('/api/profile').then(r => r.data)

export const updateProfile = (data: Partial<UserProfile>) =>
  api.patch<UserProfile>('/api/profile', data).then(r => r.data)

// ─── Trainer Tokens ───────────────────────────────────────────────────────────
export const getTrainerTokens = () =>
  api.get<TrainerToken[]>('/api/trainer/tokens').then(r => r.data)

export const createTrainerToken = (label?: string) =>
  api.post<TrainerToken>('/api/trainer/tokens', { label }).then(r => r.data)

export const deactivateTrainerToken = (id: number) =>
  api.patch<TrainerToken>(`/api/trainer/tokens/${id}/deactivate`).then(r => r.data)

export const getTrainerView = (token: string) =>
  api.get(`/api/trainer/${token}`).then(r => r.data)

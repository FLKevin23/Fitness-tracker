from __future__ import annotations
import datetime
from typing import Optional, List
from pydantic import BaseModel


# ─── Ingredient ───────────────────────────────────────────────────────────────

class IngredientCreate(BaseModel):
    name: str
    unit: str = "g"
    grams_per_unit: float = 1.0
    kcal_per_100g: float
    protein_per_100g: float = 0.0
    carb_per_100g: float = 0.0
    fat_per_100g: float = 0.0
    notes: Optional[str] = None

class IngredientUpdate(IngredientCreate):
    name: Optional[str] = None
    kcal_per_100g: Optional[float] = None

class IngredientRead(IngredientCreate):
    id: int
    model_config = {"from_attributes": True}


# ─── Meal ─────────────────────────────────────────────────────────────────────

class MealIngredientCreate(BaseModel):
    ingredient_id: int
    raw_weight_g: float

class MealIngredientRead(BaseModel):
    id: int
    ingredient_id: int
    raw_weight_g: float
    ingredient: IngredientRead
    model_config = {"from_attributes": True}

class MealCreate(BaseModel):
    name: str
    category: Optional[str] = None
    notes: Optional[str] = None
    ingredients: List[MealIngredientCreate] = []

class MealUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    ingredients: Optional[List[MealIngredientCreate]] = None

class MealRead(BaseModel):
    id: int
    name: str
    category: Optional[str]
    notes: Optional[str]
    ingredients: List[MealIngredientRead]
    kcal: float = 0.0
    model_config = {"from_attributes": True}


# ─── Daily Log ────────────────────────────────────────────────────────────────

class DailyLogCreate(BaseModel):
    log_date: datetime.date
    body_weight_kg: Optional[float] = None
    water_glasses: int = 0
    notes: Optional[str] = None

class DailyLogUpdate(BaseModel):
    body_weight_kg: Optional[float] = None
    water_glasses: Optional[int] = None
    notes: Optional[str] = None

class DailyLogRead(BaseModel):
    id: int
    log_date: datetime.date
    body_weight_kg: Optional[float]
    water_glasses: int
    notes: Optional[str]
    model_config = {"from_attributes": True}


# ─── Food Entries ─────────────────────────────────────────────────────────────

class FoodEntryCreate(BaseModel):
    meal_id: int
    portion_multiplier: float = 1.0
    meal_time: Optional[str] = None
    workout_id: Optional[int] = None

class FoodEntryRead(BaseModel):
    id: int
    meal_id: int
    meal_name: str = ""
    portion_multiplier: float
    meal_time: Optional[str]
    workout_id: Optional[int]
    kcal: float = 0.0
    model_config = {"from_attributes": True}


# ─── Workout ──────────────────────────────────────────────────────────────────

class WorkoutCreate(BaseModel):
    source: str = "manual"
    activity_type: Optional[str] = None
    duration_min: Optional[int] = None
    distance_km: Optional[float] = None
    kcal_burned: Optional[int] = None
    notes: Optional[str] = None
    strava_activity_id: Optional[str] = None

class WorkoutRead(WorkoutCreate):
    id: int
    daily_log_id: int
    model_config = {"from_attributes": True}


# ─── Sport Nutrition ──────────────────────────────────────────────────────────

class SportNutritionCreate(BaseModel):
    product_name: str
    amount_g_or_ml: float
    kcal: int
    carb_g: Optional[int] = None
    workout_id: Optional[int] = None

class SportNutritionRead(SportNutritionCreate):
    id: int
    daily_log_id: int
    model_config = {"from_attributes": True}


# ─── User Profile ─────────────────────────────────────────────────────────────

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    birth_date: Optional[datetime.date] = None
    body_fat_percentage: Optional[float] = None
    activity_level: Optional[str] = None
    goal_kcal_deficit: Optional[float] = None

class UserProfileRead(BaseModel):
    id: int
    name: Optional[str]
    gender: Optional[str]
    height_cm: Optional[float]
    birth_date: Optional[datetime.date]
    body_fat_percentage: Optional[float]
    activity_level: Optional[str]
    goal_kcal_deficit: Optional[float]
    model_config = {"from_attributes": True}


# ─── Trainer Token ────────────────────────────────────────────────────────────

class TrainerTokenCreate(BaseModel):
    label: Optional[str] = None

class TrainerTokenRead(BaseModel):
    id: int
    token: str
    label: Optional[str]
    active: bool
    created_at: datetime.datetime
    last_accessed: Optional[datetime.datetime]
    model_config = {"from_attributes": True}


# ─── Daily Summary (computed) ─────────────────────────────────────────────────

class MacroRead(BaseModel):
    protein_g: float
    carb_g: float
    fat_g: float

class DailySummaryRead(BaseModel):
    date: datetime.date
    body_weight_kg: Optional[float]
    water_glasses: int
    goal_kcal_deficit: Optional[float]
    food_kcal: int
    sport_kcal: int
    burned_kcal: int
    bmr: Optional[int]
    tdee: Optional[int]
    net_kcal: Optional[int]
    macros: MacroRead
    food_entries: List[FoodEntryRead]
    workouts: List[WorkoutRead]
    sport_nutrition: List[SportNutritionRead]

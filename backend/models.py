import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    Date, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from database import Base


class UserProfile(Base):
    __tablename__ = "user_profile"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=True)
    gender = Column(String, nullable=True)          # "male" | "female"
    height_cm = Column(Float, nullable=True)
    birth_date = Column(Date, nullable=True)         # for age → BMR
    goal_kcal_deficit = Column(Float, default=500)
    strava_access_token = Column(String, nullable=True)
    strava_refresh_token = Column(String, nullable=True)
    strava_token_expiry = Column(DateTime, nullable=True)


class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    unit = Column(String, default="g")
    grams_per_unit = Column(Float, default=1.0)   # e.g. 1 Ei = 55g, 1 EL = 14g
    kcal_per_100g = Column(Float, nullable=False)
    protein_per_100g = Column(Float, default=0.0)
    carb_per_100g = Column(Float, default=0.0)
    fat_per_100g = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    meal_ingredients = relationship("MealIngredient", back_populates="ingredient")


class Meal(Base):
    __tablename__ = "meals"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=True)         # breakfast/lunch/dinner/snack
    notes = Column(Text, nullable=True)
    ingredients = relationship(
        "MealIngredient", back_populates="meal", cascade="all, delete-orphan"
    )
    food_entries = relationship("FoodEntry", back_populates="meal")


class MealIngredient(Base):
    __tablename__ = "meal_ingredients"
    id = Column(Integer, primary_key=True)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    raw_weight_g = Column(Float, nullable=False)
    meal = relationship("Meal", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="meal_ingredients")


class DailyLog(Base):
    __tablename__ = "daily_log"
    id = Column(Integer, primary_key=True)
    log_date = Column(Date, unique=True, nullable=False)
    body_weight_kg = Column(Float, nullable=True)
    water_glasses = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    food_entries = relationship(
        "FoodEntry", back_populates="daily_log", cascade="all, delete-orphan"
    )
    workouts = relationship(
        "Workout", back_populates="daily_log", cascade="all, delete-orphan"
    )
    sport_nutrition = relationship(
        "SportNutrition", back_populates="daily_log", cascade="all, delete-orphan"
    )


class FoodEntry(Base):
    __tablename__ = "food_entries"
    id = Column(Integer, primary_key=True)
    daily_log_id = Column(Integer, ForeignKey("daily_log.id"), nullable=False)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    portion_multiplier = Column(Float, default=1.0)
    meal_time = Column(String, nullable=True)        # breakfast/lunch/dinner/snack
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=True)
    daily_log = relationship("DailyLog", back_populates="food_entries")
    meal = relationship("Meal", back_populates="food_entries")
    workout = relationship("Workout", back_populates="food_entries")


class Workout(Base):
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True)
    daily_log_id = Column(Integer, ForeignKey("daily_log.id"), nullable=False)
    source = Column(String, default="manual")        # "strava" | "manual"
    strava_activity_id = Column(String, nullable=True)
    activity_type = Column(String, nullable=True)
    duration_min = Column(Integer, nullable=True)
    distance_km = Column(Float, nullable=True)
    kcal_burned = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    daily_log = relationship("DailyLog", back_populates="workouts")
    sport_nutrition = relationship("SportNutrition", back_populates="workout")
    food_entries = relationship("FoodEntry", back_populates="workout")


class SportNutrition(Base):
    __tablename__ = "sport_nutrition"
    id = Column(Integer, primary_key=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=True)
    daily_log_id = Column(Integer, ForeignKey("daily_log.id"), nullable=False)
    product_name = Column(String, nullable=False)
    amount_g_or_ml = Column(Float, nullable=False)
    kcal = Column(Integer, nullable=False)
    carb_g = Column(Integer, nullable=True)
    daily_log = relationship("DailyLog", back_populates="sport_nutrition")
    workout = relationship("Workout", back_populates="sport_nutrition")


class TrainerToken(Base):
    __tablename__ = "trainer_tokens"
    id = Column(Integer, primary_key=True)
    token = Column(String, unique=True, nullable=False)
    label = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_accessed = Column(DateTime, nullable=True)

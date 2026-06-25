import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from computed import meal_kcal

router = APIRouter(prefix="/api/daily-log", tags=["food-entries"])


@router.post("/{date}/food-entries", response_model=schemas.FoodEntryRead, status_code=201)
def add_food_entry(date: datetime.date, body: schemas.FoodEntryCreate, db: Session = Depends(get_db)):
    log = db.query(models.DailyLog).filter(models.DailyLog.log_date == date).first()
    if not log:
        log = models.DailyLog(log_date=date)
        db.add(log)
        db.flush()

    meal = db.get(models.Meal, body.meal_id)
    if not meal:
        raise HTTPException(404, "Meal not found")

    entry = models.FoodEntry(
        daily_log_id=log.id,
        meal_id=body.meal_id,
        portion_multiplier=body.portion_multiplier,
        meal_time=body.meal_time,
        workout_id=body.workout_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    base_kcal = meal_kcal(meal.ingredients)
    return schemas.FoodEntryRead(
        id=entry.id,
        meal_id=entry.meal_id,
        meal_name=meal.name,
        portion_multiplier=entry.portion_multiplier,
        meal_time=entry.meal_time,
        workout_id=entry.workout_id,
        kcal=round(base_kcal * entry.portion_multiplier, 1),
    )


@router.delete("/food-entries/{id}", status_code=204)
def delete_food_entry(id: int, db: Session = Depends(get_db)):
    entry = db.get(models.FoodEntry, id)
    if not entry:
        raise HTTPException(404, "Food entry not found")
    db.delete(entry)
    db.commit()

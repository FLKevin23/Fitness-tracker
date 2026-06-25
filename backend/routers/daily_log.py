import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from computed import daily_summary, meal_kcal

router = APIRouter(prefix="/api/daily-log", tags=["daily-log"])


def _get_or_create_log(date: datetime.date, db: Session) -> models.DailyLog:
    log = db.query(models.DailyLog).filter(models.DailyLog.log_date == date).first()
    if not log:
        log = models.DailyLog(log_date=date)
        db.add(log)
        db.commit()
        db.refresh(log)
    return log


@router.get("/{date}", response_model=schemas.DailyLogRead)
def get_log(date: datetime.date, db: Session = Depends(get_db)):
    return _get_or_create_log(date, db)


@router.patch("/{date}", response_model=schemas.DailyLogRead)
def update_log(date: datetime.date, body: schemas.DailyLogUpdate, db: Session = Depends(get_db)):
    log = _get_or_create_log(date, db)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(log, k, v)
    db.commit()
    db.refresh(log)
    return log


@router.get("/{date}/summary", response_model=schemas.DailySummaryRead)
def get_summary(date: datetime.date, db: Session = Depends(get_db)):
    log = _get_or_create_log(date, db)
    profile = db.query(models.UserProfile).first()
    computed = daily_summary(log, profile)

    food_entries_out = []
    for entry in log.food_entries:
        base_kcal = meal_kcal(entry.meal.ingredients)
        food_entries_out.append(schemas.FoodEntryRead(
            id=entry.id,
            meal_id=entry.meal_id,
            meal_name=entry.meal.name,
            portion_multiplier=entry.portion_multiplier,
            meal_time=entry.meal_time,
            workout_id=entry.workout_id,
            kcal=round(base_kcal * entry.portion_multiplier, 1),
        ))

    return schemas.DailySummaryRead(
        date=log.log_date,
        body_weight_kg=log.body_weight_kg,
        water_glasses=log.water_glasses,
        goal_kcal_deficit=profile.goal_kcal_deficit if profile else None,
        food_entries=food_entries_out,
        workouts=[schemas.WorkoutRead.model_validate(w) for w in log.workouts],
        sport_nutrition=[schemas.SportNutritionRead.model_validate(sn) for sn in log.sport_nutrition],
        **computed,
    )

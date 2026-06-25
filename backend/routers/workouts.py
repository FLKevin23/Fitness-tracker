import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/daily-log", tags=["workouts"])


@router.post("/{date}/workouts", response_model=schemas.WorkoutRead, status_code=201)
def add_workout(date: datetime.date, body: schemas.WorkoutCreate, db: Session = Depends(get_db)):
    log = db.query(models.DailyLog).filter(models.DailyLog.log_date == date).first()
    if not log:
        log = models.DailyLog(log_date=date)
        db.add(log)
        db.flush()

    workout = models.Workout(daily_log_id=log.id, **body.model_dump())
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.delete("/workouts/{id}", status_code=204)
def delete_workout(id: int, db: Session = Depends(get_db)):
    workout = db.get(models.Workout, id)
    if not workout:
        raise HTTPException(404, "Workout not found")
    db.delete(workout)
    db.commit()

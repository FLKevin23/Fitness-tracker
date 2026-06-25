import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/daily-log", tags=["sport-nutrition"])


@router.post("/{date}/sport-nutrition", response_model=schemas.SportNutritionRead, status_code=201)
def add_sport_nutrition(
    date: datetime.date, body: schemas.SportNutritionCreate, db: Session = Depends(get_db)
):
    log = db.query(models.DailyLog).filter(models.DailyLog.log_date == date).first()
    if not log:
        log = models.DailyLog(log_date=date)
        db.add(log)
        db.flush()

    sn = models.SportNutrition(daily_log_id=log.id, **body.model_dump())
    db.add(sn)
    db.commit()
    db.refresh(sn)
    return sn


@router.delete("/sport-nutrition/{id}", status_code=204)
def delete_sport_nutrition(id: int, db: Session = Depends(get_db)):
    sn = db.get(models.SportNutrition, id)
    if not sn:
        raise HTTPException(404, "Sport nutrition entry not found")
    db.delete(sn)
    db.commit()

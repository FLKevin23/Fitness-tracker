import secrets
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from computed import daily_summary, meal_kcal

router = APIRouter(prefix="/api/trainer", tags=["trainer"])


@router.get("/tokens", response_model=List[schemas.TrainerTokenRead])
def list_tokens(db: Session = Depends(get_db)):
    return db.query(models.TrainerToken).all()


@router.post("/tokens", response_model=schemas.TrainerTokenRead, status_code=201)
def create_token(body: schemas.TrainerTokenCreate, db: Session = Depends(get_db)):
    token = models.TrainerToken(
        token=secrets.token_urlsafe(20),
        label=body.label,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


@router.patch("/tokens/{id}/deactivate", response_model=schemas.TrainerTokenRead)
def deactivate_token(id: int, db: Session = Depends(get_db)):
    token = db.get(models.TrainerToken, id)
    if not token:
        raise HTTPException(404, "Token not found")
    token.active = False
    db.commit()
    db.refresh(token)
    return token


@router.get("/{token}")
def trainer_view(token: str, db: Session = Depends(get_db)):
    """Public endpoint — returns last 7 days summary for trainer."""
    tk = db.query(models.TrainerToken).filter(
        models.TrainerToken.token == token,
        models.TrainerToken.active == True,
    ).first()
    if not tk:
        raise HTTPException(403, "Invalid or inactive token")

    tk.last_accessed = datetime.datetime.utcnow()
    db.commit()

    profile = db.query(models.UserProfile).first()
    today = datetime.date.today()
    result = []
    for i in range(7):
        date = today - datetime.timedelta(days=i)
        log = db.query(models.DailyLog).filter(models.DailyLog.log_date == date).first()
        if not log:
            continue
        computed = daily_summary(log, profile)
        food_entries = []
        for entry in log.food_entries:
            base_kcal = meal_kcal(entry.meal.ingredients)
            food_entries.append({
                "meal_name": entry.meal.name,
                "meal_time": entry.meal_time,
                "portion_multiplier": entry.portion_multiplier,
                "kcal": round(base_kcal * entry.portion_multiplier, 1),
            })
        result.append({
            "date": date.isoformat(),
            "body_weight_kg": log.body_weight_kg,
            "water_glasses": log.water_glasses,
            "food_entries": food_entries,
            "workouts": [
                {
                    "activity_type": w.activity_type,
                    "duration_min": w.duration_min,
                    "distance_km": w.distance_km,
                    "kcal_burned": w.kcal_burned,
                }
                for w in log.workouts
            ],
            **computed,
        })
    return {"athlete": profile.name if profile else "Athlete", "days": result}

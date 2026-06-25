from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from computed import meal_kcal

router = APIRouter(prefix="/api/meals", tags=["meals"])


def _enrich(meal: models.Meal) -> schemas.MealRead:
    data = schemas.MealRead.model_validate(meal)
    data.kcal = round(meal_kcal(meal.ingredients), 1)
    return data


@router.get("", response_model=List[schemas.MealRead])
def list_meals(db: Session = Depends(get_db)):
    meals = db.query(models.Meal).order_by(models.Meal.name).all()
    return [_enrich(m) for m in meals]


@router.post("", response_model=schemas.MealRead, status_code=201)
def create_meal(body: schemas.MealCreate, db: Session = Depends(get_db)):
    meal = models.Meal(name=body.name, category=body.category, notes=body.notes)
    db.add(meal)
    db.flush()
    for mi in body.ingredients:
        db.add(models.MealIngredient(
            meal_id=meal.id,
            ingredient_id=mi.ingredient_id,
            raw_weight_g=mi.raw_weight_g,
        ))
    db.commit()
    db.refresh(meal)
    return _enrich(meal)


@router.get("/{id}", response_model=schemas.MealRead)
def get_meal(id: int, db: Session = Depends(get_db)):
    meal = db.get(models.Meal, id)
    if not meal:
        raise HTTPException(404, "Meal not found")
    return _enrich(meal)


@router.put("/{id}", response_model=schemas.MealRead)
def update_meal(id: int, body: schemas.MealUpdate, db: Session = Depends(get_db)):
    meal = db.get(models.Meal, id)
    if not meal:
        raise HTTPException(404, "Meal not found")
    if body.name is not None:
        meal.name = body.name
    if body.category is not None:
        meal.category = body.category
    if body.notes is not None:
        meal.notes = body.notes
    if body.ingredients is not None:
        for mi in meal.ingredients:
            db.delete(mi)
        db.flush()
        for mi in body.ingredients:
            db.add(models.MealIngredient(
                meal_id=meal.id,
                ingredient_id=mi.ingredient_id,
                raw_weight_g=mi.raw_weight_g,
            ))
    db.commit()
    db.refresh(meal)
    return _enrich(meal)


@router.delete("/{id}", status_code=204)
def delete_meal(id: int, db: Session = Depends(get_db)):
    meal = db.get(models.Meal, id)
    if not meal:
        raise HTTPException(404, "Meal not found")
    db.delete(meal)
    db.commit()

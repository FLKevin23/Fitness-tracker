from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])


@router.get("", response_model=List[schemas.IngredientRead])
def list_ingredients(db: Session = Depends(get_db)):
    return db.query(models.Ingredient).order_by(models.Ingredient.name).all()


@router.post("", response_model=schemas.IngredientRead, status_code=201)
def create_ingredient(body: schemas.IngredientCreate, db: Session = Depends(get_db)):
    ing = models.Ingredient(**body.model_dump())
    db.add(ing)
    db.commit()
    db.refresh(ing)
    return ing


@router.get("/{id}", response_model=schemas.IngredientRead)
def get_ingredient(id: int, db: Session = Depends(get_db)):
    ing = db.get(models.Ingredient, id)
    if not ing:
        raise HTTPException(404, "Ingredient not found")
    return ing


@router.put("/{id}", response_model=schemas.IngredientRead)
def update_ingredient(id: int, body: schemas.IngredientUpdate, db: Session = Depends(get_db)):
    ing = db.get(models.Ingredient, id)
    if not ing:
        raise HTTPException(404, "Ingredient not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(ing, k, v)
    db.commit()
    db.refresh(ing)
    return ing


@router.delete("/{id}", status_code=204)
def delete_ingredient(id: int, db: Session = Depends(get_db)):
    ing = db.get(models.Ingredient, id)
    if not ing:
        raise HTTPException(404, "Ingredient not found")
    db.delete(ing)
    db.commit()

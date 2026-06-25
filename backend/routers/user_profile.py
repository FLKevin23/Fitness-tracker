from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/profile", tags=["profile"])


def _get_or_create_profile(db: Session) -> models.UserProfile:
    profile = db.query(models.UserProfile).first()
    if not profile:
        profile = models.UserProfile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=schemas.UserProfileRead)
def get_profile(db: Session = Depends(get_db)):
    return _get_or_create_profile(db)


@router.patch("", response_model=schemas.UserProfileRead)
def update_profile(body: schemas.UserProfileUpdate, db: Session = Depends(get_db)):
    profile = _get_or_create_profile(db)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile

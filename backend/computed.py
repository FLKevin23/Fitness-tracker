import datetime
from typing import Optional


def calculate_age(birth_date: datetime.date) -> int:
    today = datetime.date.today()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


def calculate_bmr(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
) -> float:
    """Mifflin-St Jeor formula. Returns kcal/day."""
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    return base + 5 if gender.lower() == "male" else base - 161


def meal_kcal(meal_ingredients) -> float:
    return sum(
        mi.ingredient.kcal_per_100g * mi.raw_weight_g / 100
        for mi in meal_ingredients
    )


def meal_macros(meal_ingredients) -> dict:
    protein = carb = fat = 0.0
    for mi in meal_ingredients:
        protein += (mi.ingredient.protein_per_100g or 0) * mi.raw_weight_g / 100
        carb += (mi.ingredient.carb_per_100g or 0) * mi.raw_weight_g / 100
        fat += (mi.ingredient.fat_per_100g or 0) * mi.raw_weight_g / 100
    return {
        "protein_g": round(protein, 1),
        "carb_g": round(carb, 1),
        "fat_g": round(fat, 1),
    }


def daily_summary(daily_log, user_profile) -> dict:
    food_kcal = 0.0
    food_protein = food_carb = food_fat = 0.0

    for entry in daily_log.food_entries:
        m = entry.meal
        base_kcal = meal_kcal(m.ingredients)
        macros = meal_macros(m.ingredients)
        entry_kcal = base_kcal * entry.portion_multiplier
        food_kcal += entry_kcal
        food_protein += macros["protein_g"] * entry.portion_multiplier
        food_carb += macros["carb_g"] * entry.portion_multiplier
        food_fat += macros["fat_g"] * entry.portion_multiplier

    sport_kcal = sum(sn.kcal for sn in daily_log.sport_nutrition)
    burned_kcal = sum(w.kcal_burned or 0 for w in daily_log.workouts)

    bmr: Optional[float] = None
    if (
        user_profile
        and daily_log.body_weight_kg
        and user_profile.height_cm
        and user_profile.birth_date
        and user_profile.gender
    ):
        age = calculate_age(user_profile.birth_date)
        bmr = calculate_bmr(
            daily_log.body_weight_kg,
            user_profile.height_cm,
            age,
            user_profile.gender,
        )

    net_kcal: Optional[float] = None
    if bmr is not None:
        net_kcal = food_kcal + sport_kcal - burned_kcal - bmr

    return {
        "food_kcal": round(food_kcal),
        "sport_kcal": round(sport_kcal),
        "burned_kcal": round(burned_kcal),
        "bmr": round(bmr) if bmr else None,
        "net_kcal": round(net_kcal) if net_kcal is not None else None,
        "macros": {
            "protein_g": round(food_protein, 1),
            "carb_g": round(food_carb, 1),
            "fat_g": round(food_fat, 1),
        },
    }

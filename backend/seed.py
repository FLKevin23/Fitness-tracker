from database import SessionLocal
import models

# unit + grams_per_unit legend:
#   "g"  / 1.0  → entered and shown in grams
#   "ml" / 1.0  → entered and shown in millilitres
#   "Ei" / 55   → 1 egg ≈ 55 g (medium egg without shell)
#   "EL" / 14   → 1 Esslöffel (tablespoon) of oil ≈ 14 g
#   "EL" / 15   → 1 EL of water-based liquid ≈ 15 g

INGREDIENTS = [
    {"name": "Rostbraten",          "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 117,  "fat_per_100g": 3.5,   "carb_per_100g": 0.0,  "protein_per_100g": 21.6, "notes": "Beef shoulder/roast, raw"},
    {"name": "Schnitzel",           "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 111,  "fat_per_100g": 2.3,   "carb_per_100g": 0.0,  "protein_per_100g": 22.6, "notes": "Beef round, schnitzel, raw"},
    {"name": "Braten",              "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 117,  "fat_per_100g": 3.5,   "carb_per_100g": 0.0,  "protein_per_100g": 21.6, "notes": "Beef shoulder/roast, raw"},
    {"name": "Gulasch",             "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 150,  "fat_per_100g": 8.1,   "carb_per_100g": 0.0,  "protein_per_100g": 19.3, "notes": "Beef ragout/goulash, raw"},
    {"name": "Hackfleisch",         "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 208,  "fat_per_100g": 14.6,  "carb_per_100g": 0.0,  "protein_per_100g": 19.2, "notes": "Beef minced, raw"},
    {"name": "Suppenfleisch",       "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 132,  "fat_per_100g": 5.5,   "carb_per_100g": 0.0,  "protein_per_100g": 20.7, "notes": "Beef boiling meat lean, raw"},
    {"name": "Wienerli",            "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 242,  "fat_per_100g": 20.4,  "carb_per_100g": 0.6,  "protein_per_100g": 13.9, "notes": "Swiss sausage"},
    {"name": "Worcestershire Sauce","unit": "EL",  "grams_per_unit": 17.0, "kcal_per_100g": 124,  "fat_per_100g": 0.1,   "carb_per_100g": 29.4, "protein_per_100g": 1.4,  "notes": "Worcestershire sauce"},
    {"name": "Sauerteigbrot",       "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 210,  "fat_per_100g": 0.9,   "carb_per_100g": 39.0, "protein_per_100g": 6.5,  "notes": "Rye bread with sour dough"},
    {"name": "Berglinsen",          "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 324,  "fat_per_100g": 1.5,   "carb_per_100g": 44.8, "protein_per_100g": 24.4, "notes": "Lentil whole, dried"},
    {"name": "Quinoa",              "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 362,  "fat_per_100g": 6.6,   "carb_per_100g": 58.2, "protein_per_100g": 13.3, "notes": "Quinoa, raw"},
    {"name": "Tomaten Sugo",        "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 69,   "fat_per_100g": 2.1,   "carb_per_100g": 9.7,  "protein_per_100g": 1.8,  "notes": "Tomato sauce"},
    {"name": "Honig",               "unit": "EL",  "grams_per_unit": 21.0, "kcal_per_100g": 306,  "fat_per_100g": 0.0,   "carb_per_100g": 76.0, "protein_per_100g": 0.4,  "notes": "Honey from flowers"},
    {"name": "Kaffeerahm",          "unit": "EL",  "grams_per_unit": 15.0, "kcal_per_100g": 161,  "fat_per_100g": 15.0,  "carb_per_100g": 3.8,  "protein_per_100g": 2.6,  "notes": "Coffee cream UHT"},
    {"name": "Kaffee",              "unit": "ml",  "grams_per_unit": 1.0,  "kcal_per_100g": 2,    "fat_per_100g": 0.0,   "carb_per_100g": 0.3,  "protein_per_100g": 0.1,  "notes": "Coffee black"},
    {"name": "Mozzarella",          "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 256,  "fat_per_100g": 19.5,  "carb_per_100g": 0.7,  "protein_per_100g": 19.5, "notes": "Mozzarella"},
    {"name": "Feta",                "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 281,  "fat_per_100g": 24.3,  "carb_per_100g": 0.7,  "protein_per_100g": 14.8, "notes": "Feta ewe/goat milk"},
    {"name": "Rohkäse",             "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 376,  "fat_per_100g": 30.2,  "carb_per_100g": 0.0,  "protein_per_100g": 25.6, "notes": "Raw milk cheese (Tilsiter proxy)"},
    {"name": "Parmesan",            "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 401,  "fat_per_100g": 31.0,  "carb_per_100g": 0.0,  "protein_per_100g": 30.5, "notes": "Parmesan cheese"},
    {"name": "Raclette",            "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 357,  "fat_per_100g": 27.9,  "carb_per_100g": 0.0,  "protein_per_100g": 25.9, "notes": "Raclette cheese"},
    {"name": "Eier",                "unit": "Ei",  "grams_per_unit": 55.0, "kcal_per_100g": 140,  "fat_per_100g": 9.8,   "carb_per_100g": 0.3,  "protein_per_100g": 12.6, "notes": "Egg raw whole, 1 Ei ≈ 55g"},
    {"name": "Gnocchi",             "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 177,  "fat_per_100g": 2.1,   "carb_per_100g": 33.6, "protein_per_100g": 5.0,  "notes": "Potato gnocchi cooked"},
    {"name": "Zwiebeln",            "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 39,   "fat_per_100g": 0.6,   "carb_per_100g": 6.3,  "protein_per_100g": 1.1,  "notes": "Onion raw"},
    {"name": "Knoblauch",           "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 107,  "fat_per_100g": 0.5,   "carb_per_100g": 16.3, "protein_per_100g": 6.4,  "notes": "Garlic raw"},
    {"name": "Butter",              "unit": "EL",  "grams_per_unit": 14.0, "kcal_per_100g": 747,  "fat_per_100g": 82.5,  "carb_per_100g": 0.6,  "protein_per_100g": 0.4,  "notes": "Butter, dairy"},
    {"name": "Olivenöl",            "unit": "EL",  "grams_per_unit": 14.0, "kcal_per_100g": 900,  "fat_per_100g": 100.0, "carb_per_100g": 0.0,  "protein_per_100g": 0.0,  "notes": "Olive oil"},
    {"name": "Leinöl",              "unit": "EL",  "grams_per_unit": 14.0, "kcal_per_100g": 900,  "fat_per_100g": 100.0, "carb_per_100g": 0.0,  "protein_per_100g": 0.0,  "notes": "Flaxseed oil cold pressed"},
    {"name": "Essig",               "unit": "EL",  "grams_per_unit": 15.0, "kcal_per_100g": 21,   "fat_per_100g": 0.0,   "carb_per_100g": 0.7,  "protein_per_100g": 0.1,  "notes": "Vinegar"},
    {"name": "Pfeffer",             "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 251,  "fat_per_100g": 3.3,   "carb_per_100g": 38.7, "protein_per_100g": 10.4, "notes": "Black pepper"},
    {"name": "Cayenne Pfeffer",     "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 318,  "fat_per_100g": 17.3,  "carb_per_100g": 34.0, "protein_per_100g": 12.0, "notes": "Cayenne pepper"},
    {"name": "Curry Gewürz",        "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 325,  "fat_per_100g": 14.0,  "carb_per_100g": 35.0, "protein_per_100g": 14.0, "notes": "Curry powder"},
    {"name": "Bouillon",            "unit": "ml",  "grams_per_unit": 1.0,  "kcal_per_100g": 5,    "fat_per_100g": 0.3,   "carb_per_100g": 0.2,  "protein_per_100g": 0.3,  "notes": "Meat bouillon prepared"},
    {"name": "Paprika edelsüss",    "unit": "g",   "grams_per_unit": 1.0,  "kcal_per_100g": 358,  "fat_per_100g": 13.0,  "carb_per_100g": 34.9, "protein_per_100g": 14.8, "notes": "Paprika spice"},
]

# Ingredients that need non-default grams_per_unit — applied as a patch
# so existing deployments get updated even if the table was already seeded.
UNIT_PATCHES = {name: (d["unit"], d["grams_per_unit"])
                for d in INGREDIENTS
                for name in [d["name"]]
                if d["grams_per_unit"] != 1.0}


def seed_ingredients():
    db = SessionLocal()
    try:
        if db.query(models.Ingredient).count() > 0:
            return
        for item in INGREDIENTS:
            db.add(models.Ingredient(**item))
        db.commit()
        print(f"Seeded {len(INGREDIENTS)} ingredients.")
    finally:
        db.close()


def patch_ingredient_units():
    """Update unit/grams_per_unit on already-seeded ingredients that still have defaults."""
    db = SessionLocal()
    try:
        for name, (unit, gpu) in UNIT_PATCHES.items():
            ing = db.query(models.Ingredient).filter(models.Ingredient.name == name).first()
            if ing and ing.grams_per_unit == 1.0:
                ing.unit = unit
                ing.grams_per_unit = gpu
        db.commit()
    finally:
        db.close()

import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
import models  # noqa: F401

from routers import ingredients, meals, daily_log, food_entries, workouts, sport_nutrition, user_profile, trainer

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fitness Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingredients.router)
app.include_router(meals.router)
app.include_router(daily_log.router)
app.include_router(food_entries.router)
app.include_router(workouts.router)
app.include_router(sport_nutrition.router)
app.include_router(user_profile.router)
app.include_router(trainer.router)

# Serve the built React frontend (production)
DIST = Path(__file__).parent.parent / "frontend" / "dist"
if DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        file = DIST / full_path
        if file.exists() and file.is_file():
            return FileResponse(file)
        return FileResponse(DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {"status": "ok", "docs": "/docs"}

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.routes.auth import (
    router as auth_router,
)

from backend.app.routes.inspections import (
    router as inspections_router,
)

from backend.app.routes.prediction import (
    router as prediction_router,
)

from backend.app.routes.rooms import (
    router as rooms_router,
)

from backend.app.routes.images import (
    router as images_router,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

UPLOAD_DIR = PROJECT_ROOT / "uploads"

# StaticFiles refuses to mount a missing directory, and `uploads/` is
# gitignored so it will not exist on a fresh deploy.
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Comma-separated list of browser origins allowed to call this API.
# Local dev falls back to the Vite dev server; in production set
# FRONTEND_ORIGINS on the host (e.g. Render) to the deployed frontend URL(s).
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if origin.strip()
]


app = FastAPI(
    title="Room Surface Defect Classifier API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # Also allow Vercel preview deployments (their URL changes per deploy).
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Serve uploaded inspection images

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)


# Authentication

app.include_router(
    auth_router,
    prefix="/api",
)


# Inspection routes

app.include_router(
    inspections_router,
    prefix="/api",
)


# Prediction routes

app.include_router(
    prediction_router,
    prefix="/api",
)


# Room routes

app.include_router(
    rooms_router,
    prefix="/api",
)


# Image routes

app.include_router(
    images_router,
    prefix="/api",
)


@app.get("/")
def root():

    return {
        "message": "Room Surface Defect Classifier API is running"
    }
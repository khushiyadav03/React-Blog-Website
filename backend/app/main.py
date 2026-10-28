from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database.mongodb import initialize_indexes, get_client
from app.routes_auth import router as auth_router
from app.routes_blogs import router as blogs_router
from app.routes_profiles import router as profiles_router
from app.routes_uploads import router as uploads_router
from app.routes_ml import router as ml_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_indexes()
    yield
    get_client().close()


settings = get_settings()
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app = FastAPI(title="React Blog API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(blogs_router)
app.include_router(profiles_router)
app.include_router(uploads_router)
app.include_router(ml_router)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
